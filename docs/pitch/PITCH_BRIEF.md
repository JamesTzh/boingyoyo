# Phish n Cheats — Pitch Brief & Cheat Sheet

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
| **Proof of work / functionality** | **25%** | Fully working, shown end-to-end — the demo video is one real, unedited play-through: get "scammed," then see the grade. | The demo video |
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
> Yes — the demo video is one unedited play-through. The live AI seller, the intervention freeze, per-challenge grading and the annotated trace are all working and on screen.

**"What if everyone learns the 5 scams and it gets stale?"**
> Archetypes are templates; the AI generates fresh listings and conversations each run, and new archetypes plug in as scams evolve. The trust-team feedback loop tells us which new patterns to add first.

---

## VIDEO PRODUCTION (full script + shot list in DEMO_SCRIPT.md)
- Two recordings: **pitch video** (voiceover over the deck) + **demo video** (one unedited play-through). Target ~3:00 total.
- Turn on **`demoMode`** so the planted listing is fast to reach — no hunting on camera.
- Demo the **off-platform** archetype (the "Pay on WhatsApp" listing) — fastest, most recognizable trigger.
- Record real time — **don't speed up the AI chat**; it adapting live is the proof. Burn in captions (judged with sound off).
- Hold ~1s on the freeze stamp and on the grade. The freeze is deterministic client-side, so it fires every take.

---

## SUBMISSION CHECKLIST
- [ ] OpenAI API key working + quota headroom; warm-up chat done so the first reply isn't cold
- [ ] `demoMode` ON; theme set; one planted listing + one genuine decoy working end-to-end
- [ ] Trust-team dashboard loads (seeded + "+ you, tonight" live)
- [ ] Demo recorded at 1080p/60, real time, 2–3 takes — cleanest one picked
- [ ] Captions burned in; sharp sound cue on the freeze; total runtime under ~3:00
- [ ] Pitch VO recorded over the deck; hard cut into the demo at the title card
- [ ] Final video plays start-to-finish with sound off and on; uploaded + link tested
