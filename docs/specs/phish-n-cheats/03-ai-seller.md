# 03 — The AI Seller (OpenAI integration)

The AI seller is the centrepiece (Innovation 30%): each "seller" reply is a live LLM call running an
archetype-specific scam script that adapts to whatever the player types. This spec defines the prompts,
guardrails, model config, the provider abstraction, the `/api/chat` contract, and failure handling.

## 1. Responsibilities (and non-responsibilities)

The AI seller **does**:

- Stay in character as a marketplace seller (or buyer, for Challenge 4) running one archetype's scam.
- Adapt to the player's messages — answer questions, deflect, escalate pressure, stay believable.
- Make the **unsafe action tempting** through conversation.

The AI seller **does not**:

- Decide when the gotcha fires — that's a deterministic client-side check on a tapped `unsafe`
  button (see [`04-grading-and-reports.md`](04-grading-and-reports.md)).
- Reveal that it's a planted scam or break character.
- Produce the quick-action buttons' *semantics* — those come from challenge data, not the model.

Keeping outcome control out of the model is what makes the demo reliable.

## 2. Provider abstraction (`LlmProvider`)

A one-interface seam so OpenAI (default/sponsor) can be swapped for Claude or others in one file.

```ts
// server/llm/provider.ts
export interface ChatTurn { role: 'system' | 'user' | 'assistant'; content: string }

export interface LlmProvider {
  /** Returns the seller's next message as plain text. */
  complete(messages: ChatTurn[], opts?: { temperature?: number; maxTokens?: number }): Promise<string>;
}
```

