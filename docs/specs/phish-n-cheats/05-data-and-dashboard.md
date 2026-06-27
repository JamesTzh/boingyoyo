# 05 — Data Model, Telemetry & Trust-Team Dashboard

All state is in-browser (Zustand + `sessionStorage`); there is no database (see
[`01-architecture.md`](01-architecture.md)). This spec defines the types, the signals each play emits,
and the trust-team dashboard that turns those signals into intelligence.

## 1. Core types (`src/lib/types.ts`)

```ts
export type ArchetypeId =
  | 'off_platform'
  | 'urgency_flash_sale'
  | 'deposit_before_meetup'
  | 'fake_payment_proof'
  | 'counterfeit_item';

export type ChallengeStatus = 'unseen' | 'in_progress' | 'defended' | 'scammed';

export interface Listing {
  id: string;
  archetypeId: ArchetypeId | null;   // null = genuine decoy
  isPlanted: boolean;                // true only for the 5 challenge listings
  title: string;
  price: number;
  marketPrice?: number;              // for "far below market" cues
  currency: string;
  photos: string[];                  // local asset paths
  sellerName: string;
  sellerBadges?: string[];           // e.g. "Verified", "Quick replies"
  description: string;
  playerIsSeller?: boolean;          // true only for fake_payment_proof (role-flip)
}

export interface Message {
  id: string;
  role: 'player' | 'seller' | 'system';
  text: string;
  ts: number;
  viaFallback?: boolean;             // true if the seller line came from the canned fallback
}

export type QuickActionType =
  | 'safe'      // neutral good move; continues chat
  | 'risky'     // engages the bait without the fatal commit; logged as a softRiskyEngagement
  | 'report'    // → defended
  | 'unsafe';   // the trap → gotcha

export interface QuickAction {
  id: string;
  label: string;                     // e.g. "Send deposit"
  type: QuickActionType;
  probesRedFlagId?: string;          // for `safe` actions: which red flag this surfaces
}

export interface RedFlag {
  id: string;
  archetypeId: ArchetypeId;
  label: string;                     // e.g. "Pressure to move off-platform"
  explanation: string;               // one-line teaching note for the trace
}

export interface ChallengeSignals {
  turnsToResolve: number;
  unsafeTaps: number;
  softRiskyEngagements: number;
  redFlagsNoticed: number;
  redFlagIdsNoticed: string[];
}

export interface ScoreBreakdown {
  detection: number;                 // 0–60
  caution: number;                   // 0–25
  speed: number;                     // 0–15
  total: number;                     // 0–100
}

export interface TraceReport {
  outcome: ChallengeStatus;          // 'defended' | 'scammed'
  redFlags: { flag: RedFlag; noticed: boolean }[];
  didVsShould: { did: string[]; should: string[] };
  tips: string[];
  score: ScoreBreakdown;
  // LLM-personalised (optional; template fallback used if absent)
  summaryLine?: string;
  momentLine?: string;
}

export interface ChallengeState {
  archetypeId: ArchetypeId;
  status: ChallengeStatus;
  listingId: string;
  messages: Message[];
  signals: ChallengeSignals;
  score?: ScoreBreakdown;
  trace?: TraceReport;
}

export interface EventSession {
  id: string;
  startedAt: number;
  theme: { brandName: string; currency: string };
  challenges: Record<ArchetypeId, ChallengeState>;
  eventScore: number;                // mean over attempted
  level: 'Rookie' | 'Aware' | 'Sharp' | 'Guardian';
}
```

## 2. The store (`src/lib/store.ts`)

A single Zustand store holds the `EventSession` plus actions:

- `startEvent(theme)` — initialise the 5 `ChallengeState`s as `unseen`.
- `openChallenge(archetypeId)` — set `in_progress`.
- `appendMessage(...)`, `recordSignal(...)`.
- `resolveChallenge(archetypeId, outcome)` — compute `score` (via `scoring.ts`), build the `TraceReport`
  skeleton, then async-fill LLM lines from `/api/trace`.
- `recomputeEvent()` — update `eventScore` + `level`.

`sessionStorage` persistence middleware so a mid-demo refresh restores progress. No cross-session
persistence (out of scope) — closing the tab/restarting clears it.

## 3. Telemetry signals (the intelligence feed)

Each resolved challenge contributes one **play record** — the unit the dashboard aggregates:

```ts
export interface PlayRecord {
  archetypeId: ArchetypeId;
  outcome: 'defended' | 'scammed';
  turnsToResolve: number;
  redFlagIdsNoticed: string[];
  redFlagIdsMissed: string[];
  score: number;                     // total 0–100
  order: number;                     // 1st, 2nd… challenge this session (for improvement curve)
}
```

These derive entirely from `ChallengeState` — no extra capture code. In the live demo, the current
session's `PlayRecord`s are merged onto the seeded baseline (next section).

## 4. Aggregate shape & seeds (`src/data/seeds.ts`)

The dashboard reads `AggregateStat[]` — one per archetype — computed from seeds **+** the live
session's `PlayRecord`s:

```ts
export interface AggregateStat {
  archetypeId: ArchetypeId;
  attempts: number;
  fellForCount: number;
  fellForRate: number;               // fellForCount / attempts
  avgDetectTurns: number;            // mean turnsToResolve among defended
  mostMissedFlags: { redFlagId: string; missRate: number }[];  // top 3
}
```

`src/data/seeds.ts` ships a realistic **seeded baseline** (e.g. ~120 synthetic plays) so the dashboard
looks populated on first load — with `fellForRate` varying by archetype (urgency & off-platform
fooling the most, counterfeit the least, say). A pure `aggregate(seeds, livePlays)` function
(unit-testable) folds the live session in so the judge sees their own play move the numbers.

## 5. Trust-team dashboard (`features/dashboard/`)

A single, polished screen — the platform half of the demo's one-two punch. It shows:

- **"Which scams fool the most people"** — a horizontal bar chart of `fellForRate` by archetype,
  sorted descending. The headline view.
- **Most-missed red flags** — across archetypes, the flags with the highest `missRate` (where attention
  training should focus).
- **Hesitation / detection speed** — `avgDetectTurns` per archetype (where players struggle longest).
- **Resistance improvement** — mean `score` by `order` (1st challenge vs. later) — evidence the event
  *teaches*, the success metric from [`00-overview.md`](00-overview.md#4-goals--success-metrics).
- **"+ you, tonight"** — a small callout that the current session's plays are included live, so the
  judge sees their contribution.

Charts can be lightweight (Tailwind/SVG bars or a tiny chart lib). No backend — everything is computed
in-browser from seeds + session. Per the PRD this may be "a single mocked screen"; here it's seeded
**and** live-augmented, which demos stronger without adding a database.

## 6. Why this shape scales later (non-goal note)

`PlayRecord` and `AggregateStat` are deliberately storage-shaped: if persistence is ever wanted, plays
POST to a backend and `aggregate()` runs server-side unchanged. That migration is **out of scope** —
noted only so the data model doesn't have to be redesigned later.
