#!/usr/bin/env python3
"""Generate src/data/listings.ts (spec Listing[]) from a listings_real.json snapshot.

Snapshot source: the team's live build workspace (carousell.sg captures).
Maps the raw capture schema -> the Listing type in docs/specs/scam-school/05-data-and-dashboard.md.
"""
import json, re, sys, io

SRC = sys.argv[1] if len(sys.argv) > 1 else "asset-snapshot/listings_real.json"
OUT = sys.argv[2] if len(sys.argv) > 2 else "listings.ts"

# friends' capture archetype keys -> canonical spec ArchetypeId
ARCH = {
    "flash_sale_urgency": "urgency_flash_sale",
    "counterfeit": "counterfeit_item",
    "deposit_before_meetup": "deposit_before_meetup",
    "off_platform": "off_platform",
    "fake_payment_proof": "fake_payment_proof",
    "none": None,
}
CONDITIONS = {"brand new", "like new", "well used", "lightly used", "used",
              "pristine", "new", "excellent", "good condition", "good"}
NOISE = {"buyer protection", "free delivery"}
# Decoys whose captured title carried no S$ price — believable SGD fallbacks so the feed reads real.
FALLBACK_PRICE = {"sneakers": 140, "decoy-nintendo-switch": 120, "decoy-coffee-machine": 900}

# The 22 `decoy-*` captures have overlay=null (product + price + photo only). Synthesize
# deterministic, *legit-looking* seller metadata so the type is satisfied and the feed reads as a
# real marketplace (established sellers — the opposite of the scammers' "joined 3 days ago").
DECOY_HANDLES = [
    "jh_declutter", "weekend_finds_sg", "marcus_sells", "clear_my_room", "thrift_corner_sg",
    "queenstown_deals", "tampines_resell", "yishun_clearout", "bargain_bin_sg", "movingout_sale",
    "gadget_pasar", "home_refresh_sg", "secondround_sg", "the_attic_sg", "casa_clearance",
    "minimalist_moves", "spruce_resell", "nextdoor_deals", "cleanout_crew", "preloved_pavilion",
    "eastside_finds", "northloop_sale",
]
LOCATIONS = [
    "Tampines · 6.0km", "Jurong · 12.3km", "Bishan · 2.4km", "Punggol · 9.1km", "Queenstown · 3.8km",
    "Clementi · 4.2km", "Yishun · 14.0km", "Bedok · 5.7km", "Serangoon · 3.1km", "Woodlands · 16.5km",
    "Ang Mo Kio · 1.9km", "Bukit Timah · 7.4km",
]


def stable_seed(s):
    return sum((i + 1) * ord(c) for i, c in enumerate(s))


def synth_seller(slug, condition, handle_idx):
    seed = stable_seed(slug)
    year = 2018 + (seed % 6)
    reviews = 12 + (seed % 140)
    loc = LOCATIONS[seed % len(LOCATIONS)]
    msg = f"{condition or 'Good condition'}, happy to meet for viewing."
    return {
        "handle": DECOY_HANDLES[handle_idx % len(DECOY_HANDLES)],
        "badges": [f"Member since {year} · {reviews} reviews", loc],
        "message": msg,
    }


def parse_title_price(real_title):
    t = re.sub(r"\*[^*]*\*", " ", real_title)          # drop *emphasis*
    segs = [s.strip() for s in t.split("/") if s.strip()]
    price, condition, names = None, None, []
    for s in segs:
        low = s.lower()
        m = re.fullmatch(r"S\$\s?([\d,]+)", s)
        if m:
            price = int(m.group(1).replace(",", "")); continue
        if low in NOISE:
            continue
        if low in CONDITIONS:
            condition = s; continue
        s2 = re.sub(r"S\$\s?[\d,]+", "", s).strip(" -")
        if s2:
            names.append(s2)
    if price is None:
        m = re.search(r"S\$\s?([\d,]+)", real_title)
        if m:
            price = int(m.group(1).replace(",", ""))
    title = max(names, key=len) if names else real_title.strip()
    return title, price, condition


def ts_str(s):
    if s is None:
        return "undefined"
    return '"' + str(s).replace("\\", "\\\\").replace('"', '\\"') + '"'


def emit(item):
    arch = ARCH[item["archetype"]]
    is_scam = item["is_scam"]
    overlay = item.get("overlay") or {}
    title, real_price, condition = parse_title_price(item["real_title"])
    slug = item["slug"]
    photo = "/listings/" + item["raw_photo"].split("/")[-1]

    if is_scam:
        price = overlay.get("scam_price_sgd") or real_price or 0
        market = real_price if real_price and real_price != price else None
    else:
        price = real_price or FALLBACK_PRICE.get(slug, 0)
        market = None

    seller = item["_seller"]
    badges = seller["badges"]
    desc = seller["message"]

    lines = ["  {"]
    lines.append(f"    id: {ts_str(slug)},")
    lines.append(f"    archetypeId: {ts_str(arch) if arch else 'null'},")
    lines.append(f"    isPlanted: {'true' if is_scam else 'false'},")
    lines.append(f"    title: {ts_str(title)},")
    lines.append(f"    price: {price},")
    if market:
        lines.append(f"    marketPrice: {market},")
    lines.append('    currency: "SGD",')
    lines.append(f"    photos: [{ts_str(photo)}],")
    lines.append(f"    sellerName: {ts_str(seller['handle'])},")
    if badges:
        lines.append("    sellerBadges: [" + ", ".join(ts_str(b) for b in badges) + "],")
    lines.append(f"    description: {ts_str(desc)},")
    if item["archetype"] == "fake_payment_proof":
        lines.append("    playerIsSeller: true,")
    lines.append("  },")
    return "\n".join(lines)


def main():
    data = json.load(open(SRC))
    listings = data["listings"]
    hidx = 0
    for x in listings:
        overlay = x.get("overlay") or {}
        if overlay.get("seller_handle"):
            x["_seller"] = {
                "handle": overlay["seller_handle"],
                "badges": [b for b in (overlay.get("seller_age"), overlay.get("location")) if b],
                "message": overlay.get("opening_message") or "Available — message me to deal.",
            }
        else:
            _, _, cond = parse_title_price(x["real_title"])
            x["_seller"] = synth_seller(x["slug"], cond, hidx)
            hidx += 1
    body = "\n".join(emit(x) for x in listings)
    header = (
        "// AUTO-GENERATED point-in-time snapshot of the marketplace dataset.\n"
        "// Source: team build workspace capture of carousell.sg (real public listings,\n"
        "// repurposed for the demo). Regenerate: see scripts/listings/README.md.\n"
        "// Depends on the Listing type from docs/specs/scam-school/05 (src/lib/types.ts).\n"
        f"// {data.get('counts', {})}\n\n"
        "import type { Listing } from '../lib/types';\n\n"
        "export const listings: Listing[] = [\n"
    )
    out = header + body + "\n];\n\nexport default listings;\n"
    io.open(OUT, "w", encoding="utf-8").write(out)
    scams = sum(1 for x in listings if x["is_scam"])
    print(f"wrote {OUT}: {len(listings)} listings ({scams} planted, {len(listings)-scams} decoys)")


if __name__ == "__main__":
    main()
