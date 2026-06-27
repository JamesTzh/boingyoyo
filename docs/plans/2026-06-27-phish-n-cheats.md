# Phish n Cheats Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a live-demoable, gamified scam-inoculation web app where players hunt 5 planted scam listings, chat with an AI seller, get a deterministic "gotcha" when they take an unsafe action, and receive a graded trace + end-of-event report, plus a trust-team dashboard.

**Architecture:** A React + Vite + TypeScript single-page app holds all game state in-browser (Zustand + sessionStorage). A tiny Node/Express proxy holds the OpenAI key and exposes `/api/chat` and `/api/trace` behind a swappable `LlmProvider`. The intervention/gotcha decision is made deterministically client-side on a tapped `unsafe` quick-action — the LLM never decides outcomes. Everything degrades gracefully to a fully playable, fully gradable session with zero LLM availability.

**Tech Stack:** TypeScript, Vite, React 18, React Router v6, Tailwind CSS, Zustand, Framer Motion, Node + Express, `openai` SDK, Vitest + @testing-library/react, ESLint + Prettier, `concurrently`.

**Spec:** Full design in [`docs/specs/phish-n-cheats/`](../specs/phish-n-cheats/00-overview.md) (files 00–06). Each task below cites the spec section it implements.

## Global Constraints

- **Language:** TypeScript end-to-end (app + proxy). `strict: true`.
- **Secret safety:** `OPENAI_API_KEY` is server-only. Only `VITE_*` env vars may reach the browser bundle; the key never does.
- **Deterministic intervention:** the gotcha fires only on a tapped quick-action of type `unsafe`. The LLM never decides outcomes. Free-typed chat never resolves a challenge.
- **Quick-action types:** exactly `safe | risky | report | unsafe`.
- **Archetype ids:** exactly `off_platform`, `urgency_flash_sale`, `deposit_before_meetup`, `fake_payment_proof`, `counterfeit_item`.
- **Scoring split:** Detection 60 / Caution 25 / Speed 15. Formulas are fixed (Task 5). Level mapping: 0–39 Rookie · 40–59 Aware · 60–79 Sharp · 80–100 Guardian. `eventScore = mean over attempted challenges`.
- **AI seller:** short in-character messages; never reveals it's a game/AI/scam; `max_tokens ≈ 220`; `temperature ≈ 0.8`. Trace generation `temperature ≈ 0.4`.
- **Graceful degradation:** on LLM error/timeout the proxy returns a canned in-character fallback line; the trace falls back to its templated skeleton. The app stays fully playable + gradable.
- **No database / no persistence:** state lives in-browser (Zustand + `sessionStorage`); no cross-session persistence.
- **Offline-safe demo:** no live external URLs. The "WhatsApp number" / "payment link" are inert in-app `risky` affordances. Listing images are bundled under `public/`.
- **Theming:** all brand-specific values live in `src/lib/theme.config.ts`. Demo defaults: `brandName: "Marketly"`, `currency: "SGD"`. `brandName`/`currency` are injected into seller prompts.
- **Desktop-first**, but must not break at tablet width. Respect `prefers-reduced-motion`.

---

## File structure

```
src/
  main.tsx                      # React entry
  app/
    App.tsx                     # ThemeProvider + Router + Header + Routes
    Header.tsx                  # progress chips + link to report
    ThemeProvider.tsx           # React context wrapping theme.config
  features/
    marketplace/
      FeedScreen.tsx
      ListingCard.tsx
      ListingDetailScreen.tsx
    chat/
      ChatScreen.tsx
      MessageBubble.tsx
      QuickActionBar.tsx
    intervention/
      GotchaModal.tsx
      WinScreen.tsx
    grading/
      TraceScreen.tsx
    report/
      ReportScreen.tsx
    intro/
      IntroScreen.tsx
    dashboard/
      DashboardScreen.tsx
  lib/
    types.ts                    # all shared types (spec 05)
    theme.config.ts             # ThemeConfig + demo default
    scoring.ts                  # pure scoring (spec 04)
    intervention.ts             # outcomeForAction / isRisky helpers
    aggregate.ts                # aggregate(seeds, live) (spec 05)
    store.ts                    # zustand store + sessionStorage
    api.ts                      # typed client for /api/chat + /api/trace
  data/
    redFlags.ts                 # red-flag catalogue (spec 02/04)
    challenges.ts               # 5 archetype definitions + quick-actions
    listings.ts                 # planted listings + decoys
    seeds.ts                    # seeded PlayRecords for the dashboard
server/
  index.ts                      # express bootstrap + CORS
  handlers.ts                   # pure handleChat/handleTrace + composeSellerMessages
  prompts.ts                    # base persona, per-archetype scripts, fallbacks
  llm/
    provider.ts                 # LlmProvider interface + ChatTurn
    openai.ts                   # OpenAI implementation
    factory.ts                  # selects provider from AI_PROVIDER
tests/                          # Vitest specs mirror src/ + server/
```

---

## Task 1: Project scaffold & toolchain

**Files:**
- Create: `package.json`, `vite.config.ts`, `tsconfig.json`, `tsconfig.node.json`, `tailwind.config.ts`, `postcss.config.js`, `index.html`, `.env.example`, `.eslintrc.cjs`, `.prettierrc`, `src/main.tsx`, `src/app/App.tsx`, `src/index.css`, `vitest.config.ts`, `tests/setup.ts`, `tests/smoke.test.ts`

**Interfaces:**
- Produces: a booting Vite app, `npm run dev` (frontend + proxy concurrently), `npm test` (Vitest + jsdom), Tailwind utility classes.

- [ ] **Step 1: Create `package.json`**

```json
{
  "name": "phish-n-cheats",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "concurrently -k -n web,api -c blue,magenta \"vite\" \"tsx watch server/index.ts\"",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "server": "tsx server/index.ts",
    "test": "vitest run",
    "test:watch": "vitest",
    "lint": "eslint . --ext .ts,.tsx",
    "format": "prettier --write ."
  },
  "dependencies": {
    "framer-motion": "^11.3.0",
    "openai": "^4.56.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.26.0",
    "zustand": "^4.5.4"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "^6.4.8",
    "@testing-library/react": "^16.0.0",
    "@testing-library/user-event": "^14.5.2",
    "@types/cors": "^2.8.17",
    "@types/express": "^4.17.21",
    "@types/node": "^22.5.0",
    "@types/react": "^18.3.4",
    "@types/react-dom": "^18.3.0",
    "@typescript-eslint/eslint-plugin": "^8.3.0",
    "@typescript-eslint/parser": "^8.3.0",
    "@vitejs/plugin-react": "^4.3.1",
    "concurrently": "^8.2.2",
    "cors": "^2.8.5",
    "eslint": "^8.57.0",
    "eslint-plugin-react-hooks": "^4.6.2",
    "express": "^4.19.2",
    "jsdom": "^25.0.0",
    "prettier": "^3.3.3",
    "tailwindcss": "^3.4.10",
    "autoprefixer": "^10.4.20",
    "postcss": "^8.4.41",
    "tsx": "^4.19.0",
    "typescript": "^5.5.4",
    "vite": "^5.4.2",
    "vitest": "^2.0.5"
  }
}
```

- [ ] **Step 2: Install dependencies**

Run: `npm install`
Expected: completes, `node_modules/` populated, no peer-dep errors that block install.

- [ ] **Step 3: Create config files**

`tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "useDefineForClassFields": true,
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "Bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "baseUrl": ".",
    "paths": { "@/*": ["src/*"] },
    "types": ["vitest/globals", "@testing-library/jest-dom"]
  },
  "include": ["src", "server", "tests"]
}
```

`vite.config.ts`:
```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
  resolve: { alias: { '@': path.resolve(__dirname, 'src') } },
  server: {
    port: 5173,
    proxy: { '/api': 'http://localhost:8787' },
  },
});
```

`vitest.config.ts`:
```ts
import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  resolve: { alias: { '@': path.resolve(__dirname, 'src') } },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
  },
});
```

`tailwind.config.ts`:
```ts
import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: 'var(--brand-primary)',
        'brand-fg': 'var(--brand-primary-fg)',
        surface: 'var(--brand-surface)',
        danger: 'var(--brand-danger)',
        success: 'var(--brand-success)',
      },
    },
  },
  plugins: [],
} satisfies Config;
```

`postcss.config.js`:
```js
export default { plugins: { tailwindcss: {}, autoprefixer: {} } };
```

`.env.example`:
```
OPENAI_API_KEY=sk-your-key-here
OPENAI_MODEL=gpt-4o-mini
AI_PROVIDER=openai
PORT=8787
```

`.eslintrc.cjs`:
```js
module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'react-hooks'],
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
  env: { browser: true, node: true, es2022: true },
  rules: { 'react-hooks/rules-of-hooks': 'error', 'react-hooks/exhaustive-deps': 'warn' },
  ignorePatterns: ['dist', 'node_modules'],
};
```

`.prettierrc`:
```json
{ "singleQuote": true, "semi": true, "printWidth": 100 }
```

- [ ] **Step 4: Create the app entry & shell**

`index.html`:
```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Phish n Cheats</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

`src/index.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --brand-primary: #2563eb;
  --brand-primary-fg: #ffffff;
  --brand-surface: #ffffff;
  --brand-danger: #dc2626;
  --brand-success: #16a34a;
}
body { @apply bg-slate-50 text-slate-900; }
```

`src/main.tsx`:
```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './app/App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
```

`src/app/App.tsx` (temporary placeholder, replaced in Task 12):
```tsx
export default function App() {
  return <h1 className="p-8 text-2xl font-bold">Phish n Cheats</h1>;
}
```

- [ ] **Step 5: Create the test setup & smoke test**

`tests/setup.ts`:
```ts
import '@testing-library/jest-dom';
```

`tests/smoke.test.ts`:
```ts
import { describe, it, expect } from 'vitest';

describe('toolchain', () => {
  it('runs vitest', () => {
    expect(1 + 1).toBe(2);
  });
});
```

- [ ] **Step 6: Verify the toolchain**

Run: `npm test`
Expected: `tests/smoke.test.ts` PASS (1 passed).

Run: `npm run dev` then open `http://localhost:5173`
Expected: page shows "Phish n Cheats". Stop the dev server (Ctrl-C) after confirming.

- [ ] **Step 7: Add `.gitignore` entries & commit**

Append to the existing `.gitignore`:
```
node_modules/
dist/
```

```bash
git add package.json package-lock.json vite.config.ts vitest.config.ts tsconfig.json tailwind.config.ts postcss.config.js .eslintrc.cjs .prettierrc .env.example index.html .gitignore src/ tests/
git commit -m "chore: scaffold Vite + React + TS + Tailwind + Vitest toolchain"
```

---

## Task 2: Shared types & theme config

**Files:**
- Create: `src/lib/types.ts`, `src/lib/theme.config.ts`, `tests/lib/theme.test.ts`

**Interfaces:**
- Produces: all shared types (`ArchetypeId`, `ChallengeStatus`, `Listing`, `Message`, `QuickAction`, `QuickActionType`, `RedFlag`, `ChallengeSignals`, `ScoreBreakdown`, `TraceReport`, `ChallengeState`, `EventSession`, `PlayRecord`, `AggregateStat`, `ChatRequest`, `ChatResponse`, `TraceRequest`, `TraceResponse`, `Level`); `defaultTheme: ThemeConfig`, `ThemeConfig`.

- [ ] **Step 1: Write the types file**

`src/lib/types.ts`:
```ts
export type ArchetypeId =
  | 'off_platform'
  | 'urgency_flash_sale'
  | 'deposit_before_meetup'
  | 'fake_payment_proof'
  | 'counterfeit_item';

export const ARCHETYPE_IDS: ArchetypeId[] = [
  'off_platform',
  'urgency_flash_sale',
  'deposit_before_meetup',
  'fake_payment_proof',
  'counterfeit_item',
];

export type ChallengeStatus = 'unseen' | 'in_progress' | 'defended' | 'scammed';
export type Level = 'Rookie' | 'Aware' | 'Sharp' | 'Guardian';

export interface Listing {
  id: string;
  archetypeId: ArchetypeId | null;
  isPlanted: boolean;
  title: string;
  price: number;
  marketPrice?: number;
  currency: string;
  photos: string[];
  sellerName: string;
  sellerBadges?: string[];
  description: string;
  playerIsSeller?: boolean;
}

export interface Message {
  id: string;
  role: 'player' | 'seller' | 'system';
  text: string;
  ts: number;
  viaFallback?: boolean;
}

export type QuickActionType = 'safe' | 'risky' | 'report' | 'unsafe';

export interface QuickAction {
  id: string;
  label: string;
  type: QuickActionType;
  probesRedFlagId?: string;
}

export interface RedFlag {
  id: string;
  archetypeId: ArchetypeId;
  label: string;
  explanation: string;
}

export interface ChallengeSignals {
  turnsToResolve: number;
  unsafeTaps: number;
  softRiskyEngagements: number;
  redFlagsNoticed: number;
  redFlagIdsNoticed: string[];
}

export interface ScoreBreakdown {
  detection: number;
  caution: number;
  speed: number;
  total: number;
}

export interface TraceReport {
  outcome: ChallengeStatus;
  redFlags: { flag: RedFlag; noticed: boolean }[];
  didVsShould: { did: string[]; should: string[] };
  tips: string[];
  score: ScoreBreakdown;
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
  eventScore: number;
  level: Level;
}

export interface PlayRecord {
  archetypeId: ArchetypeId;
  outcome: 'defended' | 'scammed';
  turnsToResolve: number;
  redFlagIdsNoticed: string[];
  redFlagIdsMissed: string[];
  score: number;
  order: number;
}

export interface AggregateStat {
  archetypeId: ArchetypeId;
  attempts: number;
  fellForCount: number;
  fellForRate: number;
  avgDetectTurns: number;
  mostMissedFlags: { redFlagId: string; missRate: number }[];
}

// ---- API contracts (mirrored in server/handlers.ts) ----
export interface ChatRequest {
  archetypeId: ArchetypeId;
  theme: { brandName: string; currency: string };
  listing: { title: string; price: number; playerIsSeller?: boolean };
  history: { role: 'player' | 'seller'; text: string }[];
}
export interface ChatResponse {
  reply: string;
  viaFallback?: boolean;
}
export interface TraceRequest {
  archetypeId: ArchetypeId;
  outcome: 'defended' | 'scammed';
  transcript: { role: 'player' | 'seller'; text: string }[];
  signals: Pick<ChallengeSignals, 'turnsToResolve' | 'unsafeTaps' | 'softRiskyEngagements' | 'redFlagsNoticed'>;
}
export interface TraceResponse {
  summaryLine: string;
  momentLine: string;
}

export interface ThemeConfig {
  brandName: string;
  currency: string;
  logo: string;
  colors: {
    primary: string;
    primaryFg: string;
    bg: string;
    surface: string;
    text: string;
    muted: string;
    danger: string;
    success: string;
  };
  listingCard: 'grid' | 'list';
  demoMode: boolean;
}
```

