# Scam School — Pitch Brief & Cheat Sheet

One page to glance at before and during judging. Track: **Trust, Commerce & Fraud.**

---

## THE ONE-LINER (memorize this)
> **A vaccine for online scams.** A marketplace runs an opt-in event where realistic fake scams hide among real listings. Players hunt them, chat with an AI "seller" running a live scam, and get frozen the moment they're about to get defrauded — then graded and taught. Every play also tells the platform's trust team which scams fool the most people.

**Shorter, for a hallway:** "We let people safely survive a scam so they don't fall for the real one — and the platform learns from every play."

---

## THE 3 THINGS WE WANT JUDGES TO REMEMBER
1. **Inoculation, not warnings.** Active, felt, hands-on — not another help article. *(fresh framing)*
2. **The AI seller is the product.** A live, improvising scammer (OpenAI) you can actually argue with. *(central, inventive sponsor-tech use)*
3. **Two products in one.** Educates the buyer **and** arms the platform's trust team with live intelligence. *(market value + standalone commercial value)*

---

## PRODUCT FACTS (locked — match what's on screen)
- **5 archetypes:** off-platform · urgency/flash-sale · deposit-before-meetup · fake-payment-proof · counterfeit.
- **Grade:** *Scam Resistance* score 0–100 (Detection 60 / Caution 25 / Speed 15) → level: **Rookie · Aware · Sharp · Guardian**.
- **Trigger:** deterministic client-side **unsafe-action tap** — the AI never decides the freeze (demo can't misfire).
- **Demo brand:** "Marketly" (SGD). Re-skinnable to any marketplace via one theme config.
- **Dashboard:** seeded baseline **+ the live session** ("+ you, tonight"). No database — all in-browser.

---

## RUBRIC MAP — say the line that scores the point

| Criterion | Weight | The point we make | Where it lands |
| --- | --- | --- | --- |
| **Innovation & sponsor tech** | **30%** | Proactive scam *inoculation* is novel; the AI seller improvising a live scam is a *central* OpenAI use, not bolted on; dual output (teach + intel) is a fresh framing. | Slides 3, 5, 7 + the live AI chat |
| **Problem fit & market value** | **25%** | Platform-agnostic trust layer → far bigger market than one app; extends the education-first strategy marketplaces already use; the trust-team data loop has standalone commercial value. | Slides 2, 7 |
| **Proof of work / functionality** | **25%** | Fully interactive and demoable — a judge plays it and gets "scammed" live, then sees a real grade. | The live demo |
| **Design, craft & taste** | **20%** | It's a *game* with a report card and a treasure-hunt feel — polish that stands out against grey fraud dashboards. | The build's UI + this deck |

> **Highest-leverage truth:** 55% of the score (Innovation + Market) is *communicated*, not coded. The demo + this narrative is where those points are won or lost.

---

## SPONSOR-TECH TALKING POINTS  *(Innovation is 30% — be specific)*
- **OpenAI (core):** every "seller" reply is a live API call driving an archetype-specific scam that *adapts to whatever the buyer says*. It's not a scripted chatbot — you can try to negotiate and it negotiates back. This is the central mechanic, not a feature. It sits behind a one-file `LlmProvider` abstraction — a deliberate choice that keeps it portable, so "you're an Anthropic shop using OpenAI" is a design decision, not a lock-in.
- **If asked "where else could you use sponsor tools?"** (good, ambitious answer):
  - **Exa** → ground listings in *real* market prices so "too good to be true" deals are precisely calibrated, and pull current real-world scam patterns to keep the AI seller's tactics fresh.
  - The grading/trace narration is also LLM-generated for per-player personalization.
- Keep claims honest: lead with what the build actually does (the live AI seller + grading). Frame Exa as the natural next step, not a claim you shipped it — unless you did.

---

## JUDGE Q&A — likely questions and crisp answers

**"Isn't it unethical to deceive your users with fake scams?"**
> No — it's opt-in and transparent. Players are told upfront: *fake scams are hidden here, your job is to find them.* That consent is what turns deception into a treasure hunt. It's the difference between a vaccine and an infection.

**"How is this different from a quiz or a phishing-simulation training?"**
> Phishing sims send one fake email and grade a click. We run a *live, two-way scam* — an AI that argues, pressures, and adapts in real time inside a realistic marketplace. You don't pick A/B/C/D; you actually try to make the deal and discover your own instincts fail. It's a flight simulator, not a multiple-choice test.

**"What stops the AI seller from saying something harmful or breaking character?"**
> It's constrained to a fixed archetype system prompt per challenge with guardrails. And critically, the *intervention is triggered by a concrete unsafe action* — the player taps a button flagged `unsafe` (e.g. "Pay on WhatsApp"). That's deterministic client-side logic; the LLM is **never in the gotcha path**, so it can't misfire on stage and the lesson is precise.

**"Who pays for this / what's the business model?"**
> The marketplace's trust & safety team. Today they spend on passive education with no feedback loop. We give them measurable buyer resistance *and* a live report on which scams are working — that intelligence alone justifies the spend. Platform-agnostic, so it's one product sold to many marketplaces.

**"How do you know it actually makes people safer?"**
> We measure it: the share of challenges spotted before proceeding, improvement across the event (later challenges handled better than earlier ones), and the final Scam Resistance score + level. The same data that teaches the user proves the impact to the platform.

**"Does it actually work / what did you build?"**
> Yes — you just played it. The live AI seller, the intervention freeze, per-challenge grading and the annotated trace are working. *(Then offer a second archetype if time.)*

**"What if everyone learns the 5 scams and it gets stale?"**
> Archetypes are templates; the AI generates fresh listings and conversations each run, and new archetypes plug in as scams evolve. The trust-team feedback loop tells us which new patterns to add first.

---

## DEMO FAIL-SAFES (see DEMO_SCRIPT.md for full choreography)
- Turn on **`demoMode`** so a planted listing floats to the top of the feed — no hunting on stage.
- Pre-load a **45–60s screen recording** of a perfect run; cut to it if wifi/API dies.
- A savvy judge who *spots* the scam is still a win → the **win screen** ("Nice — you spotted the scam") + a high score, then play the recording so the room still sees the freeze.
- Tape a one-line instruction to the laptop so the judge doesn't freeze up.
- Use the **off-platform** archetype live (the MacBook listing) — fastest to trigger via the "Pay on WhatsApp" tap, most recognizable.

---

## PRE-PRESENTATION CHECKLIST
- [ ] Laptop charged, screen mirroring tested on the actual room display
- [ ] Wifi tested; phone hotspot as backup
- [ ] OpenAI API key working + a little quota headroom; one rehearsal call made today
- [ ] `demoMode` ON; theme set to "Marketly"
- [ ] Fallback screen recording saved locally and openable offline
- [ ] One planted listing + one genuine decoy confirmed working end-to-end
- [ ] Trust-team dashboard screen loads (seeded + "+ you, tonight" live)
- [ ] Browser zoom set so text is readable from the back of the room
- [ ] Notifications/Slack silenced; demo run in a clean browser window
- [ ] Roles assigned: Pitcher / Driver / Backup volunteer
- [ ] One full rehearsal of all 3 demo branches done out loud
