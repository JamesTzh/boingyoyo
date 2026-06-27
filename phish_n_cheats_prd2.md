# PRD — "Phish n Cheats" (working title)

A platform-agnostic, gamified scam-inoculation event that teaches online buyers to spot fraud by letting them safely "fall for" planted scams hidden among real listings.

---

## 1. The one-liner

A marketplace runs a time-boxed, opt-in event in which realistic but fake malicious listings are seeded randomly among genuine ones. Players hunt for them across 5 scam challenges. When a player engages with a planted scam and is about to get defrauded, the system intervenes, grades how they handled it, and teaches them what they missed. It's a vaccine for scams — exposing buyers to weakened, survivable versions so they build real resistance — and it's designed to plug into any e-commerce platform, not just one.

## 2. Problem

Online marketplaces increasingly rely on user education to fight fraud, but today that education is passive — help articles and one-off campaigns that buyers ignore until after they've lost money. Over 40% of secondhand buyers worry about scams, yet most only learn the warning signs the hard way. There is no active, hands-on way for a buyer to practise spotting a scam before a real one hits them — and no good way for a platform's trust team to learn, at scale, which scam types are actually fooling their users.

## 3. Target users

Primary: everyday online buyers who opt into the event, especially newer or less scam-savvy users.

Secondary: the platform's internal trust & safety team, who receive aggregated data on which scams players fell for and use it to prioritise defences and education.

Note on positioning: the product is built to be platform-agnostic — a drop-in trust/education layer that any e-commerce marketplace (resale, classifieds, social commerce) can run. Branding and listing styles are themeable per platform.

## 4. Goal & success metrics

The goal is measurable improvement in buyers' ability to recognise and report scams, plus actionable intelligence for the platform.

Success is measured by: the share of challenges players correctly identify before proceeding; improvement across the event; the player's final grade distribution; and the quality of the aggregate "which scams fool the most people" report delivered to the trust team.

## 5. The event format

The experience is framed as a time-boxed, opt-in event — not a permanent feature. This framing is important: it makes the planted-scam mechanic transparent and consensual.

When players opt in, they're told upfront: "During this event, fake scam listings will be hidden randomly among real listings. Your mission is to find them. They're designed to look completely real — so stay sharp." This sets expectations, removes the ethical concern of deceiving users without consent, and turns it into a treasure hunt.

There are 5 scam challenges to complete during the event. Players don't know which listings are planted; the fakes are paraded as real listings and scattered throughout normal browsing. Finding and correctly handling each one completes a challenge.

## 6. The 5 challenges (scam archetypes)

Each challenge corresponds to a distinct, real-world scam pattern the player must encounter and correctly handle. A suggested set:

1. Off-platform transaction — the "seller" pushes the player to move the deal to WhatsApp/Telegram to escape platform protection.
2. Flash-sale / urgency trap — an unbelievable deal with a countdown and "only 1 left!" pressure designed to rush the player into paying.
3. Deposit-before-meetup — the seller demands an upfront deposit to "hold" a high-value item before any inspection.
4. Fake payment proof — a seller (or buyer) sends a doctored payment screenshot to trigger premature shipping or release.
5. Counterfeit / too-good-to-be-true item — a branded item priced far below market, where the red flags are in the listing details and photos.

(Final set is tunable; five is the target count so the event feels complete but achievable.)

## 7. Core experience (one challenge, the happy path)

A player browses the marketplace as normal. Among the real listings sits a planted fake — a tempting deal. The player taps it.

The listing looks real. The player opens a chat with the "seller." This is where it comes alive: the seller is an AI (OpenAI API) running a realistic scam script for that challenge's archetype — pushing urgency, nudging off-platform, asking for a deposit. The player converses naturally and the AI adapts to whatever they say.

The moment the player takes a genuinely unsafe action — agreeing to pay off-platform, clicking a payment link, sending a deposit — the system freezes the flow and reveals the gotcha: *"This was a planted scam — and you were about to fall for it."*

