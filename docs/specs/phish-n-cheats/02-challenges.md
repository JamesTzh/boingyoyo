# 02 — Event Framing & The 5 Challenges

## 1. Event framing & consent

Phish n Cheats is a **time-boxed, opt-in event**. The player must explicitly opt in on an intro screen
that states the rules (full copy in [`06-ui-and-theming.md`](06-ui-and-theming.md)):

- Fake scam listings are hidden among real ones.
- The mission is to find them; they look real.
- There are **5 challenges** to complete.

This consent is what makes the planted-scam mechanic ethical and turns it into a game.

## 2. How challenges surface

**All 5 are scattered and available from the start** (locked decision). Planted listings sit among
genuine decoy listings in the feed; the player tackles them in **any order**. A challenge is
"completed" when the player **defends** (spots + reports) or is **scammed** (takes the unsafe action)
— either outcome closes it and produces a trace. The end-of-event report nudges the player toward
challenges they **haven't found yet**.

> **Demo safety net:** because all are open, the demo driver can simply navigate to a known planted
> listing. No need to rely on the judge stumbling onto one. The feed ordering can optionally float
> one planted listing near the top via `theme.config.ts` (`demoMode: true`).

## 3. Anatomy of a challenge

Every archetype is defined by the same shape (the TypeScript form is in
[`05-data-and-dashboard.md`](05-data-and-dashboard.md); the seller prompt in
[`03-ai-seller.md`](03-ai-seller.md)):

- **`id`** — stable archetype key.
- **Listing** — title, price, market price, photos, seller name/badges, description. Visually
  indistinguishable from a genuine listing; the red flags are *subtle and in-character*.
- **Seller persona & conversation beats** — the escalation script the AI follows.
- **Red flags** — the catalogue of warning signs, each with a short teaching explanation
  (surfaced in the trace report).
