# 04 — Intervention, Grading & Reports

Covers: how intervention fires, the gotcha/win screens, the per-challenge Scam Resistance scoring,
the hybrid trace report, and the end-of-event report card.

## 1. Intervention: deterministic, client-side

Each chat quick-action carries a type (from `src/data/challenges.ts`):

- `safe` → appends a player message, continues the chat. Each safe action maps to the **red flag it
  probes** (used later for "flags noticed").
- `risky` → appends a player message and continues, but increments `softRiskyEngagements` (costs
  Caution). These are the bait-engaging-but-not-fatal taps (e.g. opening the inert WhatsApp/payment
  screen).
- `report` → resolves the challenge as **`defended`** → win screen → trace.
- `unsafe` → resolves the challenge as **`scammed`** → freeze → gotcha → trace.

The detector is a pure dispatcher; no LLM is in this path, so the gotcha is **100% predictable**:

```ts
// features/intervention/useUnsafeActionDetector.ts (shape)
function onQuickAction(action: QuickAction, ctx: ChallengeContext) {
  recordSignal(ctx, action);                 // turns, soft-risky engagements, flags probed
  if (action.type === 'unsafe')      resolve(ctx, 'scammed');   // → GotchaModal
  else if (action.type === 'report') resolve(ctx, 'defended');  // → WinScreen
  else appendPlayerMessage(ctx, action.label);                  // safe | risky → continue
}
```

Free-typed messages never resolve a challenge — they only go to the AI seller. (Optional stretch:
an intent check on free text, explicitly **off** for the MVP to protect demo reliability.)

## 2. The gotcha & win screens

- **Gotcha (scammed):** the instant an `unsafe` action fires, the flow **freezes** — background blurs,
  a full-screen overlay animates in: **"⚠️ This was a planted scam — and you were about to fall for
  it."** A "See what you missed" button leads to the trace report. (Framer Motion for the freeze/shake.)
- **Win (defended):** report fires a celebratory screen — **"Nice — you spotted the scam."** — then
  "See your breakdown" → trace report.

Both screens are short; the substance is in the trace.

## 3. Per-challenge scoring (Scam Resistance, 0–100)

Pure functions in `src/lib/scoring.ts` (unit-tested with Vitest). The score combines three components
matching the approved split — **Detection 60 / Caution 25 / Speed 15**:

**Signals captured per challenge** (see [`05-data-and-dashboard.md`](05-data-and-dashboard.md)):

- `outcome`: `'defended' | 'scammed'`
- `unsafeTaps`: count of `unsafe` actions tapped (0 if defended; 1 if scammed — we freeze on first)
- `softRiskyEngagements`: count of risky-but-not-fatal taps (e.g. opening the off-platform prompt,
  viewing the payment-link screen) before resolving
- `turnsToResolve`: number of player turns before defend/scam
- `redFlagsNoticed`: distinct red flags the player probed — derived from tapped `safe` quick-actions
  (each maps to a flag) and, optionally, augmented by the `/api/trace` LLM analysis of free text

**Formulas:**

```
detection = outcome === 'defended'
              ? 60
              : min(30, 10 * redFlagsNoticed)          // scammed-but-aware partial credit, cap 30

caution   = clamp(25 - 20 * unsafeTaps - 10 * softRiskyEngagements, 0, 25)

speed     = outcome === 'defended'
              ? clamp(15 - 3 * max(0, turnsToResolve - 2), 0, 15)
              : 0

score     = clamp(detection + caution + speed, 0, 100)
```

**Worked examples:**

| Play | detection | caution | speed | total |
|---|---|---|---|---|
| Defend, ≤2 turns, no risky taps | 60 | 25 | 15 | **100** |
| Defend, 5 turns, 1 soft-risky tap | 60 | 15 | 6 | **81** |
| Scammed, probed 2 flags first | 20 | 5 | 0 | **25** |
| Scammed instantly, unaware | 0 | 5 | 0 | **5** |

## 4. Event score & level

```
eventScore = mean(score over ATTEMPTED challenges)   // unattempted excluded
```

Unattempted challenges show as **"not yet found"** and don't drag the score down — this keeps a single
strong play-through looking good while the report nudges coverage. (Alternative "completion-weighted"
variant: mean over all 5 with unattempted = 0 — documented but **not** the default.)

**Level mapping:**

| Score | Level |
|---|---|
| 0–39 | Rookie |
| 40–59 | Aware |
| 60–79 | Sharp |
| 80–100 | Guardian |

## 5. The trace report (hybrid: templated skeleton + LLM lines)

Every trace renders **instantly from a templated skeleton**, then LLM-personalised lines are slotted
in when they arrive. If the LLM call fails/times out, the generic skeleton lines stand — the trace is
always complete.

**Skeleton (always present, no LLM):**

1. **Outcome banner** — defended ✅ / scammed ⚠️ + the challenge name.
2. **Red flags** — the archetype's full red-flag list, each marked **noticed** vs **missed** (from
   `redFlagsNoticed`), each with its one-line teaching explanation (`src/data/redFlags.ts`).
3. **What you did vs. what you should have done** — two columns; the "should" side is the archetype's
   canonical safe play.
4. **Best-practice tips** — 2–3 per archetype, pre-written.
5. **Score breakdown** — Detection / Caution / Speed bars + total + level delta.

**LLM-personalised lines (slotted in, fallback-safe) — from `/api/trace`:**

- `summaryLine` — one sentence on how they did, in plain language.
- `momentLine` — references the actual transcript: *"When the seller said 'pay in 10 minutes', you
  replied 'ok how do I pay' — that was the moment the urgency worked on you."*
- `redFlagNotes[]` *(optional)* — a personalised note per red flag.
- `tipsPersonalized[]` *(optional)* — tips reworded to the player's behaviour.

### `/api/trace` contract

```
POST /api/trace
Request:
{
  "archetypeId": "urgency_flash_sale",
  "outcome": "scammed",
  "transcript": [ { "role": "player"|"seller", "text": "..." }, ... ],
  "signals": { "turnsToResolve": 4, "unsafeTaps": 1, "softRiskyEngagements": 1, "redFlagsNoticed": 1 }
}
Response:
{
  "summaryLine": "...",
  "momentLine": "...",
  "redFlagNotes": [ { "redFlagId": "countdown_pressure", "note": "..." } ],
  "tipsPersonalized": [ "..." ]
}
```

Generated at temperature ~0.4 for consistency. On error/timeout the client uses the skeleton's
generic equivalents — see the graceful-degradation note in
[`03-ai-seller.md`](03-ai-seller.md#7-latency--failure-handling).

## 6. End-of-event report card

Reachable any time from the header and auto-offered after each resolution. Shows:

- **Scam Resistance score + level** (animated count-up; Framer Motion).
- **Scams you fell for** — the archetypes resolved as `scammed`, each linking back to its trace.
- **Scams you defended** — resolved as `defended`.
- **Scams you haven't found yet** — `unseen`/`unattempted` archetypes, framed as a to-do ("Go hunt
  these to complete your training") — the replay/coverage driver from the PRD.
- A **"share / restart"** affordance (restart clears the session store).

This is the personal half of the demo's one-two punch; the platform half is the dashboard in
[`05-data-and-dashboard.md`](05-data-and-dashboard.md).