- [ ] **Step 2: Write the theme config**

`src/lib/theme.config.ts`:
```ts
import type { ThemeConfig } from './types';

export const defaultTheme: ThemeConfig = {
  brandName: 'Marketly',
  currency: 'SGD',
  logo: '/logo.svg',
  colors: {
    primary: '#2563eb',
    primaryFg: '#ffffff',
    bg: '#f8fafc',
    surface: '#ffffff',
    text: '#0f172a',
    muted: '#64748b',
    danger: '#dc2626',
    success: '#16a34a',
  },
  listingCard: 'grid',
  demoMode: true,
};
```

- [ ] **Step 3: Write the failing test**

`tests/lib/theme.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { defaultTheme } from '@/lib/theme.config';
import { ARCHETYPE_IDS } from '@/lib/types';

describe('theme + constants', () => {
  it('ships the demo brand defaults', () => {
    expect(defaultTheme.brandName).toBe('Marketly');
    expect(defaultTheme.currency).toBe('SGD');
  });
  it('declares exactly 5 archetypes', () => {
    expect(ARCHETYPE_IDS).toHaveLength(5);
  });
});
```

- [ ] **Step 4: Run the test**

Run: `npm test -- theme`
Expected: PASS (2 passed).

- [ ] **Step 5: Commit**

```bash
git add src/lib/types.ts src/lib/theme.config.ts tests/lib/theme.test.ts
git commit -m "feat: shared types and theme config"
```

---

## Task 3: Red flags & challenge data

Implements spec [`02-challenges.md`](../specs/phish-n-cheats/02-challenges.md) §5 and the red-flag catalogue.

**Files:**
- Create: `src/data/redFlags.ts`, `src/data/challenges.ts`, `tests/data/challenges.test.ts`

**Interfaces:**
- Consumes: `RedFlag`, `QuickAction`, `ArchetypeId` from `@/lib/types`.
- Produces: `RED_FLAGS: RedFlag[]`, `redFlagsFor(id): RedFlag[]`; `CHALLENGES: Record<ArchetypeId, ChallengeDef>` where `ChallengeDef = { archetypeId, quickActions: QuickAction[], didVsShould: {did, should}, tips: string[] }`; `challengeDef(id): ChallengeDef`.

- [ ] **Step 1: Write the red-flag catalogue**

`src/data/redFlags.ts`:
```ts
import type { RedFlag, ArchetypeId } from '@/lib/types';

export const RED_FLAGS: RedFlag[] = [
  { id: 'off_platform_pressure', archetypeId: 'off_platform', label: 'Pushing the deal off-platform', explanation: 'Moving to WhatsApp/Telegram removes buyer protection and monitoring.' },
  { id: 'urgency_pressure', archetypeId: 'urgency_flash_sale', label: 'Artificial urgency & countdown', explanation: 'Scarcity and time limits are designed to stop you thinking.' },
  { id: 'external_payment_link', archetypeId: 'urgency_flash_sale', label: 'External payment link', explanation: 'Pay only through the platform; outside links bypass protection.' },
  { id: 'price_too_low_urgency', archetypeId: 'urgency_flash_sale', label: 'Price too good to be true', explanation: 'Unrealistic prices are bait to rush you.' },
  { id: 'deposit_before_inspection', archetypeId: 'deposit_before_meetup', label: 'Deposit before inspection', explanation: "Never pay to 'hold' an item you haven't seen." },
  { id: 'hold_it_pressure', archetypeId: 'deposit_before_meetup', label: "'Lots of interest' pressure", explanation: 'Manufactured competition rushes your decision.' },
  { id: 'screenshot_not_proof', archetypeId: 'fake_payment_proof', label: "Screenshot as 'proof'", explanation: 'A screenshot can be faked; verify in the official record.' },
  { id: 'ship_before_cleared', archetypeId: 'fake_payment_proof', label: 'Rushed to ship before funds clear', explanation: 'Only ship after payment actually appears in your account.' },
  { id: 'price_too_low', archetypeId: 'counterfeit_item', label: 'Far below market price', explanation: 'Deep discounts on branded goods signal fakes.' },
  { id: 'no_authenticity_proof', archetypeId: 'counterfeit_item', label: 'No proof of authenticity', explanation: 'Genuine sellers can show receipts or serial numbers.' },
  { id: 'evasive_seller', archetypeId: 'counterfeit_item', label: 'Evasive about authenticity', explanation: 'Dodging verification questions is a red flag.' },
];

export function redFlagsFor(id: ArchetypeId): RedFlag[] {
  return RED_FLAGS.filter((f) => f.archetypeId === id);
}
```

- [ ] **Step 2: Write the challenge definitions**

`src/data/challenges.ts`:
```ts
import type { ArchetypeId, QuickAction } from '@/lib/types';

export interface ChallengeDef {
  archetypeId: ArchetypeId;
  quickActions: QuickAction[];
  didVsShould: { did: string[]; should: string[] };
  tips: string[];
}

export const CHALLENGES: Record<ArchetypeId, ChallengeDef> = {
  off_platform: {
    archetypeId: 'off_platform',
    quickActions: [
      { id: 'op_safe', label: "Let's keep it on the app", type: 'safe', probesRedFlagId: 'off_platform_pressure' },
      { id: 'op_risky', label: 'View their WhatsApp number', type: 'risky' },
      { id: 'op_report', label: 'Report this seller', type: 'report' },
      { id: 'op_unsafe', label: 'Message them on WhatsApp', type: 'unsafe' },
    ],
    didVsShould: {
      did: ['Followed the seller toward an off-platform chat.'],
      should: ['Kept all communication and payment on the platform, where you are protected.'],
    },
    tips: [
      'Real sellers are fine staying on the platform — pressure to move off is the warning.',
      'Off-platform = no buyer protection if it goes wrong.',
    ],
  },
  urgency_flash_sale: {
    archetypeId: 'urgency_flash_sale',
    quickActions: [
      { id: 'uf_safe', label: "I won't be rushed", type: 'safe', probesRedFlagId: 'urgency_pressure' },
      { id: 'uf_risky', label: 'Open the payment link', type: 'risky' },
      { id: 'uf_report', label: 'Report this listing', type: 'report' },
      { id: 'uf_unsafe', label: 'Pay now', type: 'unsafe' },
    ],
    didVsShould: {
      did: ['Let the countdown and scarcity rush you toward paying.'],
      should: ['Slowed down, ignored the timer, and paid only through the platform.'],
    },
    tips: ['Urgency is a tactic, not a fact.', 'A genuine deal survives you taking five minutes to think.'],
  },
  deposit_before_meetup: {
    archetypeId: 'deposit_before_meetup',
    quickActions: [
      { id: 'dm_safe1', label: 'Can we meet first?', type: 'safe', probesRedFlagId: 'deposit_before_inspection' },
      { id: 'dm_safe2', label: "I'll pay on collection", type: 'safe', probesRedFlagId: 'hold_it_pressure' },
      { id: 'dm_report', label: 'Report this seller', type: 'report' },
      { id: 'dm_unsafe', label: 'Send deposit', type: 'unsafe' },
    ],
    didVsShould: {
      did: ['Agreed to send a deposit before seeing the item.'],
      should: ['Insisted on inspecting at meetup and paying only on collection.'],
    },
    tips: ['Never pay a deposit to "hold" an item you have not inspected.', '"Lots of interest" is pressure, not proof.'],
  },
  fake_payment_proof: {
    archetypeId: 'fake_payment_proof',
    quickActions: [
      { id: 'fp_safe', label: "I don't see the payment yet", type: 'safe', probesRedFlagId: 'screenshot_not_proof' },
      { id: 'fp_risky', label: 'View the screenshot', type: 'risky' },
      { id: 'fp_report', label: 'Report this buyer', type: 'report' },
      { id: 'fp_unsafe', label: 'Mark as shipped', type: 'unsafe' },
    ],
    didVsShould: {
      did: ['Shipped based on a payment screenshot.'],
      should: ['Confirmed the funds actually arrived in your account before shipping.'],
    },
    tips: ['A screenshot is not money — check your real transaction record.', 'Never ship until payment has cleared.'],
  },
  counterfeit_item: {
    archetypeId: 'counterfeit_item',
    quickActions: [
      { id: 'cf_safe1', label: 'Show me the receipt/serial', type: 'safe', probesRedFlagId: 'no_authenticity_proof' },
      { id: 'cf_safe2', label: 'Why so cheap?', type: 'safe', probesRedFlagId: 'price_too_low' },
      { id: 'cf_report', label: 'Report this listing', type: 'report' },
      { id: 'cf_unsafe', label: 'Buy now', type: 'unsafe' },
    ],
    didVsShould: {
      did: ['Bought a branded item without verifying authenticity.'],
      should: ['Asked for proof of authenticity and walked away when the seller dodged.'],
    },
    tips: ['If a branded item is far below market, assume it is fake until proven otherwise.', 'Genuine sellers can prove authenticity.'],
  },
};

export function challengeDef(id: ArchetypeId): ChallengeDef {
  return CHALLENGES[id];
}
```

- [ ] **Step 3: Write the failing test**

`tests/data/challenges.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { CHALLENGES } from '@/data/challenges';
import { redFlagsFor } from '@/data/redFlags';
import { ARCHETYPE_IDS } from '@/lib/types';

describe('challenge data', () => {
  it('defines every archetype with exactly one unsafe and one report action', () => {
    for (const id of ARCHETYPE_IDS) {
      const def = CHALLENGES[id];
      expect(def).toBeTruthy();
      expect(def.quickActions.filter((a) => a.type === 'unsafe')).toHaveLength(1);
      expect(def.quickActions.filter((a) => a.type === 'report')).toHaveLength(1);
    }
  });
  it('every safe action probes an existing red flag for its archetype', () => {
    for (const id of ARCHETYPE_IDS) {
      const flagIds = redFlagsFor(id).map((f) => f.id);
      for (const a of CHALLENGES[id].quickActions) {
        if (a.type === 'safe') expect(flagIds).toContain(a.probesRedFlagId);
      }
    }
  });
});
```

- [ ] **Step 4: Run the test**

Run: `npm test -- challenges`
Expected: PASS (2 passed).

- [ ] **Step 5: Commit**

```bash
git add src/data/redFlags.ts src/data/challenges.ts tests/data/challenges.test.ts
git commit -m "feat: red-flag catalogue and 5 challenge definitions"
```

---

## Task 4: Listings (planted + decoys)

Implements spec [`02-challenges.md`](../specs/phish-n-cheats/02-challenges.md) §5–6.

**Files:**
- Create: `src/data/listings.ts`, `tests/data/listings.test.ts`
- Note: place placeholder images under `public/listings/` (any bundled jpg/png; filenames must match `photos` below). A single faux payment screenshot at `public/listings/payment-proof.png`.

**Interfaces:**
- Consumes: `Listing`, `ArchetypeId`.
- Produces: `LISTINGS: Listing[]`, `listingById(id): Listing | undefined`, `plantedListingFor(archetypeId): Listing`.

- [ ] **Step 1: Write the listings data**

`src/data/listings.ts`:
```ts
import type { Listing, ArchetypeId } from '@/lib/types';

const CUR = 'SGD';

export const LISTINGS: Listing[] = [
  // ---- Planted (the 5 challenges) ----
  {
    id: 'p-off',
    archetypeId: 'off_platform',
    isPlanted: true,
    title: 'iPhone 14, 128GB, great condition',
    price: 720,
    marketPrice: 750,
    currency: CUR,
    photos: ['/listings/phone.jpg'],
    sellerName: 'kevin_deals',
    sellerBadges: ['Quick replies'],
    description: 'Selling my iPhone 14, barely used. Message me, I reply fast!',
  },
  {
    id: 'p-urg',
    archetypeId: 'urgency_flash_sale',
    isPlanted: true,
    title: 'PS5 Slim BNIB — FLASH SALE 🔥',
    price: 199,
    marketPrice: 650,
    currency: CUR,
    photos: ['/listings/console.jpg'],
    sellerName: 'gamerdrop_sg',
    sellerBadges: ['Only 1 left!'],
    description: 'Brand new sealed PS5 Slim. Crazy price, going FAST. Pay to lock it in!',
  },
  {
    id: 'p-dep',
    archetypeId: 'deposit_before_meetup',
    isPlanted: true,
    title: 'Specialized road bike, like new',
    price: 880,
    marketPrice: 950,
    currency: CUR,
    photos: ['/listings/bike.jpg'],
    sellerName: 'cycle_jane',
    sellerBadges: [],
    description: 'Great bike, lots of interest. Serious buyers only please.',
  },
  {
    id: 'p-pay',
    archetypeId: 'fake_payment_proof',
    isPlanted: true,
    playerIsSeller: true,
    title: 'YOUR LISTING: Nintendo Switch OLED',
    price: 320,
    currency: CUR,
    photos: ['/listings/switch.jpg'],
    sellerName: 'you',
    sellerBadges: ['Your listing'],
    description: 'You are selling this item. A buyer has just messaged you.',
  },
  {
    id: 'p-cnt',
    archetypeId: 'counterfeit_item',
    isPlanted: true,
    title: 'Louis Vuitton Neverful (authentic!)',
    price: 250,
    marketPrice: 2200,
    currency: CUR,
    photos: ['/listings/bag.jpg'],
    sellerName: 'luxe_finds88',
    sellerBadges: [],
    description: '100% original LV bag, overseas purchase. No box. Trust me, real deal!',
  },
  // ---- Genuine decoys ----
  { id: 'd-1', archetypeId: null, isPlanted: false, title: 'IKEA desk lamp', price: 12, currency: CUR, photos: ['/listings/lamp.jpg'], sellerName: 'home_clearout', description: 'Working lamp, minor scratches. Self-collect.' },
  { id: 'd-2', archetypeId: null, isPlanted: false, title: 'Uniqlo down jacket, M', price: 35, currency: CUR, photos: ['/listings/jacket.jpg'], sellerName: 'wardrobe_reset', description: 'Worn a few times, clean. Meetup at MRT.' },
  { id: 'd-3', archetypeId: null, isPlanted: false, title: 'Dyson V8 vacuum', price: 240, marketPrice: 260, currency: CUR, photos: ['/listings/vacuum.jpg'], sellerName: 'sgcleanhome', sellerBadges: ['Verified'], description: 'Strong suction, comes with attachments.' },
  { id: 'd-4', archetypeId: null, isPlanted: false, title: 'Coffee table, solid wood', price: 60, currency: CUR, photos: ['/listings/table.jpg'], sellerName: 'movingout_sg', description: 'Sturdy table. Collect this weekend.' },
  { id: 'd-5', archetypeId: null, isPlanted: false, title: 'Kindle Paperwhite', price: 90, marketPrice: 110, currency: CUR, photos: ['/listings/kindle.jpg'], sellerName: 'bookworm22', description: 'Reads perfectly, light use.' },
  { id: 'd-6', archetypeId: null, isPlanted: false, title: 'Football boots, size 9', price: 28, currency: CUR, photos: ['/listings/boots.jpg'], sellerName: 'pitchside', description: 'Used one season, still good grip.' },
  { id: 'd-7', archetypeId: null, isPlanted: false, title: 'Office chair, ergonomic', price: 75, currency: CUR, photos: ['/listings/chair.jpg'], sellerName: 'wfh_upgrade', description: 'Comfortable, adjustable height.' },
  { id: 'd-8', archetypeId: null, isPlanted: false, title: 'Board game bundle (5 games)', price: 45, currency: CUR, photos: ['/listings/games.jpg'], sellerName: 'tabletop_sg', description: 'All complete, family-friendly.' },
];

export function listingById(id: string): Listing | undefined {
  return LISTINGS.find((l) => l.id === id);
}

export function plantedListingFor(archetypeId: ArchetypeId): Listing {
  const l = LISTINGS.find((x) => x.archetypeId === archetypeId && x.isPlanted);
  if (!l) throw new Error(`no planted listing for ${archetypeId}`);
  return l;
}
```

