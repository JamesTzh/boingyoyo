# Deploying Carouza (Scam School)

The app is two pieces that ship as **one Node service** in production:

- **Client** — a static React/Vite bundle (`npm run build` → `dist/`).
- **API server** — `server/index.ts` (Express). It calls OpenAI and, in production,
  also serves `dist/`. So one process serves both the app and `/api/*` on one origin.

## One-command production run

```bash
npm ci
npm run build        # builds dist/
OPENAI_API_KEY=sk-... npm run server   # serves app + /api on :8787 (PORT overridable)
```

Then point your host at the Node service on `$PORT`. No separate web server or proxy
is required — `/api/chat`, `/api/trace`, `/api/health` and the SPA are all same-origin.

> In **dev**, `npm run dev` runs Vite (client, :5173) and the API (:8787) together;
> Vite proxies `/api` → `:8787`. Production doesn't use that proxy.

## Secrets — how the key stays safe

- The OpenAI key is read **only** server-side via `process.env.OPENAI_API_KEY`
  (`server/llm/openai.ts`). It is **never** imported into client code and never
  bundled — verified: `grep -r sk-proj dist/` returns nothing.
- Vite only exposes vars prefixed `VITE_`. `OPENAI_API_KEY` has no such prefix, so it
  cannot leak into the browser even by accident.
- `.env` is **gitignored** (`.env`, `.env.*`, except `.env.example`). Never commit it.
- On your host (Render/Railway/Fly/Vercel-Functions/etc.), set `OPENAI_API_KEY` as an
  **environment variable / secret**, not in the repo. `.env` is only for local dev.
- `/api/health` reports `{ ai: true/false }` so you can confirm the key loaded without
  ever exposing it.

### Rotate the shared key
The key used during the event was shared in plaintext — treat it as compromised and
**rotate it** at https://platform.openai.com/api-keys before/after going public. Then set
a usage cap on the project so a leaked key can't run up a bill.

## Before a public deploy (recommended)
- **Lock down CORS**: `server/index.ts` currently uses `cors()` (any origin). Once the
  server serves the client itself, you can remove it or restrict to your domain.
- **Rate-limit `/api/*`** (e.g. `express-rate-limit`) so the key can't be abused as a
  free OpenAI proxy. Optionally add a lightweight per-session token.
- Keep `express.json({ limit: '1mb' })` (already set) to cap request size.

## Configuration

| Var | Default | Purpose |
|-----|---------|---------|
| `OPENAI_API_KEY` | — | required for live seller chat; without it, canned fallback lines are used |
| `OPENAI_MODEL` | `gpt-4o-mini` | chat/trace model |
| `AI_PROVIDER` | `openai` | provider selector |
| `PORT` | `8787` | server port |
