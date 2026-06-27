# Scam School — Demo Script & Run-of-Show

**Target length:** ~3:00 of speaking with a live, interactive demo in the middle.
**Golden rule:** the pitch *is* the live demo. Talk as little as possible before you get a judge playing. The room remembers the moment a judge almost gets scammed — not your slides.

> Roles: **Pitcher** (talks, runs the room) · **Driver** (controls the laptop/screen) · **Backup** (ready to play the "buyer" if no judge volunteers, and owns the fallback recording). One person can do Pitcher+Driver if needed, but having a Driver lets the Pitcher keep eye contact with the judges.

---

## RUN-OF-SHOW (the 3 minutes)

### 0:00 – 0:20 · Hook + one-liner  `[SLIDE 1: Title]`
> "Quick question — who here has bought something off Carousell, Facebook Marketplace, eBay? … Keep your hand up if you'd bet you could never get scammed. *(beat)* That confidence is exactly the problem.
>
> We built **Scam School** — a vaccine for online scams. Instead of warning people about fraud, we let them safely survive one."

*Don't over-explain. Move.*

### 0:20 – 0:40 · Problem  `[SLIDE 2: Problem]`
> "Over 40% of secondhand buyers say they're afraid of getting scammed. But the way platforms fight this today is **passive** — help articles and warning banners nobody reads until *after* they've lost the money. You can't read your way to instinct."

### 0:40 – 1:00 · The insight + what it is  `[SLIDE 3: Inoculation] → [SLIDE 4: What it is]`
> "So we borrowed an idea from medicine. A vaccine works by exposing you to a weakened, survivable version of a threat so your body learns to fight the real one.
>
> Scam School is an **opt-in, time-boxed event** any marketplace can run. We hide realistic fake scam listings among the real ones. Five scams are out there. Your job: find them before they find you. And here's the part that makes it real —"

### 1:00 – 2:15 · LIVE DEMO  `[SLIDE 6: "Watch a judge almost fall for it"]`
> "— I need a volunteer. Someone who's *sure* they'd never get scammed."

**→ Hand the laptop to a judge. (Choreography & branches below.)**

Narrate lightly while they browse:
> "Just shop like you normally would. See a deal you like? Tap it. Chat with the seller like you would on any app."

The "seller" is an **AI running a live scam** (OpenAI). Let the judge converse. Stay quiet — let the AI do the work. Alongside the free-text box the chat shows tappable **quick-action buttons**; the unsafe one is deliberately styled to look like the *tempting* move (e.g. **"Pay on WhatsApp"**). The instant they tap it:

**→ SCREEN FREEZES (blur + shake) → the gotcha card slams in: "⚠️ This was a planted scam — and you were about to fall for it."**

> "*(to the room, grinning)* And they walked right into it — same as 40% of real buyers would."

*(Why this is bulletproof: the freeze is triggered by tapping a button flagged `unsafe` — it's deterministic client-side logic, the AI never decides when to fire it. The demo can't misfire.)*

### 2:15 – 2:35 · The grade + the trace  `[stay on the demo screen]`
> "Now Scam School does what a help article never could: it grades them on the spot — a **Scam Resistance score and a level, from Rookie to Guardian** — replays the conversation, and highlights the exact red flag they missed: 'this is where a real seller would never push you off-platform.' That's a lesson they'll actually remember, because they *felt* it."

### 2:35 – 2:55 · The one-two punch: trust intelligence  `[SLIDE 7: Dual output]`
> "But the player isn't the only one who learns. **Every play feeds the platform's trust team** a live report: which scams fooled the most people, where they hesitated, which red flags went unnoticed. So it's two products in one — it *teaches the buyer* and it *arms the platform*. And because it's platform-agnostic, any marketplace can drop it in."

### 2:55 – 3:05 · Close  `[SLIDE 8: Close]`
> "Don't warn people about scams. **Let them survive one.** That's Scam School."

*(Stop talking. Smile. Take questions.)*

---

## LIVE DEMO CHOREOGRAPHY — and why it CAN'T fail

The demo is designed so **every possible judge outcome is a win.** Script all three branches so nothing throws you.

### Branch A — Judge falls for it  *(the dream)*
- Let the freeze/stamp land. Pause for the laugh.
- "You're in good company — that's the most common scam in real life."
- Go to grade + trace. This is the strongest version. Don't rush it.

### Branch B — Judge spots it and refuses / reports  *(also a win)*
- They tap the **"Report"** button → the **win overlay** fires: **"✅ Nice — you spotted the scam."** → their breakdown shows a high Scam Resistance score (defended = full Detection points).
- "Perfect — that's exactly the instinct we're building. You reported it instead of paying. *That's* a defended challenge, and most people don't manage it on their first try."
- Then: "Let me show you the version 40% of buyers experience —" and run the **fallback recording** (below) or replay yourself driving the naive path, so the room still sees the freeze moment.

### Branch C — Judge stalls / is shy / nothing volunteers
- Backup person steps in immediately: "I'll play a typical buyer." Drive it yourself, narrating as a slightly-too-trusting shopper. Keep momentum — never let dead air form.

### Pre-loaded safety net (set up BEFORE you present)
1. **Turn on `demoMode`** — it floats a planted listing near the top of the **Marketly** feed so the judge lands on the bait fast, no hunting. This is the on-stage reliability lever; don't present without it.
2. **Screen recording** of one perfect play-through (browse → bait → chat → freeze → grade → dashboard), 45–60s, paused on the title and ready to play full-screen. If wifi/API dies mid-demo, you cut to this without missing a beat.
3. **A known-good listing + archetype.** Use the **off-platform** challenge for the live demo (the *MacBook Pro 14" M3* planted listing) — it's the fastest to trigger via the "Pay on WhatsApp" quick-action and the most universally recognizable. Don't improvise which challenge to show.
4. **One short, pre-tested judge prompt** taped to the laptop: "Shop → tap the great deal up top → chat → do what feels natural." Decision fatigue kills live demos.
5. **Refresh-safe:** progress persists in `sessionStorage`, so an accidental reload mid-demo won't reset the play.

---

## TIMING FLEX

| If you have… | Cut / Add |
| --- | --- |
| **2 min** | Cut the trace detail (2:15–2:35) to one sentence. Keep the freeze and the dashboard. |
| **5 min** | After the close, show a 2nd archetype quickly (counterfeit or deposit-before-meetup) and spend more time on the trust-team dashboard + business model. |
| **API is down** | Go straight to the fallback recording. Narrate over it in present tense as if live. |

---

## THE TWO IMAGES THAT WIN THE ROOM
1. **The freeze + red stamp** — a real person nearly defrauded in front of everyone.
2. **The trust-team dashboard** — "and here's what we learned about *every* player tonight."

If you nail only those two beats, you've hit Innovation (30%) and Market Value (25%). Everything else is connective tissue.