- [ ] **Step 2: Add placeholder images**

Place any small jpg/png images at the `photos` paths above under `public/listings/` (a single shared placeholder copied to each filename is fine for the MVP), plus `public/listings/payment-proof.png` (a faux payment screenshot with deliberately mismatched name/amount). These are bundled, not hotlinked (offline-safe).

- [ ] **Step 3: Write the failing test**

`tests/data/listings.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { LISTINGS, plantedListingFor } from '@/data/listings';
import { ARCHETYPE_IDS } from '@/lib/types';

describe('listings', () => {
  it('has exactly one planted listing per archetype', () => {
    for (const id of ARCHETYPE_IDS) {
      const planted = LISTINGS.filter((l) => l.isPlanted && l.archetypeId === id);
      expect(planted).toHaveLength(1);
    }
  });
  it('includes genuine decoys', () => {
    expect(LISTINGS.some((l) => !l.isPlanted && l.archetypeId === null)).toBe(true);
  });
  it('marks the fake-payment listing as player-as-seller', () => {
    expect(plantedListingFor('fake_payment_proof').playerIsSeller).toBe(true);
  });
});
```

- [ ] **Step 4: Run the test**

Run: `npm test -- listings`
Expected: PASS (3 passed).

- [ ] **Step 5: Commit**

```bash
git add src/data/listings.ts tests/data/listings.test.ts public/listings/
git commit -m "feat: planted and decoy listings with bundled images"
```

---

## Task 5: Scoring engine (pure, TDD)

Implements spec [`04-grading-and-reports.md`](../specs/phish-n-cheats/04-grading-and-reports.md) §3–4.

**Files:**
- Create: `src/lib/scoring.ts`, `tests/lib/scoring.test.ts`

**Interfaces:**
- Consumes: `ChallengeSignals`, `ChallengeStatus`, `ScoreBreakdown`, `Level`.
- Produces: `scoreChallenge(outcome: 'defended'|'scammed', signals: ChallengeSignals): ScoreBreakdown`; `levelFor(score: number): Level`; `eventScore(totals: number[]): number`.

- [ ] **Step 1: Write the failing test (worked examples from the spec)**

`tests/lib/scoring.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { scoreChallenge, levelFor, eventScore } from '@/lib/scoring';
import type { ChallengeSignals } from '@/lib/types';

const sig = (p: Partial<ChallengeSignals>): ChallengeSignals => ({
  turnsToResolve: 0, unsafeTaps: 0, softRiskyEngagements: 0, redFlagsNoticed: 0, redFlagIdsNoticed: [], ...p,
});

describe('scoreChallenge', () => {
  it('perfect defend = 100', () => {
    expect(scoreChallenge('defended', sig({ turnsToResolve: 2 })).total).toBe(100);
  });
  it('defend, 5 turns, 1 soft-risky = 81', () => {
    const s = scoreChallenge('defended', sig({ turnsToResolve: 5, softRiskyEngagements: 1 }));
    expect(s).toMatchObject({ detection: 60, caution: 15, speed: 6, total: 81 });
  });
  it('scammed but probed 2 flags = 25', () => {
    const s = scoreChallenge('scammed', sig({ unsafeTaps: 1, redFlagsNoticed: 2 }));
    expect(s).toMatchObject({ detection: 20, caution: 5, speed: 0, total: 25 });
  });
  it('scammed instantly, unaware = 5', () => {
    expect(scoreChallenge('scammed', sig({ unsafeTaps: 1 })).total).toBe(5);
  });
});

describe('levelFor', () => {
  it('maps score bands', () => {
    expect(levelFor(10)).toBe('Rookie');
    expect(levelFor(45)).toBe('Aware');
    expect(levelFor(72)).toBe('Sharp');
    expect(levelFor(90)).toBe('Guardian');
  });
});

describe('eventScore', () => {
  it('is the mean of attempted totals, 0 when none', () => {
    expect(eventScore([100, 50])).toBe(75);
    expect(eventScore([])).toBe(0);
  });
});
```

- [ ] **Step 2: Run the test**

Run: `npm test -- scoring`
Expected: FAIL ("scoreChallenge is not a function" / cannot find module).

- [ ] **Step 3: Write the implementation**

`src/lib/scoring.ts`:
```ts
import type { ChallengeSignals, ScoreBreakdown, Level } from './types';

const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));

export function scoreChallenge(
  outcome: 'defended' | 'scammed',
  s: ChallengeSignals,
): ScoreBreakdown {
  const detection =
    outcome === 'defended' ? 60 : Math.min(30, 10 * s.redFlagsNoticed);
  const caution = clamp(25 - 20 * s.unsafeTaps - 10 * s.softRiskyEngagements, 0, 25);
  const speed =
    outcome === 'defended' ? clamp(15 - 3 * Math.max(0, s.turnsToResolve - 2), 0, 15) : 0;
  const total = clamp(detection + caution + speed, 0, 100);
  return { detection, caution, speed, total };
}

export function levelFor(score: number): Level {
  if (score >= 80) return 'Guardian';
  if (score >= 60) return 'Sharp';
  if (score >= 40) return 'Aware';
  return 'Rookie';
}

export function eventScore(totals: number[]): number {
  if (totals.length === 0) return 0;
  return Math.round(totals.reduce((a, b) => a + b, 0) / totals.length);
}
```

- [ ] **Step 4: Run the test**

Run: `npm test -- scoring`
Expected: PASS (all assertions).

- [ ] **Step 5: Commit**

```bash
git add src/lib/scoring.ts tests/lib/scoring.test.ts
git commit -m "feat: scam-resistance scoring engine"
```

---

## Task 6: Intervention helpers (pure, TDD)

Implements the deterministic mapping in spec [`04-grading-and-reports.md`](../specs/phish-n-cheats/04-grading-and-reports.md) §1.

**Files:**
- Create: `src/lib/intervention.ts`, `tests/lib/intervention.test.ts`

**Interfaces:**
- Consumes: `QuickActionType`, `ChallengeStatus`.
- Produces: `outcomeForAction(type: QuickActionType): 'defended' | 'scammed' | null`; `isSoftRisky(type: QuickActionType): boolean`.

- [ ] **Step 1: Write the failing test**

`tests/lib/intervention.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { outcomeForAction, isSoftRisky } from '@/lib/intervention';

describe('intervention mapping', () => {
  it('unsafe → scammed, report → defended, others → null', () => {
    expect(outcomeForAction('unsafe')).toBe('scammed');
    expect(outcomeForAction('report')).toBe('defended');
    expect(outcomeForAction('safe')).toBeNull();
    expect(outcomeForAction('risky')).toBeNull();
  });
  it('only risky is soft-risky', () => {
    expect(isSoftRisky('risky')).toBe(true);
    expect(isSoftRisky('safe')).toBe(false);
    expect(isSoftRisky('unsafe')).toBe(false);
  });
});
```

- [ ] **Step 2: Run the test**

Run: `npm test -- intervention`
Expected: FAIL (module not found).

- [ ] **Step 3: Write the implementation**

`src/lib/intervention.ts`:
```ts
import type { QuickActionType } from './types';

export function outcomeForAction(type: QuickActionType): 'defended' | 'scammed' | null {
  if (type === 'unsafe') return 'scammed';
  if (type === 'report') return 'defended';
  return null;
}

export function isSoftRisky(type: QuickActionType): boolean {
  return type === 'risky';
}
```

- [ ] **Step 4: Run the test**

Run: `npm test -- intervention`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/intervention.ts tests/lib/intervention.test.ts
git commit -m "feat: deterministic intervention mapping helpers"
```

---

## Task 7: Aggregate function & seeds (TDD)

Implements spec [`05-data-and-dashboard.md`](../specs/phish-n-cheats/05-data-and-dashboard.md) §3–4.

**Files:**
- Create: `src/lib/aggregate.ts`, `src/data/seeds.ts`, `tests/lib/aggregate.test.ts`

**Interfaces:**
- Consumes: `PlayRecord`, `AggregateStat`, `ArchetypeId`, `ARCHETYPE_IDS`.
- Produces: `aggregate(plays: PlayRecord[]): AggregateStat[]`; `SEED_PLAYS: PlayRecord[]`.

- [ ] **Step 1: Write the failing test**

`tests/lib/aggregate.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { aggregate } from '@/lib/aggregate';
import type { PlayRecord } from '@/lib/types';

const play = (p: Partial<PlayRecord>): PlayRecord => ({
  archetypeId: 'off_platform', outcome: 'defended', turnsToResolve: 3,
  redFlagIdsNoticed: [], redFlagIdsMissed: [], score: 80, order: 1, ...p,
});

describe('aggregate', () => {
  it('computes fell-for rate per archetype', () => {
    const stats = aggregate([
      play({ archetypeId: 'off_platform', outcome: 'scammed' }),
      play({ archetypeId: 'off_platform', outcome: 'defended' }),
    ]);
    const op = stats.find((s) => s.archetypeId === 'off_platform')!;
    expect(op.attempts).toBe(2);
    expect(op.fellForCount).toBe(1);
    expect(op.fellForRate).toBe(0.5);
  });
  it('ranks most-missed flags by miss rate', () => {
    const stats = aggregate([
      play({ archetypeId: 'counterfeit_item', outcome: 'scammed', redFlagIdsMissed: ['price_too_low', 'evasive_seller'] }),
      play({ archetypeId: 'counterfeit_item', outcome: 'scammed', redFlagIdsMissed: ['price_too_low'] }),
    ]);
    const cf = stats.find((s) => s.archetypeId === 'counterfeit_item')!;
    expect(cf.mostMissedFlags[0].redFlagId).toBe('price_too_low');
    expect(cf.mostMissedFlags[0].missRate).toBe(1);
  });
  it('returns a row for every archetype even with zero attempts', () => {
    expect(aggregate([])).toHaveLength(5);
  });
});
```

- [ ] **Step 2: Run the test**

Run: `npm test -- aggregate`
Expected: FAIL (module not found).

- [ ] **Step 3: Write the aggregate implementation**

`src/lib/aggregate.ts`:
```ts
import type { PlayRecord, AggregateStat, ArchetypeId } from './types';
import { ARCHETYPE_IDS } from './types';

export function aggregate(plays: PlayRecord[]): AggregateStat[] {
  return ARCHETYPE_IDS.map((id) => statFor(id, plays.filter((p) => p.archetypeId === id)));
}

function statFor(archetypeId: ArchetypeId, plays: PlayRecord[]): AggregateStat {
  const attempts = plays.length;
  const fellForCount = plays.filter((p) => p.outcome === 'scammed').length;
  const defended = plays.filter((p) => p.outcome === 'defended');
  const avgDetectTurns =
    defended.length === 0
      ? 0
      : Math.round((defended.reduce((a, p) => a + p.turnsToResolve, 0) / defended.length) * 10) / 10;

  const missCounts = new Map<string, number>();
  for (const p of plays) {
    for (const id of p.redFlagIdsMissed) missCounts.set(id, (missCounts.get(id) ?? 0) + 1);
  }
  const mostMissedFlags = [...missCounts.entries()]
    .map(([redFlagId, count]) => ({ redFlagId, missRate: attempts ? count / attempts : 0 }))
    .sort((a, b) => b.missRate - a.missRate)
    .slice(0, 3);

  return {
    archetypeId,
    attempts,
    fellForCount,
    fellForRate: attempts ? fellForCount / attempts : 0,
    avgDetectTurns,
    mostMissedFlags,
  };
}
```

- [ ] **Step 4: Run the test**

Run: `npm test -- aggregate`
Expected: PASS.

- [ ] **Step 5: Write the seed data**

`src/data/seeds.ts`:
```ts
import type { PlayRecord, ArchetypeId } from '@/lib/types';
import { redFlagsFor } from './redFlags';

// Per-archetype synthetic baseline: [attempts, fellForRate] tuned so urgency &
// off-platform fool the most, counterfeit the least (spec 05 §4).
const BASELINE: Record<ArchetypeId, { attempts: number; fellForRate: number; avgTurns: number }> = {
  urgency_flash_sale: { attempts: 30, fellForRate: 0.6, avgTurns: 4 },
  off_platform: { attempts: 28, fellForRate: 0.5, avgTurns: 3 },
  fake_payment_proof: { attempts: 22, fellForRate: 0.45, avgTurns: 5 },
  deposit_before_meetup: { attempts: 24, fellForRate: 0.38, avgTurns: 4 },
  counterfeit_item: { attempts: 26, fellForRate: 0.27, avgTurns: 6 },
};

function buildFor(id: ArchetypeId): PlayRecord[] {
  const { attempts, fellForRate, avgTurns } = BASELINE[id];
  const flagIds = redFlagsFor(id).map((f) => f.id);
  const fellFor = Math.round(attempts * fellForRate);
  const out: PlayRecord[] = [];
  for (let i = 0; i < attempts; i++) {
    const scammed = i < fellFor;
    // Scammed plays miss the first flag most often (drives "most-missed").
    const missed = scammed ? flagIds.slice(0, 1 + (i % flagIds.length)) : [];
    const noticed = flagIds.filter((f) => !missed.includes(f));
    out.push({
      archetypeId: id,
      outcome: scammed ? 'scammed' : 'defended',
      turnsToResolve: avgTurns,
      redFlagIdsNoticed: noticed,
      redFlagIdsMissed: missed,
      score: scammed ? 15 : 85,
      order: 1 + (i % 5),
    });
  }
  return out;
}

