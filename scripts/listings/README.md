# Listings dataset — provenance & regeneration

This folder documents how the marketplace dataset in **`src/data/listings.ts`** was produced and how
to regenerate it. It implements the `Listing` model from
[`../../docs/specs/scam-school/05-data-and-dashboard.md`](../../docs/specs/scam-school/05-data-and-dashboard.md).

> ⚠️ **Point-in-time snapshot.** This was captured from the team's live build workspace while that
> session was still generating data. It's a working starting point — reconcile with the build's
> latest output before relying on it as final.

## What's here

| File | What it is |
|---|---|
| `listings_real.snapshot.json` | The raw capture this was generated from — 30 listings (6 planted scams + 24 genuine decoys) sourced from real public **carousell.sg** listings, repurposed for the demo. Each entry keeps its `real_listing_url`. |
| `gen-listings.py` | Generator: maps the raw capture → `src/data/listings.ts`. |

## Outputs (committed elsewhere)

- **`src/data/listings.ts`** — `export const listings: Listing[]` (the app's data).
- **`public/listings/<slug>.jpg`** — product photos (referenced by `listings.ts`), served at `/listings/...`. Per spec §6, images are bundled locally — no external hotlinking, so the demo works offline.
- **`public/listings/cards/<slug>-card.png`** — the build's pre-rendered listing-card previews, preserved here. The spec renders `ListingCard` from data, so these aren't required — kept in case they're useful.

## Regenerate

```bash
python3 scripts/listings/gen-listings.py \
  scripts/listings/listings_real.snapshot.json \
  src/data/listings.ts
```

## Mapping & caveats (raw capture → spec `Listing`)

- **Archetype IDs are normalised to the spec's `ArchetypeId`:** the capture used
  `flash_sale_urgency` → **`urgency_flash_sale`**, `counterfeit` → **`counterfeit_item`**; the others
  (`off_platform`, `deposit_before_meetup`, `fake_payment_proof`, `none`→`null`) already matched.
- **Scams** take their `price` from the fabricated `overlay.scam_price_sgd`; the captured real price
  becomes `marketPrice` (the "below market" cue). **Decoys** use the real captured price.
- **`fake_payment_proof`** (the `galaxy` listing) sets `playerIsSeller: true` — the role-flip where
  the player is the seller (spec §06 / §05).
- **Titles/prices** are parsed from the raw Carousell titles (stripping "Buyer Protection", "Free
  delivery", condition tags, embedded `S$` prices). A few title splits are imperfect — fix by hand in
  `listings.ts` if needed.
- **Synthetic decoy sellers:** 22 of the 24 decoys were captured with no seller block, so
  `gen-listings.py` synthesizes deterministic, **established-looking** seller handles + badges
  ("Member since 20XX · N reviews") — deliberately the *opposite* of the scammers' "Joined 3 days
  ago / No reviews" signals, so the feed reads as a real marketplace.
- **3 decoys** (`sneakers`, `decoy-nintendo-switch`, `decoy-coffee-machine`) had no price in the
  captured title and use believable SGD fallbacks (see `FALLBACK_PRICE` in the generator).

## Depends on

`src/data/listings.ts` imports `Listing` from `src/lib/types.ts` (owned by the app build, per spec
§05). Until that type file lands, the import won't typecheck — that's expected for this data-only PR.
