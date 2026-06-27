# Phish n Cheats — Pitch & Demo Kit

Everything for presenting **Phish n Cheats** to the judges. Aligned to the approved spec set
([`../specs/phish-n-cheats/00-overview.md`](../specs/phish-n-cheats/00-overview.md)) and the PRD
(`../../phish_n_cheats_prd2.md`).

> **Why this matters:** judging is **Innovation 30% · Problem fit/Market 25% · Functionality 25% ·
> Design 20%**. ~55% of that (Innovation + Market) is *communicated*, not coded — this kit is where
> those points are won.

## What's here

| File | Use it for |
|---|---|
| [`deck.html`](deck.html) | The 9-slide pitch deck (self-contained, zero-dependency). **Open in a browser:** arrow keys / space / swipe to navigate, **E** to edit any text inline, **Ctrl+S** to export your edits. |
| [`deck.pdf`](deck.pdf) | Static export of the deck — for submission. |
| [`DEMO_SCRIPT.md`](DEMO_SCRIPT.md) | The ~3-min **recorded-video** script: slide-by-slide voiceover (pitch video) + the demo screen-recording shot list with VO, plus a capture/edit checklist. |
| [`PITCH_BRIEF.md`](PITCH_BRIEF.md) | One-page cheat sheet: rubric map, sponsor-tech talking points, **judge Q&A**, locked product facts, submission checklist. |

## The narrative (one line)

> **Don't warn people about scams — let them survive one.** Buyers are sure it won't happen to them,
> and don't know the patterns that get them. So a buyer nearly gets scammed by an AI seller → freeze +
> grade; then the trust-team dashboard: *"here's what we learned about every player."* Personal lesson
> + platform intelligence — the one-two punch.

## Locked facts this kit reflects (keep in sync with the specs)

- **5 archetypes:** off-platform · urgency/flash-sale · deposit-before-meetup · phishing payment link · counterfeit.
- **Grade:** *Scam-Resistance* 0–100 (Detection 60 / Caution 25 / Speed 15) → **Rookie · Aware · Sharp · Guardian**.
- **Trigger:** end the chat with **Make offer** vs **Report this listing**; an **LLM judge** rules *scammed / avoided* and explains why (deterministic offline fallback: Make offer → scammed). *(The specs describe the original deterministic-tap design; the build now uses the judge.)*
- **Demo archetype:** off-platform — the **iPhone** listing (seller `kevin_deals`). (`demoMode` isn't wired; the planted **MacBook flash-sale** already tops the feed by likes.)
- **Demo brand:** "Carouza" (SGD), re-skinnable via `theme.config.ts` ([`06-ui-and-theming.md`](../specs/phish-n-cheats/06-ui-and-theming.md)).
- **Dashboard:** seeded baseline **+ the live session** ("+ you, tonight") ([`05-data-and-dashboard.md`](../specs/phish-n-cheats/05-data-and-dashboard.md)).

## Regenerating the PDF after editing the deck

The deck is the source of truth; the PDF is a render of it. To refresh the PDF after editing
`deck.html`, use the team's `frontend-slides` skill export
(`.claude/skills/frontend-slides/scripts/export-pdf.sh deck.html`) or any headless-Chromium
print-to-PDF at 1920×1080.