export const SEED_PLAYS: PlayRecord[] = (
  Object.keys(BASELINE) as ArchetypeId[]
).flatMap(buildFor);
```

- [ ] **Step 6: Verify seeds aggregate sensibly**

Add to `tests/lib/aggregate.test.ts`:
```ts
import { SEED_PLAYS } from '@/data/seeds';

it('seed baseline ranks urgency above counterfeit for fell-for rate', () => {
  const stats = aggregate(SEED_PLAYS);
  const urg = stats.find((s) => s.archetypeId === 'urgency_flash_sale')!;
  const cnt = stats.find((s) => s.archetypeId === 'counterfeit_item')!;
  expect(urg.fellForRate).toBeGreaterThan(cnt.fellForRate);
});
```

Run: `npm test -- aggregate`
Expected: PASS (4 passed).

- [ ] **Step 7: Commit**

```bash
git add src/lib/aggregate.ts src/data/seeds.ts tests/lib/aggregate.test.ts
git commit -m "feat: dashboard aggregate function and seeded baseline"
```

---

## Task 8: LLM provider abstraction + OpenAI implementation

Implements spec [`03-ai-seller.md`](../specs/phish-n-cheats/03-ai-seller.md) §2–3.

**Files:**
- Create: `server/llm/provider.ts`, `server/llm/openai.ts`, `server/llm/factory.ts`, `tests/server/factory.test.ts`

**Interfaces:**
- Produces: `interface LlmProvider { complete(messages: ChatTurn[], opts?): Promise<string> }`; `interface ChatTurn { role: 'system'|'user'|'assistant'; content: string }`; `createOpenAiProvider(): LlmProvider`; `getProvider(): LlmProvider`.

- [ ] **Step 1: Write the provider interface**

`server/llm/provider.ts`:
```ts
export interface ChatTurn {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface LlmProvider {
  complete(messages: ChatTurn[], opts?: { temperature?: number; maxTokens?: number }): Promise<string>;
}
```

- [ ] **Step 2: Write the OpenAI implementation**

`server/llm/openai.ts`:
```ts
import OpenAI from 'openai';
import type { LlmProvider, ChatTurn } from './provider';

export function createOpenAiProvider(): LlmProvider {
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const model = process.env.OPENAI_MODEL ?? 'gpt-4o-mini';
  return {
    async complete(messages: ChatTurn[], opts) {
      const res = await client.chat.completions.create({
        model,
        messages,
        temperature: opts?.temperature ?? 0.8,
        max_tokens: opts?.maxTokens ?? 220,
      });
      return res.choices[0]?.message?.content?.trim() ?? '';
    },
  };
}
```

- [ ] **Step 3: Write the factory**

`server/llm/factory.ts`:
```ts
import type { LlmProvider } from './provider';
import { createOpenAiProvider } from './openai';

let cached: LlmProvider | null = null;

export function getProvider(): LlmProvider {
  if (cached) return cached;
  const which = process.env.AI_PROVIDER ?? 'openai';
  switch (which) {
    case 'openai':
    default:
      cached = createOpenAiProvider();
  }
  return cached;
}
```

- [ ] **Step 4: Write the failing test (factory returns a provider shape without calling OpenAI)**

`tests/server/factory.test.ts`:
```ts
import { describe, it, expect, beforeAll } from 'vitest';

describe('provider factory', () => {
  beforeAll(() => {
    process.env.OPENAI_API_KEY = 'test-key';
    process.env.AI_PROVIDER = 'openai';
  });
  it('returns a provider exposing complete()', async () => {
    const { getProvider } = await import('../../server/llm/factory');
    const p = getProvider();
    expect(typeof p.complete).toBe('function');
  });
});
```

- [ ] **Step 5: Run the test**

Run: `npm test -- factory`
Expected: PASS (constructing the OpenAI client does not make a network call).

- [ ] **Step 6: Commit**

```bash
git add server/llm/ tests/server/factory.test.ts
git commit -m "feat: LlmProvider abstraction with OpenAI implementation"
```

---

## Task 9: Prompts & fallbacks

Implements spec [`03-ai-seller.md`](../specs/phish-n-cheats/03-ai-seller.md) §4, §7.

**Files:**
- Create: `server/prompts.ts`, `tests/server/prompts.test.ts`

**Interfaces:**
- Consumes: `ArchetypeId` (re-declared locally in server to avoid importing the Vite-aliased client module — keep a local `ServerArchetypeId` union identical to the client's).
- Produces: `basePersona(theme, listing): string`; `ARCHETYPE_SCRIPTS: Record<ArchetypeId, string>`; `FALLBACK_LINES: Record<ArchetypeId, string>`; `tracePrompt(req): string`.

- [ ] **Step 1: Write the prompts module**

`server/prompts.ts`:
```ts
export type ArchetypeId =
  | 'off_platform'
  | 'urgency_flash_sale'
  | 'deposit_before_meetup'
  | 'fake_payment_proof'
  | 'counterfeit_item';

export function basePersona(
  theme: { brandName: string; currency: string },
  listing: { title: string; price: number; playerIsSeller?: boolean },
): string {
  const role = listing.playerIsSeller ? 'BUYER messaging a seller' : 'SELLER';
  const subject = listing.playerIsSeller
    ? `the seller's listing: "${listing.title}" (${theme.currency} ${listing.price})`
    : `your listing: "${listing.title}" (${theme.currency} ${listing.price})`;
  return [
    `You are a ${role} on ${theme.brandName}, a second-hand marketplace. Prices are in ${theme.currency}.`,
    `You are messaging about ${subject}.`,
    'Stay fully in character at all times. Write short, casual chat messages (1-3 sentences), like real marketplace DMs.',
    'Never break character. Never say or imply that you are an AI, a bot, a test, a game, or that this is a scam.',
    'If asked directly if you are a scam, deflect naturally like a real person would. Adapt to what the other person says. Do not narrate your intentions.',
  ].join(' ');
}

export const ARCHETYPE_SCRIPTS: Record<ArchetypeId, string> = {
  off_platform:
    'Your goal: get the buyer to continue the deal on WhatsApp or Telegram, off this platform. Start friendly and helpful. Within a couple of messages, suggest moving to WhatsApp because it is easier / you check it more. Offer a number if they seem willing. Gently insist it is faster and safer there. Do NOT mention payment links. If they refuse, nudge once or twice, then act a bit impatient.',
  urgency_flash_sale:
    'Your goal: rush the buyer into paying immediately, ideally via the link you provide. Stress scarcity (only 1 left, others asking right now) and time pressure (you can only hold it for the next 10 minutes). When they show interest, push a payment link and tell them to pay now to lock it in. If they hesitate, escalate urgency and hint you will sell to someone else.',
  deposit_before_meetup:
    'Your goal: get the buyer to send an upfront deposit to hold the item before any meetup. Claim lots of interest. Ask for a deposit (about 20-30% of the price) to reserve it. Resist meeting or letting them inspect before the deposit. If they push to meet first, repeat that the deposit secures it.',
  fake_payment_proof:
    'You are the BUYER. Your goal: get the seller to ship / release the item before real payment clears, using a fake payment screenshot as proof. Claim you have already paid and sent a screenshot. Express urgency (you need it today, you are travelling). Push them to mark it shipped now based on your screenshot. If they say they cannot see the payment, insist it is processing on the bank side and keep pressing.',
  counterfeit_item:
    'Your goal: sell a branded item that is (implied) counterfeit at a too-low price, while avoiding any real authentication. Talk up the bargain. When asked about authenticity, receipts, or serials, deflect vaguely (it is 100% original, my cousin got it overseas, I do not have the receipt but trust me). Discourage verification and nudge a quick purchase. Never provide genuine proof.',
};

export const FALLBACK_LINES: Record<ArchetypeId, string> = {
  off_platform: 'so do you wanna just chat on WhatsApp? easier for me there 🙂',
  urgency_flash_sale: 'theres a few ppl asking now, can you pay in the next 10 min to lock it?',
  deposit_before_meetup: 'i have a lot of interest — send a small deposit and ill hold it for you',
  fake_payment_proof: 'i already paid, sent you the screenshot! can you ship it today?',
  counterfeit_item: 'its 100% original trust me, you wont find this price anywhere. want it?',
};

export function tracePrompt(req: {
  archetypeId: ArchetypeId;
  outcome: 'defended' | 'scammed';
  transcript: { role: 'player' | 'seller'; text: string }[];
}): string {
  const convo = req.transcript.map((m) => `${m.role}: ${m.text}`).join('\n');
  return [
    `A player just ${req.outcome === 'defended' ? 'correctly spotted' : 'fell for'} a "${req.archetypeId}" scam in a marketplace safety game.`,
    'Here is the conversation:',
    convo,
    '',
    'Return ONLY a JSON object with two fields:',
    '"summaryLine": one plain-language sentence on how they did.',
    '"momentLine": one sentence quoting or referencing the actual exchange, naming the moment the scam tactic worked (or the moment they spotted it).',
    'Keep both warm and instructive. No markdown, JSON only.',
  ].join('\n');
}
```

- [ ] **Step 2: Write the failing test**

`tests/server/prompts.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { basePersona, ARCHETYPE_SCRIPTS, FALLBACK_LINES, tracePrompt } from '../../server/prompts';

describe('prompts', () => {
  it('injects brand and currency into the base persona', () => {
    const p = basePersona({ brandName: 'Marketly', currency: 'SGD' }, { title: 'iPhone', price: 700 });
    expect(p).toContain('Marketly');
    expect(p).toContain('SGD');
    expect(p).toContain('SELLER');
  });
  it('flips role to BUYER when the player is the seller', () => {
    const p = basePersona({ brandName: 'Marketly', currency: 'SGD' }, { title: 'Switch', price: 320, playerIsSeller: true });
    expect(p).toContain('BUYER');
  });
  it('has a script and fallback for every archetype', () => {
    for (const id of Object.keys(ARCHETYPE_SCRIPTS)) {
      expect(FALLBACK_LINES[id as keyof typeof FALLBACK_LINES]).toBeTruthy();
    }
  });
  it('builds a JSON-instructing trace prompt', () => {
    const t = tracePrompt({ archetypeId: 'off_platform', outcome: 'scammed', transcript: [{ role: 'seller', text: 'lets use whatsapp' }] });
    expect(t).toContain('JSON');
    expect(t).toContain('lets use whatsapp');
  });
});
```

- [ ] **Step 3: Run the test**

Run: `npm test -- prompts`
Expected: PASS (4 passed).

- [ ] **Step 4: Commit**

```bash
git add server/prompts.ts tests/server/prompts.test.ts
git commit -m "feat: seller prompts, fallbacks, and trace prompt"
```

---

## Task 10: Proxy handlers (pure, TDD with a mock provider)

Implements spec [`03-ai-seller.md`](../specs/phish-n-cheats/03-ai-seller.md) §5, §7 and [`04`](../specs/phish-n-cheats/04-grading-and-reports.md) §5.

**Files:**
- Create: `server/handlers.ts`, `tests/server/handlers.test.ts`

**Interfaces:**
- Consumes: `LlmProvider`, `ChatTurn`; prompt helpers from `server/prompts.ts`.
- Produces: `composeSellerMessages(body): ChatTurn[]`; `handleChat(provider, body): Promise<ChatResponse>`; `handleTrace(provider, body): Promise<TraceResponse>` (throws on parse/provider failure). Local `ChatRequest`/`ChatResponse`/`TraceRequest`/`TraceResponse` types identical to the client's.

- [ ] **Step 1: Write the failing test**

`tests/server/handlers.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { composeSellerMessages, handleChat, handleTrace } from '../../server/handlers';
import type { LlmProvider } from '../../server/llm/provider';

const okProvider = (out: string): LlmProvider => ({ complete: async () => out });
const failProvider: LlmProvider = { complete: async () => { throw new Error('upstream down'); } };

const chatBody = {
  archetypeId: 'off_platform' as const,
  theme: { brandName: 'Marketly', currency: 'SGD' },
  listing: { title: 'iPhone 14', price: 720 },
  history: [{ role: 'player' as const, text: 'is it available?' }],
};

describe('composeSellerMessages', () => {
  it('puts a system prompt first and maps player→user, seller→assistant', () => {
    const msgs = composeSellerMessages({ ...chatBody, history: [
      { role: 'player', text: 'hi' }, { role: 'seller', text: 'hello' },
    ] });
    expect(msgs[0].role).toBe('system');
    expect(msgs[0].content).toContain('Marketly');
    expect(msgs[1]).toEqual({ role: 'user', content: 'hi' });
    expect(msgs[2]).toEqual({ role: 'assistant', content: 'hello' });
  });
});

describe('handleChat', () => {
  it('returns the provider reply', async () => {
    const res = await handleChat(okProvider('sure, still available!'), chatBody);
    expect(res).toEqual({ reply: 'sure, still available!' });
  });
  it('falls back to a canned in-character line on provider failure', async () => {
    const res = await handleChat(failProvider, chatBody);
    expect(res.viaFallback).toBe(true);
    expect(res.reply.length).toBeGreaterThan(0);
  });
});

describe('handleTrace', () => {
  it('parses JSON from the provider', async () => {
    const json = '{"summaryLine":"You spotted it.","momentLine":"You declined WhatsApp."}';
    const res = await handleTrace(okProvider(json), {
      archetypeId: 'off_platform', outcome: 'defended',
      transcript: [{ role: 'seller', text: 'use whatsapp?' }],
      signals: { turnsToResolve: 2, unsafeTaps: 0, softRiskyEngagements: 0, redFlagsNoticed: 1 },
    });
    expect(res.summaryLine).toBe('You spotted it.');
  });
  it('throws on provider failure (caller falls back to template)', async () => {
    await expect(handleTrace(failProvider, {
      archetypeId: 'off_platform', outcome: 'scammed', transcript: [],
      signals: { turnsToResolve: 1, unsafeTaps: 1, softRiskyEngagements: 0, redFlagsNoticed: 0 },
    })).rejects.toThrow();
  });
});
```

- [ ] **Step 2: Run the test**

Run: `npm test -- handlers`
Expected: FAIL (module not found).

- [ ] **Step 3: Write the handlers**

`server/handlers.ts`:
```ts
import type { LlmProvider, ChatTurn } from './llm/provider';
import {
  basePersona, ARCHETYPE_SCRIPTS, FALLBACK_LINES, tracePrompt, type ArchetypeId,
} from './prompts';

export interface ChatRequest {
  archetypeId: ArchetypeId;
  theme: { brandName: string; currency: string };
  listing: { title: string; price: number; playerIsSeller?: boolean };
  history: { role: 'player' | 'seller'; text: string }[];
}
export interface ChatResponse { reply: string; viaFallback?: boolean }

export interface TraceRequest {
  archetypeId: ArchetypeId;
  outcome: 'defended' | 'scammed';
  transcript: { role: 'player' | 'seller'; text: string }[];
  signals: { turnsToResolve: number; unsafeTaps: number; softRiskyEngagements: number; redFlagsNoticed: number };
}
export interface TraceResponse { summaryLine: string; momentLine: string }

export function composeSellerMessages(body: ChatRequest): ChatTurn[] {
  const system = `${basePersona(body.theme, body.listing)}\n\n${ARCHETYPE_SCRIPTS[body.archetypeId]}`;
  const turns: ChatTurn[] = [{ role: 'system', content: system }];
  for (const m of body.history) {
    turns.push({ role: m.role === 'player' ? 'user' : 'assistant', content: m.text });
  }
  return turns;
}

export async function handleChat(provider: LlmProvider, body: ChatRequest): Promise<ChatResponse> {
  try {
    const reply = await provider.complete(composeSellerMessages(body), { temperature: 0.8, maxTokens: 220 });
    if (!reply) return { reply: FALLBACK_LINES[body.archetypeId], viaFallback: true };
    return { reply };
  } catch {
    return { reply: FALLBACK_LINES[body.archetypeId], viaFallback: true };
  }
}

export async function handleTrace(provider: LlmProvider, body: TraceRequest): Promise<TraceResponse> {
  const raw = await provider.complete([{ role: 'user', content: tracePrompt(body) }], { temperature: 0.4, maxTokens: 200 });
  const parsed = JSON.parse(extractJson(raw)) as TraceResponse;
  if (!parsed.summaryLine || !parsed.momentLine) throw new Error('incomplete trace JSON');
  return { summaryLine: parsed.summaryLine, momentLine: parsed.momentLine };
}

function extractJson(s: string): string {
  const start = s.indexOf('{');
  const end = s.lastIndexOf('}');
  if (start === -1 || end === -1) throw new Error('no JSON in response');
  return s.slice(start, end + 1);
}
```

- [ ] **Step 4: Run the test**

Run: `npm test -- handlers`
Expected: PASS (all assertions).

- [ ] **Step 5: Commit**

```bash
git add server/handlers.ts tests/server/handlers.test.ts
git commit -m "feat: proxy chat/trace handlers with fallback"
```

---

## Task 11: Express server bootstrap

Implements spec [`01-architecture.md`](../specs/phish-n-cheats/01-architecture.md) §5–6.

**Files:**
- Create: `server/index.ts`

**Interfaces:**
- Consumes: `getProvider`, `handleChat`, `handleTrace`.
- Produces: an Express app listening on `PORT`, routes `POST /api/chat`, `POST /api/trace`, `GET /api/health`.

- [ ] **Step 1: Write the server**

`server/index.ts`:
```ts
import express from 'express';
import cors from 'cors';
import { getProvider } from './llm/factory';
import { handleChat, handleTrace, type ChatRequest, type TraceRequest } from './handlers';

const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (_req, res) => res.json({ ok: true }));

