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
  phishing_link: {
    archetypeId: 'phishing_link',
    quickActions: [
      { id: 'pl_safe', label: 'Can I pay in the app instead?', type: 'safe', probesRedFlagId: 'payment_off_app_link' },
      { id: 'pl_risky', label: 'Open the link', type: 'risky' },
      { id: 'pl_report', label: 'Report this listing', type: 'report' },
      { id: 'pl_unsafe', label: 'Enter my card details', type: 'unsafe' },
    ],
    didVsShould: {
      did: ["Paid through the seller's external link / entered card details off-platform."],
      should: ['Paid only inside the app and never entered card details on an outside link.'],
    },
    tips: ["Never pay through links sent in chat — use the app's own checkout.", 'A link that asks for your card or bank login is how the scam steals from you.'],
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
