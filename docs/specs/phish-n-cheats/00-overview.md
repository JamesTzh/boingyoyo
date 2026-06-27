# Phish n Cheats — Overview & Design Index

> **Status:** Approved design (hackathon MVP). Source of truth: `phish_n_cheats_prd2.md`.
> **Date:** 2026-06-27.

This is the canonical design doc and index for the **Phish n Cheats** spec set. Read this first, then
the numbered specs in order.

| # | Spec | Covers |
|---|---|---|
| 00 | this file | Vision, users, goals, locked decisions, scope, rubric mapping |
| 01 | [`01-architecture.md`](01-architecture.md) | Architecture, tech stack, data flow, repo layout, run/deploy |
| 02 | [`02-challenges.md`](02-challenges.md) | Event framing + the 5 scam archetypes in detail |
| 03 | [`03-ai-seller.md`](03-ai-seller.md) | OpenAI seller: prompts, guardrails, `/api/chat`, provider abstraction |
| 04 | [`04-grading-and-reports.md`](04-grading-and-reports.md) | Intervention, scoring, trace report, end-of-event card |
| 05 | [`05-data-and-dashboard.md`](05-data-and-dashboard.md) | Data model, telemetry, trust-team dashboard |
| 06 | [`06-ui-and-theming.md`](06-ui-and-theming.md) | Screen map, visual direction, theming |

---

## 1. One-liner

A marketplace runs a time-boxed, opt-in **event** in which realistic but fake malicious listings are
seeded among genuine ones. Players hunt them across **5 scam challenges**. When a player engages with
a planted scam and is about to be defrauded, the system **freezes the flow**, grades how they handled
it, and teaches them what they missed. It's a *vaccine for scams* — exposing buyers to weakened,
survivable versions so they build real resistance — and it's a **platform-agnostic** drop-in layer,
not tied to one marketplace.

## 2. Problem

Marketplace fraud education today is passive — help articles and one-off campaigns buyers ignore
until after they've lost money. Over 40% of secondhand buyers worry about scams, yet most learn the
warning signs the hard way. There is no active, hands-on way to *practise* spotting a scam before a
real one hits — and no good way for a trust team to learn, at scale, which scam types actually fool
their users.

## 3. Target users

- **Primary:** everyday online buyers who opt into the event, especially newer/less scam-savvy users.
- **Secondary:** the platform's **trust & safety team**, who receive aggregated intelligence on which
  scams fooled the most players and use it to prioritise defences and education.

The product is **platform-agnostic** — branding and listing styles are themeable per platform (see
[`06-ui-and-theming.md`](06-ui-and-theming.md)).

## 4. Goals & success metrics

**Goal:** measurable improvement in buyers' ability to recognise and report scams, plus actionable
intelligence for the platform.

**Measured by:**

- Share of challenges a player correctly **identifies & reports before proceeding** (detection rate).
- **Improvement** across the event (later challenges handled better than earlier ones).
- Final **grade distribution** (Scam Resistance score & level).
- Quality of the aggregate **"which scams fool the most people"** report for the trust team.

## 5. Event format & consent

Framed as a **time-boxed, opt-in event** — not a permanent feature. On opt-in the player is told
upfront:

> *"During this event, fake scam listings are hidden randomly among real ones. Your mission is to
> find them. They're designed to look completely real — so stay sharp."*

This makes the planted-scam mechanic **transparent and consensual**, removing the ethics concern of
deceiving users, and turns it into a treasure hunt. There are **5 challenges**; players don't know
which listings are planted.

## 6. Locked design decisions

These were settled during brainstorming and drive the whole build:

| Decision | Choice | Rationale |
|---|---|---|
| Architecture | Frontend-first + thin AI proxy, **no DB** | Fastest, most demo-reliable; matches no-persistence scope |
| Intervention trigger | **Concrete unsafe action** | Deterministic on stage (PRD-recommended) |
| Grade presentation | **"Scam Resistance" score (0–100) + level** | On-brand with the vaccine framing; game-y, memorable |
| Trace report | **Hybrid** templated skeleton + LLM lines | Personalised but with a reliable fallback |
| Challenge surfacing | **All 5 scattered**, any order | True treasure-hunt; enables "scams you haven't found yet" nudge |
| AI provider | **OpenAI** default, behind a swappable abstraction | Sponsor tech; abstraction keeps it portable |

## 7. The 5 challenges (at a glance)

1. **Off-platform transaction** — seller pushes the deal to WhatsApp/Telegram to escape protection.
2. **Flash-sale / urgency trap** — unbelievable deal, countdown, "only 1 left!" pressure.
3. **Deposit-before-meetup** — upfront deposit demanded to "hold" a high-value item before inspection.
4. **Fake payment proof** — a doctored payment screenshot pushes premature shipping/release.
5. **Counterfeit / too-good-to-be-true** — branded item far below market; red flags in details/photos.

Full specs (listings, seller beats, red flags, triggers) in [`02-challenges.md`](02-challenges.md).

## 8. End-of-event report

A final **Scam Resistance score + level** plus a summary that:

- Shows which scams the player **fell for**.
- Shows which scams they **haven't yet encountered or fallen for** — nudging them to hunt the rest.

This "here's what you still need to learn" mechanic drives replay and ensures coverage of all 5
archetypes. Details in [`04-grading-and-reports.md`](04-grading-and-reports.md).

## 9. Data feedback loop

Every play emits signals. Aggregated, they produce an internal **trust-team dashboard**: which
archetypes fooled the most people, where players hesitated, which red flags went unnoticed. For the
hackathon this is a **seeded baseline augmented live** with the current session's play. Details in
[`05-data-and-dashboard.md`](05-data-and-dashboard.md).

## 10. Scope

**In scope (MVP):** planted listings (1–2 crafted per archetype), AI-driven seller chat, concrete
unsafe-action intervention + gotcha, per-challenge grading + trace, end-of-event report, trust-team
dashboard (seeded + live).

**Out of scope (mirrors PRD §11):** real reward fulfilment/payments, account/platform integration,
anti-farming infrastructure, mobile-native build, cross-session persistence. Target: **one polished
play-through** + end-of-event report + the dashboard.

## 11. Rubric mapping

| Criterion | Weight | How the design wins it |
|---|---|---|
| Innovation | 30% | Proactive, gamified inoculation; AI seller improvising a live scam; dual output (educate + intel) |
| Problem fit & market value | 25% | Platform-agnostic → bigger market; extends education-first trust strategy; standalone data value |
| Functionality | 25% | Fully interactive, demoable live — a judge gets "scammed" then graded on the spot |
| Design, craft & taste | 20% | A polished game with a report card and treasure-hunt feel vs. grey fraud dashboards |

## 12. The demo moment

A judge opts in, browses, finds a great deal, chats with the AI "seller," gets pulled toward paying
off-platform — then the screen freezes: *"You just got scammed. Here's the red flag you missed."*
They're graded on the spot. Then the trust-team dashboard: *"and here's what we learned about every
player tonight."* Personal lesson + platform intelligence — the one-two punch that wins.
