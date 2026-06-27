# 01 — Architecture & Tech Stack

> Architecture decision: **frontend-first single-page app + a thin AI proxy, no database.**

## 1. Why this shape

The MVP is a single polished play-through demoed live. There's no cross-session persistence, no
accounts, no real payments (scope, [`00-overview.md`](00-overview.md#10-scope)). The only thing that
*cannot* live in the browser is the OpenAI API key. So:

- **All game logic and state run in the browser** — fast to build, nothing to provision, nothing to
  break on stage.
- **One tiny server** exists solely to hold the API key and proxy LLM calls.

This maximises demo reliability (the rubric's Functionality 25%) and build speed.

## 2. Tech stack

| Layer | Choice | Notes |
|---|---|---|
| Language | **TypeScript** | End-to-end types across app + proxy |
| Build/dev | **Vite** | Instant HMR, fast cold start |
| UI framework | **React 18** | Ubiquitous, component-friendly |
| Styling | **Tailwind CSS** | Fast path to a polished, game-y look; optional `shadcn/ui` for modal/card/dialog primitives |
| Routing | **React Router** | Feed / listing / chat / report / dashboard |
| State | **Zustand** | One small store; `sessionStorage` persistence middleware so a refresh mid-demo doesn't reset progress |
| Animation | **Framer Motion** | Gotcha freeze, score count-up, card reveals (taste = 20%) |
| AI proxy | **Node + Express** | `/server`; holds the key; `POST /api/chat`, `POST /api/trace` |
| LLM SDK | **`openai`** (official) | Wrapped in a `LlmProvider` interface — swap to Claude/others in one file |
| Model | Fast OpenAI chat model via `OPENAI_MODEL` env | Latency matters live; streaming is a stretch goal |
| Tests | **Vitest** | Pure-logic only: scoring engine, unsafe-action detection |
| Lint/format | **ESLint + Prettier** | Standard config |
| Package manager | **npm** (pnpm fine) | No preference enforced |

**Why OpenAI** despite being in the Anthropic ecosystem: it's the hackathon's judged **sponsor tech**
and the centrepiece. The `LlmProvider` abstraction (see [`03-ai-seller.md`](03-ai-seller.md)) makes
switching to Claude or any other provider a one-file change, so this is a default, not a lock-in.

## 3. Data flow

```
┌──────────────────────────────── Browser (SPA) ─────────────────────────────────┐
│  Marketplace feed ──tap──▶ Listing detail ──open chat──▶ Seller chat            │
│        │                                                     │                  │
│        │                              player taps a quick-action button         │
│        │                                                     │                  │
│        ▼                                                     ▼                  │
│  Zustand store  ◀── unsafe? ── Intervention detector ── safe action? ── append  │
│   (EventSession, ChallengeState, messages, signals)         │                  │
│        │                                                     │                  │
│        │  unsafe ▶ freeze ▶ Gotcha ▶ Grading engine ▶ Trace report             │
│        │  report ▶ Defended ▶ Grading engine ▶ Trace report                    │
│        ▼                                                                        │
│  End-of-event report  ·  Trust-team dashboard (seeds + this session)            │
└──────────────┬───────────────────────────────────────────────┬────────────────┘
               │ POST /api/chat  { archetypeId, history, theme } │ POST /api/trace
               ▼                                                  ▼
        ┌───────────────────────── Express proxy (/server) ─────────────────────┐
        │  LlmProvider (OpenAI)  ──▶  OpenAI API   (OPENAI_API_KEY, server-only) │
        └───────────────────────────────────────────────────────────────────────┘
```

- The **intervention decision is made client-side** and deterministically: each unsafe quick-action
  button carries an `unsafe: true` flag (see [`04-grading-and-reports.md`](04-grading-and-reports.md)).
  The LLM does **not** decide when to fire the gotcha — that keeps the demo predictable.
- The proxy is **stateless**: the browser sends the full conversation `history` each call.

## 4. Repo structure

The existing skills bundle (`.claude/`, `.agents/`, `README.md`, etc.) is **untouched**. New app code:

```
src/
  app/
    App.tsx              # router + providers + theme
    routes.tsx
    providers/           # store provider, theme provider
  features/
    marketplace/         # FeedGrid, ListingCard, ListingDetail
    chat/                # ChatScreen, MessageBubble, QuickActionBar
    intervention/        # GotchaModal, useUnsafeActionDetector
    grading/             # scoring.ts, TraceReport
    report/              # EndOfEventCard
    dashboard/           # TrustDashboard, charts
  data/
    challenges.ts        # 5 archetype definitions (see 02 + 03)
    listings.ts          # genuine decoy listings + planted ones
    seeds.ts             # seeded aggregate stats for the dashboard
    redFlags.ts          # red-flag catalogue per archetype
  lib/
    types.ts             # shared data model (see 05)
    store.ts             # zustand store + sessionStorage middleware
    scoring.ts           # pure scoring functions (unit-tested)
    api.ts               # typed client for /api/chat + /api/trace
    theme.config.ts      # platform-agnostic theming
  main.tsx
server/
  index.ts               # express app, CORS, routes
  routes/chat.ts         # POST /api/chat
  routes/trace.ts        # POST /api/trace
  llm/provider.ts        # LlmProvider interface
  llm/openai.ts          # OpenAI implementation
  prompts/               # per-archetype system prompts (see 03)
docs/specs/scam-school/  # these spec files
.env.example             # OPENAI_API_KEY=, OPENAI_MODEL=, AI_PROVIDER=openai, PORT=
index.html
package.json
vite.config.ts
tailwind.config.ts
tsconfig.json
```

## 5. Environment & secrets

`.env` is already gitignored. Required vars (ship a committed `.env.example`):

```
OPENAI_API_KEY=sk-...        # server-only, never exposed to the browser
OPENAI_MODEL=gpt-4o-mini     # or whichever fast model is preferred; configurable
AI_PROVIDER=openai           # selects the LlmProvider implementation
PORT=8787                    # proxy port
VITE_API_BASE=http://localhost:8787   # browser → proxy base URL
```

Only `VITE_*` vars reach the browser bundle; the key never does.

## 6. Running it

- `npm install`
- `npm run dev` — runs the Vite dev server **and** the Express proxy concurrently (via
  `concurrently` or `npm-run-all`); Vite proxies `/api/*` to `PORT` so the browser sees one origin.
- `npm run build` — frontend production build.
- `npm test` — Vitest (scoring + unsafe-action logic).

## 7. Deployment (optional, post-hackathon)

The proxy maps cleanly to a serverless function: `server/routes/chat.ts` and `trace.ts` become
`/api/chat` and `/api/trace` on Vercel/Netlify with the same env vars. No code restructuring needed
because the proxy is already stateless and thin. For the demo, **local is fine and preferred** (no
network surprises on stage).

## 8. Non-goals for the architecture

No database, no auth, no message queue, no server-side session store, no analytics pipeline. If any
of these is ever wanted, the data model in [`05-data-and-dashboard.md`](05-data-and-dashboard.md) is
already shaped to drop into a store, but that's explicitly out of scope here.