```ts
// server/llm/openai.ts
import OpenAI from 'openai';
import type { LlmProvider, ChatTurn } from './provider';

export function createOpenAiProvider(): LlmProvider {
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const model = process.env.OPENAI_MODEL ?? 'gpt-4o-mini';
  return {
    async complete(messages, opts) {
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

`AI_PROVIDER` env selects the implementation in a small factory; adding `createClaudeProvider()` later
is the only change needed to switch.

## 3. Model & parameters

- **Model:** fast OpenAI chat model via `OPENAI_MODEL` (default `gpt-4o-mini`-class). Latency is a
  stage risk; favour speed over maximum quality.
- **Temperature:** ~0.8 for the seller (natural, varied); ~0.4 for trace generation
  (see [`04-grading-and-reports.md`](04-grading-and-reports.md)) where consistency matters.
- **max_tokens:** ~220 for seller replies (chat-sized, snappy).
- **Streaming:** optional stretch goal for a "typing" feel; MVP is a single response with a typing
  indicator while it loads.

## 4. Prompt structure

Each call is: **`[system: archetype prompt] + [conversation history] + [latest player message]`**.

The **system prompt** is composed from:

1. A shared **base persona** (marketplace context, theme name/currency, in-character rules).
2. The **archetype-specific scam script** (goal, beats, what to push, what to never say).
3. **Hard guardrails** (see §6).

The theme values (`brandName`, `currency`) are injected from `theme.config.ts` so the seller speaks
in the host platform's voice (platform-agnostic).

### Shared base persona (template)

```
You are a SELLER on {{brandName}}, a second-hand marketplace. Prices are in {{currency}}.
You are messaging a potential buyer about your listing: "{{listingTitle}}" ({{listingPrice}}).
Stay fully in character as this seller at all times. Write short, casual chat messages
(1–3 sentences), like real marketplace DMs. Never break character. Never say or imply that
you are an AI, a bot, a test, a game, or that this is a scam. If asked directly if you're a
scam, deflect naturally like a real scammer would ("haha no, I'm legit, lots of happy buyers").
Adapt to what the buyer says. Do not narrate your intentions.
```

(For Challenge 4 the base swaps SELLER↔BUYER: "You are a BUYER messaging a seller…".)

### Archetype scripts (system-prompt bodies)

**1 — Off-platform (`off_platform`)**
```
Your goal: get the buyer to continue the deal on WhatsApp or Telegram, off this platform.
Start friendly and helpful. Within a couple of messages, suggest moving to WhatsApp because
"it's easier / I check it more". Offer a number if they seem willing. Gently insist it's
faster and safer there. Do NOT mention payment links here — your only aim is to move them
off-platform. If they refuse, keep nudging once or twice, then act a bit impatient.
```

**2 — Urgency / flash sale (`urgency_flash_sale`)**
```
Your goal: rush the buyer into paying immediately, ideally via the link you provide.
Stress scarcity ("only 1 left", "3 other people asking right now") and time pressure
("I can only hold it for the next 10 minutes"). When they show interest, push a payment
link and tell them to pay now to lock it in. If they hesitate, escalate urgency and hint
you'll sell to someone else. Never agree to a relaxed timeline.
```

**3 — Deposit before meetup (`deposit_before_meetup`)**
```
Your goal: get the buyer to send an upfront deposit to "hold" the item before any meetup.
Claim lots of interest. Ask for a deposit (e.g. 20–30% of the price) to reserve it for them.
Resist meeting or letting them inspect before the deposit ("too many time-wasters, serious
buyers pay a deposit first"). If they push to meet first, repeat that the deposit secures it.
```

**4 — Fake payment proof (`fake_payment_proof`, role-flip: you are the BUYER)**
```
You are the BUYER. Your goal: get the seller to ship / release the item before real payment
clears, using a fake payment screenshot as "proof". Claim you've already paid and that you
sent a screenshot. Express urgency ("I need it today", "I'm travelling"). Push them to mark
it shipped or release it now based on your screenshot. If they say they can't see the payment,
insist it's "processing / on your bank's side" and keep pressing.
```

**5 — Counterfeit / too-good (`counterfeit_item`)**
```
Your goal: sell a branded item that is (implied) counterfeit at a too-low price, while
avoiding any real authentication. Talk up the bargain. When asked about authenticity, receipts,
or serials, deflect vaguely ("it's 100% original, my cousin got it overseas", "I don't have the
receipt but trust me"). Discourage verification and nudge a quick purchase before they
overthink it. Never provide genuine proof of authenticity.
```

## 5. `/api/chat` contract

```
POST /api/chat
Request:
{
  "archetypeId": "deposit_before_meetup",
  "theme": { "brandName": "Marketly", "currency": "SGD" },
  "listing": { "title": "PS5 Slim, like new", "price": 380 },
  "history": [ { "role": "player" | "seller", "text": "..." }, ... ]
}

Response:
{
  "reply": "I've got 4 people keen — send a $80 deposit and I'll hold it for you 👍",
  "stage": "deposit_requested"   // optional enum; see below
}
```

- The proxy maps `history` (player/seller) → OpenAI `messages` (user/assistant), prepends the
  composed system prompt, calls `LlmProvider.complete`, returns `reply`.
- **`stage`** (optional): a per-archetype enum (e.g. `intro | pushing | deposit_requested`) the
  client uses only to **time the reveal** of the relevant quick-action button. It never changes a
  button's meaning. MVP can omit `stage` and instead reveal the archetype's quick-actions after the
  first seller reply — `stage` is a polish enhancement, not a dependency.
- The proxy is **stateless**; the browser owns the conversation and resends `history` each call.

> **Quick-actions are NOT generated by the model.** They live in `src/data/challenges.ts` with fixed
> `safe | report | unsafe` semantics. The model only produces conversational `reply` text. This is
> the deterministic guarantee.

## 6. Guardrails

Enforced in the system prompt and reinforced by short max_tokens:

- Never reveal it's a game/test/AI/scam; never break character.
- Keep messages short and chat-like; no markdown walls, no lists.
- Stay within the archetype's goal — don't, e.g., ask for a deposit in the off-platform challenge.
- No genuinely harmful content: the "scam" is simulated marketplace pressure only. No real payment
  details, no real external links (the "payment link" / "WhatsApp number" are rendered as inert
  in-app buttons, not live URLs — see [`02-challenges.md`](02-challenges.md#4-the-quick-action-model)).
- Content-safety: rely on the provider's built-in moderation; the scenarios are benign role-play of
  marketplace tactics, so no extra filtering is required, but keep prompts free of real PII.

## 7. Latency & failure handling

The demo cannot stall on a slow/failed API call:

- **Timeout:** proxy aborts the upstream call at ~8s.
- **Fallback replies:** on timeout/error, the proxy returns a **canned, in-character fallback line**
  per archetype (e.g. off-platform → "so do you wanna just chat on WhatsApp? easier there"). The
  conversation continues; the unsafe quick-action is still available, so the challenge is completable
  even if the LLM is down. Fallbacks live alongside the prompts in `server/prompts/`.
- **Typing indicator:** the client shows a typing state while awaiting `reply`; if the fallback is
  used, the player can't tell.
- **Retries:** one quick retry on a 5xx before falling back; no retry on timeout (just fall back).

This pairs with the templated **trace** fallback in
[`04-grading-and-reports.md`](04-grading-and-reports.md): the entire experience degrades gracefully to
a fully playable, fully gradable session with zero LLM availability.
