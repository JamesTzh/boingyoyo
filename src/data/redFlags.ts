import type { RedFlag, ArchetypeId } from '@/lib/types';

export const RED_FLAGS: RedFlag[] = [
  { id: 'off_platform_pressure', archetypeId: 'off_platform', label: 'Pushing the deal off-platform', explanation: 'Moving to WhatsApp/Telegram removes buyer protection and monitoring.' },
  { id: 'urgency_pressure', archetypeId: 'urgency_flash_sale', label: 'Artificial urgency & countdown', explanation: 'Scarcity and time limits are designed to stop you thinking.' },
  { id: 'external_payment_link', archetypeId: 'urgency_flash_sale', label: 'External payment link', explanation: 'Pay only through the platform; outside links bypass protection.' },
  { id: 'price_too_low_urgency', archetypeId: 'urgency_flash_sale', label: 'Price too good to be true', explanation: 'Unrealistic prices are bait to rush you.' },
  { id: 'deposit_before_inspection', archetypeId: 'deposit_before_meetup', label: 'Deposit before inspection', explanation: "Never pay to 'hold' an item you haven't seen." },
  { id: 'hold_it_pressure', archetypeId: 'deposit_before_meetup', label: "'Lots of interest' pressure", explanation: 'Manufactured competition rushes your decision.' },
  { id: 'payment_off_app_link', archetypeId: 'phishing_link', label: 'Pushed to pay via an outside link', explanation: 'Pay only through the app — links to “secure checkout” pages can steal your details.' },
  { id: 'asks_card_details', archetypeId: 'phishing_link', label: 'Asked for card / bank login details', explanation: 'A real checkout never makes you re-enter card or banking details on another site.' },
  { id: 'lookalike_link', archetypeId: 'phishing_link', label: 'Suspicious look-alike link', explanation: 'Scam links mimic the real site to harvest your login or card.' },
  { id: 'price_too_low', archetypeId: 'counterfeit_item', label: 'Far below market price', explanation: 'Deep discounts on branded goods signal fakes.' },
  { id: 'no_authenticity_proof', archetypeId: 'counterfeit_item', label: 'No proof of authenticity', explanation: 'Genuine sellers can show receipts or serial numbers.' },
  { id: 'evasive_seller', archetypeId: 'counterfeit_item', label: 'Evasive about authenticity', explanation: 'Dodging verification questions is a red flag.' },
];

export function redFlagsFor(id: ArchetypeId): RedFlag[] {
  return RED_FLAGS.filter((f) => f.archetypeId === id);
}