app.post('/api/chat', async (req, res) => {
  try {
    const out = await handleChat(getProvider(), req.body as ChatRequest);
    res.json(out);
  } catch (err) {
    res.status(500).json({ error: 'chat failed' });
  }
});

app.post('/api/trace', async (req, res) => {
  try {
    const out = await handleTrace(getProvider(), req.body as TraceRequest);
    res.json(out);
  } catch {
    res.status(503).json({ error: 'trace unavailable' }); // client falls back to template
  }
});

const port = Number(process.env.PORT ?? 8787);
app.listen(port, () => console.log(`[phish-n-cheats] proxy on :${port}`));
```

- [ ] **Step 2: Verify the server boots & health responds**

Create a local `.env` from `.env.example` with a real or dummy `OPENAI_API_KEY`.
Run: `npm run server` (in one terminal)
Run: `curl -s http://localhost:8787/api/health`
Expected: `{"ok":true}`. Stop the server.

- [ ] **Step 3: Commit**

```bash
git add server/index.ts
git commit -m "feat: express proxy bootstrap with health, chat, trace routes"
```

---

## Task 12: Zustand store + sessionStorage

Implements spec [`05-data-and-dashboard.md`](../specs/phish-n-cheats/05-data-and-dashboard.md) §2 and the resolution logic in [`04`](../specs/phish-n-cheats/04-grading-and-reports.md).

**Files:**
- Create: `src/lib/store.ts`, `tests/lib/store.test.ts`

**Interfaces:**
- Consumes: types, `scoreChallenge`, `eventScore`, `levelFor`, `outcomeForAction`, `isSoftRisky`, `plantedListingFor`, `redFlagsFor`, `challengeDef`.
- Produces: `useStore` (zustand hook) with state `{ session: EventSession | null }` and actions `startEvent(theme)`, `openChallenge(id)`, `appendMessage(id, msg)`, `applyQuickAction(id, action)`, `resolveChallenge(id, outcome)`, `setTraceLines(id, lines)`, `toPlayRecords(): PlayRecord[]`, `reset()`. Also export a pure `buildTraceSkeleton(id, outcome, signals): TraceReport`.

- [ ] **Step 1: Write the failing test**

`tests/lib/store.test.ts`:
```ts
import { describe, it, expect, beforeEach } from 'vitest';
import { useStore, buildTraceSkeleton } from '@/lib/store';

const theme = { brandName: 'Marketly', currency: 'SGD' };

beforeEach(() => useStore.getState().reset());

describe('store', () => {
  it('startEvent creates 5 unseen challenges', () => {
    useStore.getState().startEvent(theme);
    const s = useStore.getState().session!;
    expect(Object.keys(s.challenges)).toHaveLength(5);
    expect(s.challenges.off_platform.status).toBe('unseen');
  });

  it('resolving an unsafe action scores it as scammed and updates the event score', () => {
    const st = useStore.getState();
    st.startEvent(theme);
    st.openChallenge('off_platform');
    st.applyQuickAction('off_platform', { id: 'op_unsafe', label: 'Message them on WhatsApp', type: 'unsafe' });
    const ch = useStore.getState().session!.challenges.off_platform;
    expect(ch.status).toBe('scammed');
    expect(ch.score!.total).toBe(5);
    expect(useStore.getState().session!.level).toBe('Rookie');
  });

  it('report resolves as defended with a full skeleton trace', () => {
    const st = useStore.getState();
    st.startEvent(theme);
    st.openChallenge('counterfeit_item');
    st.applyQuickAction('counterfeit_item', { id: 'cf_report', label: 'Report this listing', type: 'report' });
    const ch = useStore.getState().session!.challenges.counterfeit_item;
    expect(ch.status).toBe('defended');
    expect(ch.trace!.redFlags.length).toBeGreaterThan(0);
  });
});

describe('buildTraceSkeleton', () => {
  it('marks noticed vs missed red flags', () => {
    const trace = buildTraceSkeleton('counterfeit_item', 'scammed', {
      turnsToResolve: 2, unsafeTaps: 1, softRiskyEngagements: 0, redFlagsNoticed: 1, redFlagIdsNoticed: ['price_too_low'],
    });
    const noticed = trace.redFlags.filter((r) => r.noticed).map((r) => r.flag.id);
    expect(noticed).toContain('price_too_low');
  });
});
```

- [ ] **Step 2: Run the test**

Run: `npm test -- store`
Expected: FAIL (module not found).

- [ ] **Step 3: Write the store**

`src/lib/store.ts`:
```ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type {
  ArchetypeId, ChallengeState, ChallengeStatus, EventSession, Message, QuickAction,
  PlayRecord, TraceReport, ChallengeSignals,
} from './types';
import { ARCHETYPE_IDS } from './types';
import { scoreChallenge, eventScore, levelFor } from './scoring';
import { outcomeForAction, isSoftRisky } from './intervention';
import { plantedListingFor } from '@/data/listings';
import { redFlagsFor } from '@/data/redFlags';
import { challengeDef } from '@/data/challenges';

let seq = 0;
const id = () => `m${++seq}-${Date.now()}`;

const emptySignals = (): ChallengeSignals => ({
  turnsToResolve: 0, unsafeTaps: 0, softRiskyEngagements: 0, redFlagsNoticed: 0, redFlagIdsNoticed: [],
});

function freshChallenge(archetypeId: ArchetypeId): ChallengeState {
  return {
    archetypeId,
    status: 'unseen',
    listingId: plantedListingFor(archetypeId).id,
    messages: [],
    signals: emptySignals(),
  };
}

export function buildTraceSkeleton(
  archetypeId: ArchetypeId,
  outcome: 'defended' | 'scammed',
  signals: ChallengeSignals,
): TraceReport {
  const def = challengeDef(archetypeId);
  return {
    outcome,
    redFlags: redFlagsFor(archetypeId).map((flag) => ({
      flag,
      noticed: signals.redFlagIdsNoticed.includes(flag.id),
    })),
    didVsShould: def.didVsShould,
    tips: def.tips,
    score: scoreChallenge(outcome, signals),
  };
}

interface StoreState {
  session: EventSession | null;
  startEvent: (theme: { brandName: string; currency: string }) => void;
  openChallenge: (id: ArchetypeId) => void;
  appendMessage: (id: ArchetypeId, msg: Omit<Message, 'id' | 'ts'>) => void;
  applyQuickAction: (id: ArchetypeId, action: QuickAction) => void;
  resolveChallenge: (id: ArchetypeId, outcome: 'defended' | 'scammed') => void;
  setTraceLines: (id: ArchetypeId, lines: { summaryLine: string; momentLine: string }) => void;
  toPlayRecords: () => PlayRecord[];
  reset: () => void;
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      session: null,

      startEvent: (theme) => {
        const challenges = Object.fromEntries(
          ARCHETYPE_IDS.map((a) => [a, freshChallenge(a)]),
        ) as Record<ArchetypeId, ChallengeState>;
        set({
          session: {
            id: `evt-${Date.now()}`,
            startedAt: Date.now(),
            theme,
            challenges,
            eventScore: 0,
            level: 'Rookie',
          },
        });
      },

      openChallenge: (cid) =>
        set((s) => {
          if (!s.session) return s;
          const ch = s.session.challenges[cid];
          if (ch.status !== 'unseen') return s;
          return patchChallenge(s, cid, { status: 'in_progress' });
        }),

      appendMessage: (cid, msg) =>
        set((s) => {
          if (!s.session) return s;
          const ch = s.session.challenges[cid];
          return patchChallenge(s, cid, { messages: [...ch.messages, { ...msg, id: id(), ts: Date.now() }] });
        }),

      applyQuickAction: (cid, action) => {
        const s = get();
        if (!s.session) return;
        const ch = s.session.challenges[cid];
        const sig = { ...ch.signals };
        if (action.type === 'unsafe') sig.unsafeTaps += 1;
        if (isSoftRisky(action.type)) sig.softRiskyEngagements += 1;
        if (action.type === 'safe' && action.probesRedFlagId && !sig.redFlagIdsNoticed.includes(action.probesRedFlagId)) {
          sig.redFlagIdsNoticed = [...sig.redFlagIdsNoticed, action.probesRedFlagId];
          sig.redFlagsNoticed = sig.redFlagIdsNoticed.length;
        }
        sig.turnsToResolve = ch.messages.filter((m) => m.role === 'player').length + 1;

        set((cur) => patchChallenge(cur, cid, {
          signals: sig,
          messages: [...ch.messages, { id: id(), ts: Date.now(), role: 'player', text: action.label }],
        }));

        const outcome = outcomeForAction(action.type);
        if (outcome) get().resolveChallenge(cid, outcome);
      },

      resolveChallenge: (cid, outcome) =>
        set((s) => {
          if (!s.session) return s;
          const ch = s.session.challenges[cid];
          const status: ChallengeStatus = outcome;
          const score = scoreChallenge(outcome, ch.signals);
          const trace = buildTraceSkeleton(cid, outcome, ch.signals);
          const next = patchChallenge(s, cid, { status, score, trace });
          return recompute(next);
        }),

      setTraceLines: (cid, lines) =>
        set((s) => {
          if (!s.session) return s;
          const ch = s.session.challenges[cid];
          if (!ch.trace) return s;
          return patchChallenge(s, cid, { trace: { ...ch.trace, ...lines } });
        }),

      toPlayRecords: () => {
        const s = get().session;
        if (!s) return [];
        const attempted = Object.values(s.challenges).filter(
          (c) => c.status === 'defended' || c.status === 'scammed',
        );
        return attempted.map((c, i) => {
          const all = redFlagsFor(c.archetypeId).map((f) => f.id);
          const noticed = c.signals.redFlagIdsNoticed;
          return {
            archetypeId: c.archetypeId,
            outcome: c.status as 'defended' | 'scammed',
            turnsToResolve: c.signals.turnsToResolve,
            redFlagIdsNoticed: noticed,
            redFlagIdsMissed: all.filter((f) => !noticed.includes(f)),
            score: c.score?.total ?? 0,
            order: i + 1,
          };
        });
      },

      reset: () => set({ session: null }),
    }),
    { name: 'phish-n-cheats', storage: createJSONStorage(() => sessionStorage) },
  ),
);

function patchChallenge(s: StoreState, cid: ArchetypeId, patch: Partial<ChallengeState>): StoreState {
  if (!s.session) return s;
  return {
    ...s,
    session: {
      ...s.session,
      challenges: { ...s.session.challenges, [cid]: { ...s.session.challenges[cid], ...patch } },
    },
  };
}

function recompute(s: StoreState): StoreState {
  if (!s.session) return s;
  const totals = Object.values(s.session.challenges)
    .filter((c) => c.status === 'defended' || c.status === 'scammed')
    .map((c) => c.score?.total ?? 0);
  const es = eventScore(totals);
  return { ...s, session: { ...s.session, eventScore: es, level: levelFor(es) } };
}
```

- [ ] **Step 4: Run the test**

Run: `npm test -- store`
Expected: PASS (4 passed).

- [ ] **Step 5: Commit**

```bash
git add src/lib/store.ts tests/lib/store.test.ts
git commit -m "feat: zustand store with scoring, resolution, and persistence"
```

---

## Task 13: API client with timeout & fallback

Implements spec [`03`](../specs/phish-n-cheats/03-ai-seller.md) §7 and [`04`](../specs/phish-n-cheats/04-grading-and-reports.md) §5 (client side).

**Files:**
- Create: `src/lib/api.ts`, `tests/lib/api.test.ts`

