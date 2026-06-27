# 06 — UI / UX & Theming

The experience is a game, and games reward polish (Design/craft/taste = 20%). This spec defines the
screen map, the visual direction, the component inventory, and the theming model that keeps the app
platform-agnostic.

> During implementation, use the **`frontend-design`** skill for the actual visual execution. This
> spec sets direction and structure, not final pixels.

## 1. Screen map & flow

```
Intro / Opt-in ──▶ Marketplace feed ──▶ Listing detail ──▶ Seller chat
                         ▲                                      │
                         │                          ┌───────────┴───────────┐
                         │                       unsafe tap              report tap
                         │                          │                       │
                         │                     Gotcha (freeze)         Win screen
                         │                          │                       │
                         │                          └────────┬──────────────┘
                         │                                   ▼
                         │                            Trace report
                         │                                   │
                         └───────── back to hunt ◀───────────┤
                                                             ▼
                                               End-of-event report card
                                                             │
                                                             ▼
                                              Trust-team dashboard
```

Routes (React Router):

| Route | Screen |
|---|---|
| `/` | Intro / opt-in |
| `/feed` | Marketplace feed |
| `/listing/:id` | Listing detail |
| `/chat/:id` | Seller chat (+ gotcha/win overlays) |
| `/trace/:archetypeId` | Per-challenge trace report |
| `/report` | End-of-event report card |
| `/dashboard` | Trust-team dashboard |

A persistent **header** shows progress (challenges found/defended/remaining) and a link to the
end-of-event report.

## 2. Screen-by-screen

**Intro / opt-in** — sets consent + mission. Copy:
> **Welcome to Phish n Cheats.** During this event, fake scam listings are hidden among the real ones.
> Your mission: find all **5**. They're designed to look completely real — so stay sharp.
> [ I'm in — start hunting ]

**Marketplace feed** — a believable marketplace grid of `ListingCard`s: planted listings scattered
among genuine decoys, visually identical. Search/category chrome can be cosmetic. (`demoMode` may float
one planted listing high — see §4.)

**Listing detail** — photos, price (with a subtle "below market" cue for the counterfeit/urgency
ones), seller block, description, and a primary **"Chat with seller"** CTA. Challenge 4's listing is
framed as *the player's own listing* with a "you're selling this" banner.

**Seller chat** — the core screen:
- Message thread (`MessageBubble`, player right / seller left), typing indicator while `/api/chat`
  loads.
- Free-text input **plus** a **`QuickActionBar`** of tappable buttons surfaced from challenge data.
  `safe` (neutral), `risky` (looks enticing — engages the bait), `report` (outlined/secondary),
  `unsafe` (styled like a *tempting* primary CTA — the trap should look attractive, not scary).
- The "WhatsApp number" / "payment link" appear as **inert in-app buttons** (`risky` actions that open
  a faux prompt), never live URLs — tapping them costs Caution but isn't the fatal `unsafe` commit.

**Gotcha overlay** — background blur + shake, full-screen card:
> ⚠️ **This was a planted scam — and you were about to fall for it.**
> [ See what you missed ]

**Win overlay** —
> ✅ **Nice — you spotted the scam.**
> [ See your breakdown ]

**Trace report** — the skeleton from
[`04-grading-and-reports.md`](04-grading-and-reports.md#5-the-trace-report-hybrid-templated-skeleton--llm-lines):
outcome banner, red-flag checklist (noticed/missed), did-vs-should two-column, tips, animated score
bars. LLM lines slot in when ready.

**End-of-event report card** — animated Scam Resistance score + level; fell-for / defended /
**not-yet-found** lists; restart.

**Trust-team dashboard** — the bar chart of "which scams fool the most people," most-missed flags,
detection speed, improvement curve, and the "+ you, tonight" callout (see
[`05-data-and-dashboard.md`](05-data-and-dashboard.md#5-trust-team-dashboard-featuresdashboard)).

## 3. Visual direction

- **Tone:** confident, game-y, modern — the opposite of a grey fraud dashboard. Think a polished
  consumer marketplace skin for the buyer-facing screens, and a crisp "intelligence" aesthetic for the
  dashboard so the two halves feel distinct.
- **Two faces, one system:** buyer screens feel like shopping; the gotcha/trace/report feel like a
  game's feedback loop (badges, score bars, levels). Shared type scale and spacing keep it coherent.
- **Motion with purpose:** the **freeze** is the signature moment — everything stops, blurs, the gotcha
  slams in. Score **count-ups** and red-flag **reveals** reward attention. Framer Motion; keep it
  snappy, never blocking.
- **Legibility for the room:** large type and high contrast so a projected demo reads from the back.
- **Trap aesthetics:** `unsafe` actions must look *desirable* (the lesson is that scams look good),
  not pre-flagged as dangerous.

(Concrete palette/typography decided during implementation with `frontend-design`; the only fixed
constraint is theme-ability — next.)

## 4. Theming (`src/lib/theme.config.ts`)

Platform-agnostic is a core selling point, so brand-specific values live in one config consumed via a
React context / CSS variables — re-skinning to any marketplace is a single-file edit.

```ts
export interface ThemeConfig {
  brandName: string;          // "Marketly" (demo default)
  currency: string;           // "SGD" — injected into seller prompts too
  logo: string;               // asset path
  colors: {
    primary: string; primaryFg: string;
    bg: string; surface: string; text: string; muted: string;
    danger: string; success: string;   // gotcha / win
  };
  listingCard: 'grid' | 'list';        // listing layout style per platform
  demoMode: boolean;          // float one planted listing near the top of the feed
}
```

- `brandName`/`currency` flow into the AI seller's system prompt (see
  [`03-ai-seller.md`](03-ai-seller.md#4-prompt-structure)) so the scammer speaks in the platform's
  voice and money.
- Colours map to CSS variables consumed by Tailwind so a theme swap recolours the whole app.
- `demoMode` is the on-stage safety lever from
  [`02-challenges.md`](02-challenges.md#2-how-challenges-surface).

## 5. Assets

- **Listing photos:** a small bundled set of royalty-free/placeholder product images under
  `public/listings/` (phone, console, bag, sneakers, etc.). No external image hotlinking (demo must
  work offline).
- **Doctored payment screenshot** (Challenge 4): one crafted placeholder image with deliberately
  off details (mismatched name/amount) for the player to scrutinise.

## 6. Accessibility & responsiveness

- Keyboard-operable chat and quick-actions; visible focus states.
- Desktop-first (it's a laptop demo) but the layout shouldn't break on a tablet width. Mobile-native
  is explicitly out of scope.
- Respect `prefers-reduced-motion` — the freeze/shake degrade to a simple fade so motion-sensitive
  judges aren't affected.