If instead the player spots the scam and reports it rather than proceeding, the challenge is marked as successfully defended.

## 8. Grading & end-of-event report

Two layers of feedback: per-challenge and end-of-event.

Per challenge, the system grades the player's actions — how quickly they spotted red flags, whether they engaged with the bait, whether they reported it, and what unsafe steps they took. This produces a score and a short personalised trace: a replay of the interaction with each red flag highlighted, a "what you did vs. what you should have done" comparison, and best-practice tips for that scam type.

At the end of the event, the player gets a final grade (e.g. a letter grade or a "scam resistance" score) plus a summary that does two things:
- Shows which scams they fell for during the event.
- Shows which scams they have NOT yet encountered or fallen for — nudging them to go hunt for the remaining challenges and learn those patterns too.

This "here's what you still need to learn" mechanic drives replay and ensures coverage of all 5 archetypes.

## 9. Data feedback loop to the trust team

Every play generates a signal. Aggregated across all participants, the system produces an internal report for the platform's trust & safety team: which scam archetypes fooled the most people, where players hesitated, which red flags went unnoticed, and how resistance improved over the event.

This turns the game into a live research instrument — the platform learns exactly which scams its users are most vulnerable to, and can prioritise real-world defences and education accordingly. (This is a major part of the product's value: it's both education and intelligence.)

## 10. Key features (MVP scope)

The minimum viable version needs these pieces working together:

Planted fake listings, visually indistinguishable from real ones, themeable to the host platform. For the demo, one or two crafted listings per archetype is enough; stretch goal is LLM-generated listings on demand.

AI-driven seller chat. Each "seller" reply is an OpenAI API call driving a believable, archetype-specific scam conversation that adapts to the player.

Intervention trigger. The system detects when the player crosses an unsafe line and halts to trigger the gotcha screen.

Per-challenge grading + trace. A score and an annotated replay with red flags, a do/don't comparison, and tailored tips.

End-of-event report. A final grade, the list of scams the player fell for, and the scams they still need to find.

Aggregate trust-team dashboard. A simple view summarising which scams fooled the most players (can be a single mocked screen for the demo).

## 11. Out of scope (for the hackathon)

Real reward fulfilment, deep platform/account integration, production anti-farming infrastructure, mobile-native build, and cross-session persistence. A single polished play-through plus the end-of-event report and a mocked trust-team summary is the target.

## 12. Why it hits the rubric

Innovation (30%): proactive, gamified scam inoculation across platforms is novel; the AI seller improvising a live scam is a central, inventive use of sponsor tech; and the dual output (educate the user + feed intelligence back to the trust team) is a genuinely fresh framing.

Problem fit & market value (25%): platform-agnostic design means a far larger market than one marketplace; it extends the education-first trust strategy marketplaces already pursue; and the trust-team data loop gives it standalone commercial value.

Functionality (25%): fully interactive and demoable live — judges can play a challenge themselves and get "scammed" in real time, then see their grade.

Design, craft & taste (20%): a game rewards polish; a satisfying event with grading, a report card, and a treasure-hunt feel stands out against grey fraud dashboards.

## 13. The demo moment

A judge volunteers, opts into the "event," browses, finds a great deal, chats with the AI "seller," and gets pulled toward paying off-platform — then the screen freezes: *"You just got scammed. Here's the red flag you missed."* They get graded on the spot. The room feels it, because the judge nearly fell for it too. Then you flash the trust-team dashboard: "and here's what we learned about every player tonight." That one-two punch — personal lesson + platform intelligence — is what wins.

## 14. Open questions

What exactly triggers intervention — concrete unsafe action (recommended for demo reliability) or inferred intent from the chat?
Is the final grade a letter grade, a percentage, or a themed "scam resistance level"?
Are trace reports LLM-generated for richer personalisation, or templated for demo reliability?
How are the 5 challenges surfaced — all available at once, or unlocked progressively?
