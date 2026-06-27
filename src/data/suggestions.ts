import type { ArchetypeId } from '@/lib/types';

// A suggested buyer message. Tapping one sends it to the LLM and gets a real
// reply, exactly like typing it yourself.
//  - neutral: ordinary marketplace small talk (no signal)
//  - safe:    a smart move that probes a red flag (credits detection)
//  - risky:   engaging with the bait (counts as a soft-risky step)
export interface Suggestion {
  id: string;
  text: string;
  kind: 'neutral' | 'safe' | 'risky';
  probesRedFlagId?: string;
}

const GENERIC: Suggestion[] = [
  { id: 'g-avail', text: 'Is this still available?', kind: 'neutral' },
  { id: 'g-meet', text: 'Can we meet up this week?', kind: 'neutral' },
  { id: 'g-lower', text: 'Can you do a bit cheaper?', kind: 'neutral' },
  { id: 'g-where', text: 'Where can we meet?', kind: 'neutral' },
  { id: 'g-cond', text: "What's the condition like?", kind: 'neutral' },
];

const BY_ARCHETYPE: Record<ArchetypeId, Suggestion[]> = {
  off_platform: [
    { id: 'op-stay', text: 'Can we just keep everything here on the app?', kind: 'safe', probesRedFlagId: 'off_platform_pressure' },
    { id: 'op-no', text: "I'd rather not move off the platform.", kind: 'safe', probesRedFlagId: 'off_platform_pressure' },
    { id: 'op-num', text: "Okay, what's your WhatsApp number?", kind: 'risky' },
    { id: 'op-why', text: 'Why do you want to chat elsewhere?', kind: 'neutral' },
    { id: 'op-pay', text: 'Can I pay through the app?', kind: 'neutral' },
  ],
  urgency_flash_sale: [
    { id: 'uf-slow', text: "I won't be rushed into this.", kind: 'safe', probesRedFlagId: 'urgency_pressure' },
    { id: 'uf-cheap', text: 'Why is it so cheap?', kind: 'safe', probesRedFlagId: 'price_too_low_urgency' },
    { id: 'uf-link', text: 'Can you send me the payment link?', kind: 'risky' },
    { id: 'uf-meet', text: 'Can I just pay on meetup?', kind: 'neutral' },
    { id: 'uf-real', text: 'Is this for real? Seems too good.', kind: 'neutral' },
  ],
  deposit_before_meetup: [
    { id: 'dm-see', text: 'Can I see it in person before paying anything?', kind: 'safe', probesRedFlagId: 'deposit_before_inspection' },
    { id: 'dm-coll', text: "I'll pay on collection, not before.", kind: 'safe', probesRedFlagId: 'hold_it_pressure' },
    { id: 'dm-how', text: 'How much deposit are you asking for?', kind: 'risky' },
    { id: 'dm-when', text: 'When are you free to meet?', kind: 'neutral' },
    { id: 'dm-why', text: 'Why a deposit to hold it?', kind: 'neutral' },
  ],
  phishing_link: [
    { id: 'pl-app', text: 'Can I just pay inside the app?', kind: 'safe', probesRedFlagId: 'payment_off_app_link' },
    { id: 'pl-card', text: 'Why do you need my card details on another site?', kind: 'safe', probesRedFlagId: 'asks_card_details' },
    { id: 'pl-link', text: 'Okay, send me the link.', kind: 'risky' },
    { id: 'pl-meet', text: 'Can we just meet up to deal?', kind: 'neutral' },
    { id: 'pl-what', text: "What's the link for?", kind: 'neutral' },
  ],
  counterfeit_item: [
    { id: 'cf-serial', text: 'Can you show a receipt or serial number?', kind: 'safe', probesRedFlagId: 'no_authenticity_proof' },
    { id: 'cf-cheap', text: 'Why is it so far below retail?', kind: 'safe', probesRedFlagId: 'price_too_low' },
    { id: 'cf-hold', text: 'Can you reserve it for me?', kind: 'risky' },
    { id: 'cf-box', text: 'Is there a box or dustbag?', kind: 'neutral' },
    { id: 'cf-auth', text: "How do I know it's authentic?", kind: 'neutral' },
  ],
};

export function suggestionPool(id: ArchetypeId): Suggestion[] {
  return [...BY_ARCHETYPE[id], ...GENERIC];
}

/** Pick `n` random suggestions, preferring ones not yet used this chat. */
export function pickSuggestions(id: ArchetypeId, used: Set<string>, n = 3): Suggestion[] {
  const pool = suggestionPool(id);
  const fresh = pool.filter((s) => !used.has(s.id));
  const source = fresh.length >= n ? fresh : pool; // exhausted → allow repeats
  const shuffled = [...source];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, n);
}