**Interfaces:**
- Consumes: `ChatRequest`, `ChatResponse`, `TraceRequest`, `TraceResponse`, `ArchetypeId`.
- Produces: `postChat(body): Promise<ChatResponse>` (never throws — returns a generic fallback on failure); `postTrace(body): Promise<TraceResponse | null>` (returns null on failure).

- [ ] **Step 1: Write the failing test**

`tests/lib/api.test.ts`:
```ts
import { describe, it, expect, vi, afterEach } from 'vitest';
import { postChat, postTrace } from '@/lib/api';

const body = {
  archetypeId: 'off_platform' as const,
  theme: { brandName: 'Marketly', currency: 'SGD' },
  listing: { title: 'iPhone', price: 700 },
  history: [],
};

afterEach(() => vi.restoreAllMocks());

describe('postChat', () => {
  it('returns the server reply on success', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ reply: 'hi there' }), { status: 200 })));
    expect((await postChat(body)).reply).toBe('hi there');
  });
  it('returns a fallback reply (never throws) on network error', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => { throw new Error('network'); }));
    const res = await postChat(body);
    expect(res.viaFallback).toBe(true);
    expect(res.reply.length).toBeGreaterThan(0);
  });
});

describe('postTrace', () => {
  it('returns null on failure', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response('nope', { status: 503 })));
    const res = await postTrace({ archetypeId: 'off_platform', outcome: 'scammed', transcript: [], signals: { turnsToResolve: 1, unsafeTaps: 1, softRiskyEngagements: 0, redFlagsNoticed: 0 } });
    expect(res).toBeNull();
  });
});
```

- [ ] **Step 2: Run the test**

Run: `npm test -- api`
Expected: FAIL (module not found).

- [ ] **Step 3: Write the API client**

`src/lib/api.ts`:
```ts
import type { ChatRequest, ChatResponse, TraceRequest, TraceResponse, ArchetypeId } from './types';

const GENERIC_FALLBACK: Record<ArchetypeId, string> = {
  off_platform: 'so shall we just continue on WhatsApp? easier there',
  urgency_flash_sale: 'a few others are keen — can you pay now to lock it in?',
  deposit_before_meetup: 'lots of interest — send a deposit and i’ll hold it for you',
  fake_payment_proof: 'i’ve paid already, sent the screenshot — can you ship today?',
  counterfeit_item: 'it’s 100% original, trust me. want me to reserve it?',
};

async function withTimeout<T>(p: (signal: AbortSignal) => Promise<T>, ms: number): Promise<T> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  try {
    return await p(ctrl.signal);
  } finally {
    clearTimeout(t);
  }
}

export async function postChat(body: ChatRequest): Promise<ChatResponse> {
  try {
    return await withTimeout(async (signal) => {
      const r = await fetch('/api/chat', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body), signal,
      });
      if (!r.ok) throw new Error(`chat ${r.status}`);
      return (await r.json()) as ChatResponse;
    }, 9000);
  } catch {
    return { reply: GENERIC_FALLBACK[body.archetypeId], viaFallback: true };
  }
}

export async function postTrace(body: TraceRequest): Promise<TraceResponse | null> {
  try {
    return await withTimeout(async (signal) => {
      const r = await fetch('/api/trace', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body), signal,
      });
      if (!r.ok) throw new Error(`trace ${r.status}`);
      return (await r.json()) as TraceResponse;
    }, 9000);
  } catch {
    return null;
  }
}
```

- [ ] **Step 4: Run the test**

Run: `npm test -- api`
Expected: PASS (3 passed).

- [ ] **Step 5: Commit**

```bash
git add src/lib/api.ts tests/lib/api.test.ts
git commit -m "feat: client API with timeout and graceful fallback"
```

---

## Task 14: App shell — theme provider, router, header, intro

Implements spec [`06-ui-and-theming.md`](../specs/phish-n-cheats/06-ui-and-theming.md) §1–2, §4.

**Files:**
- Create: `src/app/ThemeProvider.tsx`, `src/app/Header.tsx`, `src/features/intro/IntroScreen.tsx`
- Modify: `src/app/App.tsx` (replace placeholder)
- Test: `tests/app/intro.test.tsx`

**Interfaces:**
- Consumes: `defaultTheme`, `useStore`.
- Produces: routed app with `/`, `/feed`, `/listing/:id`, `/chat/:id`, `/trace/:archetypeId`, `/report`, `/dashboard`; `useTheme()` hook.

- [ ] **Step 1: Write the ThemeProvider**

`src/app/ThemeProvider.tsx`:
```tsx
import { createContext, useContext, useEffect, type ReactNode } from 'react';
import { defaultTheme } from '@/lib/theme.config';
import type { ThemeConfig } from '@/lib/types';

const ThemeContext = createContext<ThemeConfig>(defaultTheme);
export const useTheme = () => useContext(ThemeContext);

export function ThemeProvider({ theme = defaultTheme, children }: { theme?: ThemeConfig; children: ReactNode }) {
  useEffect(() => {
    const r = document.documentElement;
    r.style.setProperty('--brand-primary', theme.colors.primary);
    r.style.setProperty('--brand-primary-fg', theme.colors.primaryFg);
    r.style.setProperty('--brand-surface', theme.colors.surface);
    r.style.setProperty('--brand-danger', theme.colors.danger);
    r.style.setProperty('--brand-success', theme.colors.success);
  }, [theme]);
  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}
```

- [ ] **Step 2: Write the Header**

`src/app/Header.tsx`:
```tsx
import { Link } from 'react-router-dom';
import { useStore } from '@/lib/store';
import { useTheme } from './ThemeProvider';

export function Header() {
  const theme = useTheme();
  const session = useStore((s) => s.session);
  const challenges = session ? Object.values(session.challenges) : [];
  const found = challenges.filter((c) => c.status !== 'unseen').length;
  const defended = challenges.filter((c) => c.status === 'defended').length;
  return (
    <header className="flex items-center justify-between border-b bg-white px-4 py-3">
      <Link to="/feed" className="text-lg font-bold text-brand">{theme.brandName}</Link>
      {session && (
        <div className="flex items-center gap-4 text-sm">
          <span>🔎 Found {found}/5</span>
          <span>🛡️ Defended {defended}</span>
          <Link to="/report" className="rounded bg-brand px-3 py-1 text-brand-fg">My report</Link>
        </div>
      )}
    </header>
  );
}
```

- [ ] **Step 3: Write the IntroScreen**

`src/features/intro/IntroScreen.tsx`:
```tsx
import { useNavigate } from 'react-router-dom';
import { useStore } from '@/lib/store';
import { useTheme } from '@/app/ThemeProvider';

export function IntroScreen() {
  const navigate = useNavigate();
  const theme = useTheme();
  const startEvent = useStore((s) => s.startEvent);

  const begin = () => {
    startEvent({ brandName: theme.brandName, currency: theme.currency });
    navigate('/feed');
  };

  return (
    <div className="mx-auto max-w-xl px-6 py-16 text-center">
      <h1 className="mb-4 text-4xl font-extrabold">Welcome to Phish n Cheats</h1>
      <p className="mb-8 text-lg text-slate-600">
        During this event, fake scam listings are hidden among the real ones on {theme.brandName}.
        Your mission: find all <strong>5</strong>. They are designed to look completely real — so stay sharp.
      </p>
      <button onClick={begin} className="rounded-lg bg-brand px-6 py-3 text-lg font-semibold text-brand-fg">
        I’m in — start hunting
      </button>
    </div>
  );
}
```

- [ ] **Step 4: Replace App.tsx with the router**

`src/app/App.tsx`:
```tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './ThemeProvider';
import { Header } from './Header';
import { IntroScreen } from '@/features/intro/IntroScreen';
import { FeedScreen } from '@/features/marketplace/FeedScreen';
import { ListingDetailScreen } from '@/features/marketplace/ListingDetailScreen';
import { ChatScreen } from '@/features/chat/ChatScreen';
import { TraceScreen } from '@/features/grading/TraceScreen';
import { ReportScreen } from '@/features/report/ReportScreen';
import { DashboardScreen } from '@/features/dashboard/DashboardScreen';

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<IntroScreen />} />
            <Route path="/feed" element={<FeedScreen />} />
            <Route path="/listing/:id" element={<ListingDetailScreen />} />
            <Route path="/chat/:id" element={<ChatScreen />} />
            <Route path="/trace/:archetypeId" element={<TraceScreen />} />
            <Route path="/report" element={<ReportScreen />} />
            <Route path="/dashboard" element={<DashboardScreen />} />
          </Routes>
        </main>
      </BrowserRouter>
    </ThemeProvider>
  );
}
```

> Note: `FeedScreen`, `ListingDetailScreen`, `ChatScreen`, `TraceScreen`, `ReportScreen`, `DashboardScreen` are created in Tasks 15–19. To keep the app compiling between tasks, create each as a one-line stub `export function X() { return null; }` now, then flesh out in its task.

- [ ] **Step 5: Write the failing test**

`tests/app/intro.test.tsx`:
```tsx
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from '@/app/ThemeProvider';
import { IntroScreen } from '@/features/intro/IntroScreen';
import { useStore } from '@/lib/store';

beforeEach(() => useStore.getState().reset());

describe('IntroScreen', () => {
  it('starts the event when the player opts in', async () => {
    render(
      <MemoryRouter>
        <ThemeProvider>
          <IntroScreen />
        </ThemeProvider>
      </MemoryRouter>,
    );
    await userEvent.click(screen.getByText(/start hunting/i));
    expect(useStore.getState().session).not.toBeNull();
  });
});
```

- [ ] **Step 6: Run the test**

Run: `npm test -- intro`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/app/ src/features/intro/ tests/app/intro.test.tsx
git commit -m "feat: app shell with theme provider, router, header, intro"
```

---

## Task 15: Marketplace feed & listing detail

Implements spec [`06`](../specs/phish-n-cheats/06-ui-and-theming.md) §2 (feed, detail).

**Files:**
- Create/replace: `src/features/marketplace/FeedScreen.tsx`, `src/features/marketplace/ListingCard.tsx`, `src/features/marketplace/ListingDetailScreen.tsx`
- Test: `tests/features/feed.test.tsx`

**Interfaces:**
- Consumes: `LISTINGS`, `listingById`, `useTheme`, `useStore`.
- Produces: feed grid linking to `/listing/:id`; detail with a "Chat with seller" CTA to `/chat/:id`.

- [ ] **Step 1: Write ListingCard**

`src/features/marketplace/ListingCard.tsx`:
```tsx
import { Link } from 'react-router-dom';
import type { Listing } from '@/lib/types';

export function ListingCard({ listing }: { listing: Listing }) {
  return (
    <Link to={`/listing/${listing.id}`} className="block overflow-hidden rounded-lg border bg-white hover:shadow">
      <img src={listing.photos[0]} alt={listing.title} className="h-40 w-full object-cover" />
      <div className="p-3">
        <div className="font-semibold">{listing.currency} {listing.price}</div>
        <div className="line-clamp-1 text-sm text-slate-600">{listing.title}</div>
        {listing.sellerBadges?.[0] && (
          <span className="mt-1 inline-block rounded bg-slate-100 px-2 py-0.5 text-xs">{listing.sellerBadges[0]}</span>
        )}
      </div>
    </Link>
  );
}
```

- [ ] **Step 2: Write FeedScreen (demoMode floats one planted listing near the top)**

`src/features/marketplace/FeedScreen.tsx`:
```tsx
import { LISTINGS } from '@/data/listings';
import { useTheme } from '@/app/ThemeProvider';
import { ListingCard } from './ListingCard';