- **Unsafe action(s)** — the concrete control(s) that, when tapped, fire the gotcha.
- **Defend condition** — what counts as correctly handling it (report + decline).
- **Safe quick-actions** — non-triggering replies the player can also tap (e.g. "Can we meet in
  person first?") that keep the chat going without losing.

## 4. The quick-action model (how intervention stays deterministic)

The chat offers the player **tappable quick-action buttons** alongside free-text input. Each button
is typed:

- `safe` — a sensible buyer move (ask to inspect, ask for proof, decline politely).
- `risky` — engages the bait *without* the fatal commit (e.g. opening the inert "WhatsApp" prompt or
  the "payment link" screen). Continues the chat but is logged as a **soft-risky engagement** that
  costs Caution points (see [`04-grading-and-reports.md`](04-grading-and-reports.md#3-per-challenge-scoring-scam-resistance-0100)).
- `report` — opens the report flow → **defend** path.
- `unsafe` — the trap's final commit (pay off-platform, send deposit, etc.) → **gotcha** path.

Free-typed messages are sent to the AI seller and **never** trigger intervention by themselves (the
trigger is a concrete tap). This is the deterministic guarantee from
[`04-grading-and-reports.md`](04-grading-and-reports.md). The AI seller's job is to make the `unsafe`
button *tempting*, not to decide outcomes.

---

## 5. The archetypes

### Challenge 1 — Off-platform transaction

| | |
|---|---|
| **id** | `off_platform` |
| **Listing** | Fair-priced mid-range phone (e.g. priced at market, not suspiciously low). Seller "very responsive." |
| **Seller persona** | Friendly, helpful, slightly impatient. |
| **Conversation beats** | Warm greeting → "I get a lot of messages here, it's easier if we chat on WhatsApp/Telegram" → shares a number/handle → frames off-platform as faster/safer. |
| **Red flags** | Moving off-platform; "easier to talk there"; leaving buyer protection; reluctance to keep it in-app. |
| **Unsafe action** | Tap **"Continue on WhatsApp"** (or open the shared external link). |
| **Defend** | Decline + **Report** ("I'll keep it on the platform"). |
| **Safe quick-actions** | "Let's keep it here", "Why move off-platform?" |

### Challenge 2 — Flash-sale / urgency trap

| | |
|---|---|
| **id** | `urgency_flash_sale` |
| **Listing** | Unbelievable deal with a **countdown timer** and **"Only 1 left!"** badge. |
| **Seller persona** | High-pressure, lots of "🔥", scarcity language. |
| **Conversation beats** | "Loads of people asking" → "I can hold it only if you pay in the next 10 min" → drops a **payment link** → escalates urgency if the player hesitates. |
| **Red flags** | Artificial scarcity; countdown pressure; price far below market; external payment link; rushing payment before any verification. |
| **Unsafe action** | Tap **"Pay now"** (under the timer) or **click the payment link**. |
| **Defend** | Refuse to be rushed + **Report**. |
| **Safe quick-actions** | "I won't be rushed", "Why the time limit?" |

### Challenge 3 — Deposit-before-meetup

| | |
|---|---|
| **id** | `deposit_before_meetup` |
| **Listing** | High-value item suited to local meetup (e.g. game console, bike, camera). |
| **Seller persona** | Plausible, "lots of interest," wants "serious buyers only." |
| **Conversation beats** | "Many people interested" → "send a \$X deposit to hold it for you" → "I only meet serious buyers" → resists meeting before deposit. |
| **Red flags** | Upfront deposit before any inspection; "hold it" pressure; no meetup arranged yet; deposit to an unknown account. |
| **Unsafe action** | Tap **"Send deposit"**. |
| **Defend** | Insist on inspect/meet first, refuse deposit + **Report**. |
| **Safe quick-actions** | "Can we meet first?", "I'll pay on collection." |

### Challenge 4 — Fake payment proof  *(role-flip: the player is the seller)*

> This is the **one challenge where the player is the seller**, because the scam (a doctored payment
> screenshot to trigger premature shipping/release) only makes sense from the seller's side. The intro
> for this listing makes the role explicit: *"You're selling this item. A buyer just messaged you."*
> It's still buyer-education — it teaches that a screenshot is not proof of payment.

| | |
|---|---|
| **id** | `fake_payment_proof` |
| **Listing** | An item the **player is selling** (their own listing in the feed). |
| **Buyer persona** | Eager, polite, in a hurry to receive the item. |
| **Conversation beats** | "I've paid already, look!" → sends a **doctored payment screenshot** → "please ship today / release it now" → pressures before funds are verified. |
| **Red flags** | Payment "proof" is a **screenshot**, not an in-app/official confirmation; can't be found in the real transaction record; urgency to ship; mismatched names/amounts/timestamps in the image. |
| **Unsafe action** | Tap **"Mark as shipped" / "Release item"** based on the screenshot alone. |
| **Defend** | Verify in the official payment record, refuse to ship + **Report**. |
| **Safe quick-actions** | "I don't see the payment yet", "I'll ship once it clears." |

### Challenge 5 — Counterfeit / too-good-to-be-true

| | |
|---|---|
| **id** | `counterfeit_item` |
| **Listing** | Branded item (e.g. luxury bag, sneakers, earbuds) priced **far below market**; subtle red flags in **photos and details** (stock-looking photos, vague "100% original / authentic", no receipt, minor typos). |
| **Seller persona** | Evasive about authenticity, "trust me," deflects proof requests. |
| **Conversation beats** | Pushes the bargain → when asked for authentication, dodges ("it's real, my cousin's") → discourages verification → nudges a quick purchase. |
| **Red flags** | Price far below market; stock/inconsistent photos; no proof of authenticity; evasive answers; "authentic" claims without evidence. |
| **Unsafe action** | Tap **"Buy now"** without verifying authenticity. |
| **Defend** | Spot the counterfeit cues, decline + **Report**. |
| **Safe quick-actions** | "Can you show the receipt/serial?", "Why so cheap?" |

---

## 6. Genuine decoy listings

The feed also contains **genuine (non-planted) listings** so the planted ones don't stand out by
absence. Decoys reuse the same `ListingCard`; their `isPlanted = false` and `archetypeId = null`.
Opening a decoy and chatting yields a normal, safe seller (a benign canned/AI reply) and **no
challenge** — reinforcing that not everything is a trap. A small set (~8–12) is enough for the demo
feed to feel real.

## 7. Tuning notes

- Five is the **target count** — feels complete but achievable. The set is tunable; archetypes are
  data (`src/data/challenges.ts`), so adding/removing one is a data edit, not a code change.
- Per the PRD, **1–2 crafted listings per archetype** is enough for the MVP. LLM-generated listings
  on demand is a documented **stretch goal**, not MVP.
