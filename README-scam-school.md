# Scam School — run

A live-demoable, gamified scam-inoculation web app. Players hunt 5 planted scam
listings, chat with an AI seller, get a deterministic "gotcha" on an unsafe action,
and receive a graded trace + end-of-event report, plus a trust-team dashboard.

## Quick start

1. `npm install`
   - In some sandboxed macOS environments esbuild's postinstall can fail; if so use
     `npm install --ignore-scripts` (the esbuild binary still works).
2. `cp .env.example .env` and set `OPENAI_API_KEY` — **optional**. The app is fully
   playable and gradable without a key: the proxy returns canned in-character seller
   lines and the trace falls back to its templated skeleton.
3. `npm run dev` — runs the Vite app on http://localhost:5173 with the AI proxy on :8787
   (Vite proxies `/api/*` → the proxy).

## Scripts

- `npm run dev` — frontend + proxy concurrently
- `npm test` — Vitest unit/behavior suite (jsdom)
- `npm run lint` — ESLint
- `npm run build` — production build
- `npm run server` — proxy only

## How it works

- Frontend-first SPA; all game state lives in-browser (Zustand + `sessionStorage`),
  no database.
- A thin Node/Express proxy holds the OpenAI key and exposes `/api/chat` + `/api/trace`
  behind a swappable `LlmProvider` (`AI_PROVIDER`).
- The intervention/gotcha decision is deterministic and client-side: it fires only on
  a tapped quick-action of type `unsafe`. The LLM never decides outcomes.
- Brand-specific values live in `src/lib/theme.config.ts` (demo defaults: `Marketly`,
  `SGD`).

## Reference

- Spec: `docs/specs/scam-school/` (files 00–06)
- Plan: `docs/plans/2026-06-27-scam-school.md`