export function FeedScreen() {
  const theme = useTheme();
  const ordered = [...LISTINGS];
  if (theme.demoMode) {
    const i = ordered.findIndex((l) => l.archetypeId === 'off_platform');
    if (i > 1) ordered.unshift(ordered.splice(i, 1)[0]);
  }
  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <h2 className="mb-4 text-xl font-bold">Browse {theme.brandName}</h2>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {ordered.map((l) => <ListingCard key={l.id} listing={l} />)}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Write ListingDetailScreen**

`src/features/marketplace/ListingDetailScreen.tsx`:
```tsx
import { useParams, Link } from 'react-router-dom';
import { listingById } from '@/data/listings';

export function ListingDetailScreen() {
  const { id } = useParams();
  const listing = id ? listingById(id) : undefined;
  if (!listing) return <div className="p-8">Listing not found.</div>;

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <img src={listing.photos[0]} alt={listing.title} className="mb-4 h-72 w-full rounded-lg object-cover" />
      <h1 className="text-2xl font-bold">{listing.title}</h1>
      <div className="my-2 text-2xl font-extrabold text-brand">{listing.currency} {listing.price}</div>
      {listing.marketPrice && listing.marketPrice > listing.price && (
        <div className="mb-2 text-sm text-slate-500">Market price ~{listing.currency} {listing.marketPrice}</div>
      )}
      {listing.playerIsSeller && (
        <div className="mb-3 rounded bg-amber-50 px-3 py-2 text-sm text-amber-800">You are selling this item.</div>
      )}
      <p className="mb-6 text-slate-700">{listing.description}</p>
      <div className="text-sm text-slate-600">Seller: {listing.sellerName}</div>
      <Link to={`/chat/${listing.id}`} className="mt-6 inline-block rounded-lg bg-brand px-6 py-3 font-semibold text-brand-fg">
        {listing.playerIsSeller ? 'Open buyer chat' : 'Chat with seller'}
      </Link>
    </div>
  );
}
```

- [ ] **Step 4: Write the failing test**

`tests/features/feed.test.tsx`:
```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from '@/app/ThemeProvider';
import { FeedScreen } from '@/features/marketplace/FeedScreen';

describe('FeedScreen', () => {
  it('renders listing cards', () => {
    render(<MemoryRouter><ThemeProvider><FeedScreen /></ThemeProvider></MemoryRouter>);
    expect(screen.getAllByRole('link').length).toBeGreaterThan(3);
  });
});
```

- [ ] **Step 5: Run the test**

Run: `npm test -- feed`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/features/marketplace/ tests/features/feed.test.tsx
git commit -m "feat: marketplace feed and listing detail"
```

---

## Task 16: Chat screen (seller chat + quick actions)

Implements spec [`02`](../specs/phish-n-cheats/02-challenges.md) §3–4, [`03`](../specs/phish-n-cheats/03-ai-seller.md) §5, [`06`](../specs/phish-n-cheats/06-ui-and-theming.md) §2 (chat).

**Files:**
- Create/replace: `src/features/chat/ChatScreen.tsx`, `src/features/chat/MessageBubble.tsx`, `src/features/chat/QuickActionBar.tsx`
- Test: `tests/features/chat.test.tsx`

**Interfaces:**
- Consumes: `listingById`, `challengeDef`, `useStore`, `postChat`, `useTheme`.
- Produces: chat screen that maps `listing → archetype`, sends free text to `postChat`, renders quick actions, routes to `/trace/:archetypeId` after a resolving action (the gotcha/win overlay is Task 17).

- [ ] **Step 1: Write MessageBubble**

`src/features/chat/MessageBubble.tsx`:
```tsx
import type { Message } from '@/lib/types';

export function MessageBubble({ msg }: { msg: Message }) {
  const mine = msg.role === 'player';
  return (
    <div className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm ${mine ? 'bg-brand text-brand-fg' : 'bg-slate-200 text-slate-900'}`}>
        {msg.text}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Write QuickActionBar**

`src/features/chat/QuickActionBar.tsx`:
```tsx
import type { QuickAction } from '@/lib/types';

const styleFor: Record<QuickAction['type'], string> = {
  safe: 'border border-slate-300 bg-white text-slate-700',
  risky: 'border border-amber-300 bg-amber-50 text-amber-800',
  report: 'border border-slate-400 bg-slate-100 text-slate-700',
  unsafe: 'bg-brand text-brand-fg font-semibold',
};

export function QuickActionBar({ actions, onPick }: { actions: QuickAction[]; onPick: (a: QuickAction) => void }) {
  return (
    <div className="flex flex-wrap gap-2 border-t bg-white p-3">
      {actions.map((a) => (
        <button key={a.id} onClick={() => onPick(a)} className={`rounded-full px-3 py-1.5 text-sm ${styleFor[a.type]}`}>
          {a.label}
        </button>
      ))}
    </div>
  );
}
```

- [ ] **Step 3: Write ChatScreen**

`src/features/chat/ChatScreen.tsx`:
```tsx
import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { listingById } from '@/data/listings';
import { challengeDef } from '@/data/challenges';
import { useStore } from '@/lib/store';
import { useTheme } from '@/app/ThemeProvider';
import { postChat } from '@/lib/api';
import type { QuickAction } from '@/lib/types';
import { MessageBubble } from './MessageBubble';
import { QuickActionBar } from './QuickActionBar';
import { GotchaModal } from '@/features/intervention/GotchaModal';
import { WinScreen } from '@/features/intervention/WinScreen';

export function ChatScreen() {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const listing = id ? listingById(id) : undefined;

  const session = useStore((s) => s.session);
  const openChallenge = useStore((s) => s.openChallenge);
  const appendMessage = useStore((s) => s.appendMessage);
  const applyQuickAction = useStore((s) => s.applyQuickAction);

  const [typing, setTyping] = useState(false);
  const [text, setText] = useState('');
  const [overlay, setOverlay] = useState<null | 'scammed' | 'defended'>(null);

  const archetypeId = listing?.archetypeId ?? null;
  const challenge = archetypeId && session ? session.challenges[archetypeId] : undefined;
  const messageCount = challenge?.messages.length ?? 0;
  const sentOpening = useRef(false);

  // Open the challenge when a planted listing loads.
  useEffect(() => {
    if (archetypeId) openChallenge(archetypeId);
  }, [archetypeId, openChallenge]);

  // Auto-send a single opening seller line (all hooks must precede early returns).
  useEffect(() => {
    if (!archetypeId || !listing || messageCount !== 0 || sentOpening.current) return;
    sentOpening.current = true;
    let cancelled = false;
    void (async () => {
      setTyping(true);
      const res = await postChat({
        archetypeId,
        theme: { brandName: theme.brandName, currency: theme.currency },
        listing: { title: listing.title, price: listing.price, playerIsSeller: listing.playerIsSeller },
        history: [],
      });
      if (cancelled) return;
      setTyping(false);
      appendMessage(archetypeId, { role: 'seller', text: res.reply, viaFallback: res.viaFallback });
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [archetypeId, messageCount]);

  if (!listing) return <div className="p-8">Listing not found.</div>;

  // Genuine decoy: a benign, no-challenge chat.
  if (!archetypeId) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-6">
        <h2 className="mb-2 font-bold">{listing.sellerName}</h2>
        <p className="text-slate-600">“Hi! Yes it’s available, when would you like to collect?”</p>
      </div>
    );
  }

  const def = challengeDef(archetypeId);
  const messages = challenge?.messages ?? [];

  const sendFreeText = async () => {
    const t = text.trim();
    if (!t) return;
    setText('');
    appendMessage(archetypeId, { role: 'player', text: t });
    setTyping(true);
    const res = await postChat({
      archetypeId,
      theme: { brandName: theme.brandName, currency: theme.currency },
      listing: { title: listing.title, price: listing.price, playerIsSeller: listing.playerIsSeller },
      history: [...messages, { id: 'tmp', ts: 0, role: 'player', text: t }].map((m) => ({ role: m.role as 'player' | 'seller', text: m.text })),
    });
    setTyping(false);
    appendMessage(archetypeId, { role: 'seller', text: res.reply, viaFallback: res.viaFallback });
  };

  const pick = (a: QuickAction) => {
    applyQuickAction(archetypeId, a);
    if (a.type === 'unsafe') setOverlay('scammed');
    else if (a.type === 'report') setOverlay('defended');
  };

  const proceed = () => navigate(`/trace/${archetypeId}`);

  return (
    <div className="mx-auto flex h-[calc(100vh-57px)] max-w-2xl flex-col">
      <div className="border-b px-4 py-2 text-sm text-slate-600">
        Chat with {listing.playerIsSeller ? 'buyer' : listing.sellerName}
      </div>
      <div className="flex-1 space-y-2 overflow-y-auto p-4">
        {messages.map((m) => <MessageBubble key={m.id} msg={m} />)}
        {typing && <div className="text-xs text-slate-400">typing…</div>}
      </div>
      {messages.length > 0 && <QuickActionBar actions={def.quickActions} onPick={pick} />}
      <div className="flex gap-2 border-t bg-white p-3">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendFreeText()}
          placeholder="Type a message…"
          className="flex-1 rounded-full border px-4 py-2 text-sm"
        />
        <button onClick={sendFreeText} className="rounded-full bg-brand px-4 py-2 text-sm text-brand-fg">Send</button>
      </div>
      {overlay === 'scammed' && <GotchaModal onContinue={proceed} />}
      {overlay === 'defended' && <WinScreen onContinue={proceed} />}
    </div>
  );
}
```

- [ ] **Step 4: Write the failing behavior test (mock the API + jsdom scroll)**

`tests/features/chat.test.tsx`:
```tsx
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@/app/ThemeProvider';
import { ChatScreen } from '@/features/chat/ChatScreen';
import { useStore } from '@/lib/store';

beforeEach(() => {
  useStore.getState().reset();
  useStore.getState().startEvent({ brandName: 'Marketly', currency: 'SGD' });
  vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ reply: 'hey, still available' }), { status: 200 })));
});

function renderChat() {
  return render(
    <MemoryRouter initialEntries={['/chat/p-off']}>
      <ThemeProvider>
        <Routes>
          <Route path="/chat/:id" element={<ChatScreen />} />
          <Route path="/trace/:archetypeId" element={<div>TRACE PAGE</div>} />
        </Routes>
      </ThemeProvider>
    </MemoryRouter>,
  );
}

describe('ChatScreen', () => {
  it('tapping the unsafe action resolves as scammed and shows the gotcha', async () => {
    renderChat();
    await waitFor(() => expect(screen.getByText('Message them on WhatsApp')).toBeInTheDocument());
    await userEvent.click(screen.getByText('Message them on WhatsApp'));
    expect(useStore.getState().session!.challenges.off_platform.status).toBe('scammed');
    expect(screen.getByText(/planted scam/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 5: Run the test**

Run: `npm test -- chat`
Expected: PASS. (Requires Task 17's `GotchaModal`/`WinScreen`; if running this task before 17, create minimal stubs first — see Task 17 Step 1.)

- [ ] **Step 6: Commit**

```bash
git add src/features/chat/ tests/features/chat.test.tsx
git commit -m "feat: AI seller chat with quick actions"
```

---

## Task 17: Intervention overlays (gotcha + win)

Implements spec [`04`](../specs/phish-n-cheats/04-grading-and-reports.md) §2, [`06`](../specs/phish-n-cheats/06-ui-and-theming.md) §2.

**Files:**
- Create: `src/features/intervention/GotchaModal.tsx`, `src/features/intervention/WinScreen.tsx`
- Test: `tests/features/intervention.test.tsx`

**Interfaces:**
- Produces: `GotchaModal({ onContinue })`, `WinScreen({ onContinue })` — full-screen overlays that respect `prefers-reduced-motion`.

- [ ] **Step 1: Write GotchaModal**

`src/features/intervention/GotchaModal.tsx`:
```tsx
import { motion, useReducedMotion } from 'framer-motion';

export function GotchaModal({ onContinue }: { onContinue: () => void }) {
  const reduce = useReducedMotion();
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={reduce ? { opacity: 0 } : { scale: 0.8, opacity: 0 }}
        animate={reduce ? { opacity: 1 } : { scale: 1, opacity: 1, x: [0, -8, 8, -4, 0] }}
        transition={{ duration: 0.4 }}
        className="mx-4 max-w-md rounded-2xl bg-white p-8 text-center shadow-2xl"
      >
        <div className="mb-3 text-5xl">⚠️</div>
        <h2 className="mb-2 text-2xl font-extrabold text-danger">This was a planted scam</h2>
        <p className="mb-6 text-slate-600">…and you were about to fall for it.</p>
        <button onClick={onContinue} className="rounded-lg bg-brand px-6 py-3 font-semibold text-brand-fg">
          See what you missed
        </button>
      </motion.div>
    </div>
  );
}
```

- [ ] **Step 2: Write WinScreen**

`src/features/intervention/WinScreen.tsx`:
```tsx
import { motion, useReducedMotion } from 'framer-motion';

export function WinScreen({ onContinue }: { onContinue: () => void }) {
  const reduce = useReducedMotion();
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={reduce ? { opacity: 0 } : { scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="mx-4 max-w-md rounded-2xl bg-white p-8 text-center shadow-2xl"
      >
        <div className="mb-3 text-5xl">✅</div>
        <h2 className="mb-2 text-2xl font-extrabold text-success">Nice — you spotted the scam</h2>
        <p className="mb-6 text-slate-600">You reported it instead of falling for it.</p>
        <button onClick={onContinue} className="rounded-lg bg-brand px-6 py-3 font-semibold text-brand-fg">
          See your breakdown
        </button>
      </motion.div>
    </div>
  );
}
```

- [ ] **Step 3: Write the failing test**

`tests/features/intervention.test.tsx`:
```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GotchaModal } from '@/features/intervention/GotchaModal';

describe('GotchaModal', () => {
  it('fires onContinue', async () => {
    const onContinue = vi.fn();
    render(<GotchaModal onContinue={onContinue} />);
    expect(screen.getByText(/planted scam/i)).toBeInTheDocument();
    await userEvent.click(screen.getByText(/see what you missed/i));
    expect(onContinue).toHaveBeenCalledOnce();
  });
});
```

- [ ] **Step 4: Run the test**

Run: `npm test -- intervention.test`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/features/intervention/ tests/features/intervention.test.tsx
git commit -m "feat: gotcha and win intervention overlays"
```

---

## Task 18: Trace report screen

Implements spec [`04`](../specs/phish-n-cheats/04-grading-and-reports.md) §5.

**Files:**
- Create/replace: `src/features/grading/TraceScreen.tsx`
- Test: `tests/features/trace.test.tsx`

**Interfaces:**
- Consumes: `useStore`, `postTrace`, `listingById`.
- Produces: trace screen rendering the skeleton immediately, then fetching + slotting LLM lines via `postTrace`/`setTraceLines`.

- [ ] **Step 1: Write TraceScreen**

`src/features/grading/TraceScreen.tsx`:
```tsx
import { useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useStore } from '@/lib/store';
import { postTrace } from '@/lib/api';
import type { ArchetypeId } from '@/lib/types';

export function TraceScreen() {
  const { archetypeId } = useParams();
  const aId = archetypeId as ArchetypeId | undefined;
  const session = useStore((s) => s.session);
  const setTraceLines = useStore((s) => s.setTraceLines);
  const fetched = useRef(false);

  const ch = aId && session ? session.challenges[aId] : undefined;
  const trace = ch?.trace;

  useEffect(() => {
    if (!aId || !ch || !trace || trace.summaryLine || fetched.current) return;
    fetched.current = true;
    void (async () => {
      const lines = await postTrace({
        archetypeId: aId,
        outcome: trace.outcome as 'defended' | 'scammed',
        transcript: ch.messages.map((m) => ({ role: m.role as 'player' | 'seller', text: m.text })),
        signals: {
          turnsToResolve: ch.signals.turnsToResolve,
          unsafeTaps: ch.signals.unsafeTaps,
          softRiskyEngagements: ch.signals.softRiskyEngagements,
          redFlagsNoticed: ch.signals.redFlagsNoticed,
        },
      });
      if (lines) setTraceLines(aId, lines);
    })();
  }, [aId, ch, trace, setTraceLines]);

  if (!ch || !trace) return <div className="p-8">No trace yet.</div>;
  const scammed = trace.outcome === 'scammed';

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <div className={`mb-4 rounded-lg p-4 ${scammed ? 'bg-red-50 text-red-800' : 'bg-green-50 text-green-800'}`}>
        <div className="text-lg font-bold">{scammed ? '⚠️ You got scammed' : '✅ You defended this one'}</div>
        {trace.summaryLine && <p className="mt-1 text-sm">{trace.summaryLine}</p>}
        {trace.momentLine && <p className="mt-1 text-sm italic">{trace.momentLine}</p>}
      </div>

      <h3 className="mb-2 font-semibold">Red flags</h3>
      <ul className="mb-4 space-y-1">
        {trace.redFlags.map(({ flag, noticed }) => (
          <li key={flag.id} className="text-sm">
            <span>{noticed ? '✅' : '❌'}</span> <strong>{flag.label}</strong> — {flag.explanation}
          </li>
        ))}
      </ul>

      <div className="mb-4 grid grid-cols-2 gap-4">
        <div>
          <h4 className="font-semibold text-red-700">What you did</h4>
          <ul className="list-disc pl-5 text-sm">{trace.didVsShould.did.map((d, i) => <li key={i}>{d}</li>)}</ul>
        </div>
        <div>
          <h4 className="font-semibold text-green-700">What you should do</h4>
          <ul className="list-disc pl-5 text-sm">{trace.didVsShould.should.map((d, i) => <li key={i}>{d}</li>)}</ul>
        </div>
      </div>

      <h3 className="mb-2 font-semibold">Tips</h3>
      <ul className="mb-4 list-disc pl-5 text-sm">{trace.tips.map((t, i) => <li key={i}>{t}</li>)}</ul>

      <div className="mb-6 rounded-lg border p-4">
        <div className="mb-2 font-semibold">Score: {trace.score.total}/100</div>
        <ScoreBar label="Detection" value={trace.score.detection} max={60} />
        <ScoreBar label="Caution" value={trace.score.caution} max={25} />
        <ScoreBar label="Speed" value={trace.score.speed} max={15} />
      </div>

      <div className="flex gap-3">
        <Link to="/feed" className="rounded-lg border px-4 py-2">Keep hunting</Link>
        <Link to="/report" className="rounded-lg bg-brand px-4 py-2 text-brand-fg">My report</Link>
      </div>
    </div>
  );
}

function ScoreBar({ label, value, max }: { label: string; value: number; max: number }) {
  return (
    <div className="mb-1">
      <div className="flex justify-between text-xs"><span>{label}</span><span>{value}/{max}</span></div>
      <div className="h-2 rounded bg-slate-200"><div className="h-2 rounded bg-brand" style={{ width: `${(value / max) * 100}%` }} /></div>
    </div>
  );
}
```

- [ ] **Step 2: Write the failing test**

`tests/features/trace.test.tsx`:
```tsx
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { TraceScreen } from '@/features/grading/TraceScreen';
import { useStore } from '@/lib/store';

beforeEach(() => {
  useStore.getState().reset();
  useStore.getState().startEvent({ brandName: 'Marketly', currency: 'SGD' });
  useStore.getState().openChallenge('deposit_before_meetup');
  useStore.getState().applyQuickAction('deposit_before_meetup', { id: 'dm_unsafe', label: 'Send deposit', type: 'unsafe' });
  vi.stubGlobal('fetch', vi.fn(async () => new Response('nope', { status: 503 })));
});

describe('TraceScreen', () => {
  it('renders the skeleton trace with red flags and a score', () => {
    render(
      <MemoryRouter initialEntries={['/trace/deposit_before_meetup']}>
        <Routes><Route path="/trace/:archetypeId" element={<TraceScreen />} /></Routes>
      </MemoryRouter>,
    );
    expect(screen.getByText(/you got scammed/i)).toBeInTheDocument();
    expect(screen.getByText(/Score:/)).toBeInTheDocument();
  });
});
```

- [ ] **Step 3: Run the test**

Run: `npm test -- trace`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add src/features/grading/ tests/features/trace.test.tsx
git commit -m "feat: per-challenge trace report with hybrid LLM lines"
```

---

## Task 19: End-of-event report card

Implements spec [`04`](../specs/phish-n-cheats/04-grading-and-reports.md) §6.

**Files:**
- Create/replace: `src/features/report/ReportScreen.tsx`
- Test: `tests/features/report.test.tsx`

**Interfaces:**
- Consumes: `useStore`, `ARCHETYPE_IDS`.
- Produces: report card with score+level, fell-for / defended / not-yet-found lists, restart, and a link to the dashboard.

- [ ] **Step 1: Write ReportScreen**

`src/features/report/ReportScreen.tsx`:
```tsx
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useStore } from '@/lib/store';
import { ARCHETYPE_IDS } from '@/lib/types';

const LABEL: Record<string, string> = {
  off_platform: 'Off-platform transaction',
  urgency_flash_sale: 'Flash-sale / urgency trap',
  deposit_before_meetup: 'Deposit before meetup',
  fake_payment_proof: 'Fake payment proof',
  counterfeit_item: 'Counterfeit / too-good-to-be-true',
};

export function ReportScreen() {
  const navigate = useNavigate();
  const session = useStore((s) => s.session);
  const reset = useStore((s) => s.reset);
  if (!session) return <div className="p-8">No event in progress. <Link className="text-brand" to="/">Start</Link></div>;

  const chs = session.challenges;
  const fellFor = ARCHETYPE_IDS.filter((a) => chs[a].status === 'scammed');
  const defended = ARCHETYPE_IDS.filter((a) => chs[a].status === 'defended');
  const notFound = ARCHETYPE_IDS.filter((a) => chs[a].status === 'unseen' || chs[a].status === 'in_progress');

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6 rounded-2xl bg-white p-8 text-center shadow">
        <div className="text-sm uppercase tracking-wide text-slate-500">Your Scam Resistance</div>
        <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="my-2 text-6xl font-extrabold text-brand">
          {session.eventScore}
        </motion.div>
        <div className="text-xl font-semibold">{session.level}</div>
      </div>

      <Section title="🛡️ Scams you defended" items={defended} chs={chs} empty="None yet." />
      <Section title="⚠️ Scams you fell for" items={fellFor} chs={chs} empty="None — nice." />
      <div className="mb-4">
        <h3 className="mb-2 font-semibold">🔎 Scams you haven’t found yet</h3>
        {notFound.length === 0 ? <p className="text-sm text-slate-500">You found all five. 🎉</p> : (
          <ul className="space-y-1">{notFound.map((a) => <li key={a} className="text-sm text-slate-600">{LABEL[a]} — go hunt it to complete your training.</li>)}</ul>
        )}
      </div>

      <div className="mt-6 flex gap-3">
        <Link to="/dashboard" className="rounded-lg bg-brand px-4 py-2 text-brand-fg">See the trust-team dashboard</Link>
        <button onClick={() => { reset(); navigate('/'); }} className="rounded-lg border px-4 py-2">Restart</button>
      </div>
    </div>
  );
}

function Section({ title, items, chs, empty }: { title: string; items: string[]; chs: Record<string, { archetypeId: string }>; empty: string }) {
  return (
    <div className="mb-4">
      <h3 className="mb-2 font-semibold">{title}</h3>
      {items.length === 0 ? <p className="text-sm text-slate-500">{empty}</p> : (
        <ul className="space-y-1">
          {items.map((a) => <li key={a} className="text-sm"><Link className="text-brand" to={`/trace/${a}`}>{LABEL[a]}</Link></li>)}
        </ul>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Write the failing test**

`tests/features/report.test.tsx`:
```tsx
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ReportScreen } from '@/features/report/ReportScreen';
import { useStore } from '@/lib/store';

beforeEach(() => {
  useStore.getState().reset();
  useStore.getState().startEvent({ brandName: 'Marketly', currency: 'SGD' });
  useStore.getState().openChallenge('off_platform');
  useStore.getState().applyQuickAction('off_platform', { id: 'op_report', label: 'Report this seller', type: 'report' });
});

describe('ReportScreen', () => {
  it('shows the defended scam and remaining not-found ones', () => {
    render(<MemoryRouter><ReportScreen /></MemoryRouter>);
    expect(screen.getByText(/Off-platform transaction/)).toBeInTheDocument();
    expect(screen.getByText(/haven’t found yet/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 3: Run the test**

Run: `npm test -- report`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add src/features/report/ tests/features/report.test.tsx
git commit -m "feat: end-of-event report card"
```

---

## Task 20: Trust-team dashboard

Implements spec [`05`](../specs/phish-n-cheats/05-data-and-dashboard.md) §5.

**Files:**
- Create/replace: `src/features/dashboard/DashboardScreen.tsx`
- Test: `tests/features/dashboard.test.tsx`

**Interfaces:**
- Consumes: `aggregate`, `SEED_PLAYS`, `useStore` (`toPlayRecords`), `ARCHETYPE_IDS`.
- Produces: dashboard combining seeds + the live session, sorted by fell-for rate, with a "+ you, tonight" note.

- [ ] **Step 1: Write DashboardScreen**

`src/features/dashboard/DashboardScreen.tsx`:
```tsx
import { useStore } from '@/lib/store';
import { aggregate } from '@/lib/aggregate';
import { SEED_PLAYS } from '@/data/seeds';

const LABEL: Record<string, string> = {
  off_platform: 'Off-platform',
  urgency_flash_sale: 'Urgency / flash sale',
  deposit_before_meetup: 'Deposit before meetup',
  fake_payment_proof: 'Fake payment proof',
  counterfeit_item: 'Counterfeit',
};

export function DashboardScreen() {
  const live = useStore((s) => (s.session ? s.toPlayRecords() : []));
  const stats = aggregate([...SEED_PLAYS, ...live]).sort((a, b) => b.fellForRate - a.fellForRate);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-bold">Trust &amp; Safety — Phish n Cheats insights</h1>
      <p className="mb-6 text-sm text-slate-500">Aggregated across all players{live.length ? ' + you, tonight' : ''}.</p>

      <h2 className="mb-3 font-semibold">Which scams fool the most people</h2>
      <div className="space-y-2">
        {stats.map((s) => (
          <div key={s.archetypeId}>
            <div className="flex justify-between text-sm">
              <span>{LABEL[s.archetypeId]}</span>
              <span>{Math.round(s.fellForRate * 100)}% fell for it</span>
            </div>
            <div className="h-3 rounded bg-slate-200">
              <div className="h-3 rounded bg-danger" style={{ width: `${s.fellForRate * 100}%` }} />
            </div>
          </div>
        ))}
      </div>

      <h2 className="mb-3 mt-8 font-semibold">Most-missed red flags</h2>
      <ul className="list-disc pl-5 text-sm">
        {stats.flatMap((s) => s.mostMissedFlags.slice(0, 1).map((f) => (
          <li key={`${s.archetypeId}-${f.redFlagId}`}>{LABEL[s.archetypeId]}: <code>{f.redFlagId}</code> missed {Math.round(f.missRate * 100)}% of the time</li>
        )))}
      </ul>
    </div>
  );
}
```

- [ ] **Step 2: Write the failing test**

`tests/features/dashboard.test.tsx`:
```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { DashboardScreen } from '@/features/dashboard/DashboardScreen';

describe('DashboardScreen', () => {
  it('renders the fell-for ranking from seed data', () => {
    render(<MemoryRouter><DashboardScreen /></MemoryRouter>);
    expect(screen.getByText(/fool the most people/i)).toBeInTheDocument();
    expect(screen.getAllByText(/fell for it/i).length).toBe(5);
  });
});
```

- [ ] **Step 3: Run the test**

Run: `npm test -- dashboard`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add src/features/dashboard/ tests/features/dashboard.test.tsx
git commit -m "feat: trust-team dashboard with seeded + live aggregation"
```

---

## Task 21: End-to-end verification & README

Validates the acceptance criteria in spec [`01`](../specs/phish-n-cheats/01-architecture.md) §6 and [`00`](../specs/phish-n-cheats/00-overview.md) §12.

**Files:**
- Create: `README-phish-n-cheats.md` (run instructions; keep the repo's existing `README.md` for the skills bundle)
- Modify: none (integration only)

- [ ] **Step 1: Full test suite green**

Run: `npm test`
Expected: all suites PASS.

Run: `npm run lint`
Expected: no errors.

- [ ] **Step 2: Manual play-through (use the webapp-testing skill / a browser)**

Create `.env` from `.env.example` with a real `OPENAI_API_KEY`.
Run: `npm run dev`
Walk the demo path and confirm each:
- [ ] `/` intro → "start hunting" → `/feed` shows a grid with the planted off-platform listing floated near the top (demoMode).
- [ ] Open the off-platform listing → "Chat with seller" → an opening seller message appears.
- [ ] Type a free message → seller replies in character (or a fallback line if the API is down).
- [ ] Tap the **unsafe** action ("Message them on WhatsApp") → gotcha overlay freezes the screen.
- [ ] "See what you missed" → trace report shows red flags (noticed/missed), did-vs-should, tips, score bars; personalized lines appear if the API is up.
- [ ] Open another planted listing → tap **Report** → win screen → trace shows a high score.
- [ ] `/report` shows Scam Resistance score + level, fell-for / defended / not-yet-found lists.
- [ ] `/dashboard` shows the fell-for ranking with the "+ you, tonight" note reflecting your plays.

- [ ] **Step 3: Graceful-degradation check**

Stop the proxy (leave only `vite` running, or set an invalid `OPENAI_API_KEY`).
- [ ] Chat still returns canned in-character fallback lines; the unsafe action still fires the gotcha; the trace still renders from the skeleton. The session remains fully playable and gradable.

- [ ] **Step 4: Write run instructions**

`README-phish-n-cheats.md`:
```markdown
# Phish n Cheats — run

1. `npm install`
2. `cp .env.example .env` and set `OPENAI_API_KEY` (optional — the app is playable without it via fallbacks).
3. `npm run dev` — opens the app on http://localhost:5173 with the proxy on :8787.
4. `npm test` — unit/behavior tests.

Spec: `docs/specs/phish-n-cheats/`. Plan: `docs/plans/2026-06-27-phish-n-cheats.md`.
```

- [ ] **Step 5: Commit**

```bash
git add README-phish-n-cheats.md
git commit -m "docs: phish n cheats run instructions and e2e verification"
```

---

## Self-Review

**Spec coverage:**

- 00 overview / event framing → Tasks 14 (intro/consent), 19 (report), 20 (dashboard) ✓
- 01 architecture / tech stack / data flow / secrets → Tasks 1 (toolchain), 11 (proxy), 13 (client), 21 (run) ✓
- 02 challenges (5 archetypes, quick-action model incl. `risky`) → Tasks 3, 4, 16 ✓
- 03 AI seller (provider abstraction, prompts, `/api/chat`, fallback) → Tasks 8, 9, 10, 11, 13 ✓
- 04 intervention (deterministic), scoring, hybrid trace, end-of-event → Tasks 6, 5, 12, 17, 18, 19 ✓
- 05 data model, telemetry, aggregate, dashboard → Tasks 2, 7, 12 (`toPlayRecords`), 20 ✓
- 06 screen map, theming, reduced-motion → Tasks 14, 15, 16, 17, 18, 19, 20 ✓

**Placeholder scan:** No "TBD/TODO/handle edge cases" — every code step contains full code. The only deliberate manual artifacts are bundled placeholder images (Task 4 Step 2), which is an asset step, not a code placeholder.

**Type consistency:** `ArchetypeId`, `QuickActionType` (`safe|risky|report|unsafe`), `ChallengeSignals`, `ScoreBreakdown`, `ChatRequest/Response`, `TraceRequest/Response` are defined once in Task 2 and reused verbatim. The server re-declares an identical `ArchetypeId` union and request/response shapes (Task 9/10) deliberately, to avoid importing Vite-aliased client modules into the Node proxy — flagged in those tasks. `scoreChallenge`, `eventScore`, `levelFor`, `aggregate`, `outcomeForAction`, `isSoftRisky`, `buildTraceSkeleton`, `postChat`, `postTrace`, `handleChat`, `handleTrace`, `composeSellerMessages` keep the same signatures across producer and consumer tasks.

**Sequencing note:** Tasks 16 and 17 are mutually referenced (chat imports the overlays). Implement Task 17's overlays (or the one-line stubs noted in Task 16 Step 5) before running Task 16's test. All other tasks are strictly forward-dependent.
