import type { RedFlag, ArchetypeId } from '@/lib/types';

export const RED_FLAGS: RedFlag[] = [
  { id: 'off_platform_pressure', archetypeId: 'off_platform', label: 'Pushing the deal off-platform', explanation: 'Moving to WhatsApp/Telegram removes buyer protection and monitoring.' },
  { id: 'urgency_pressure', archetypeId: 'urgency_flash_sale', label: 'Artificial urgency & countdown', explanation: 'Scarcity and time limits are designed to stop you thinking.' },
  { id: 'external_payment_link', archetypeId: 'urgency_flash_sale', label: 'External payment link', explanation: 'Pay only through the platform; outside links bypass protection.' },
  { id: 'price_too_low_urgency', archetypeId: 'urgency_flash_sale', label: 'Price too good to be true', explanation: 'Unrealistic prices are bait to rush you.' },
  { id: 'deposit_before_inspection', archetypeId: 'deposit_before_meetup', label: 'Deposit before inspection', explanation: "Never pay to 'hold' an item you haven't seen." },
  { id: 'hold_it_pressure', archetypeId: 'deposit_before_meetup', label: "'Lots of interest' pressure", explanation: 'Manufactured competition rushes your decision.' },
  { id: 'screenshot_not_proof', archetypeId: 'fake_payment_proof', label: "Screenshot as 'proof'", explanation: 'A screenshot can be faked; verify in the official record.' },
  { id: 'ship_before_cleared', archetypeId: 'fake_payment_proof', label: 'Rushed to ship before funds clear', explanation: 'Only ship after payment actually appears in your account.' },
  { id: 'price_too_low', archetypeId: 'counterfeit_item', label: 'Far below market price', explanation: 'Deep discounts on branded goods signal fakes.' },
  { id: 'no_authenticity_proof', archetypeId: 'counterfeit_item', label: 'No proof of authenticity', explanation: 'Genuine sellers can show receipts or serial numbers.' },
  { id: 'evasive_seller', archetypeId: 'counterfeit_item', label: 'Evasive about authenticity', explanation: 'Dodging verification questions is a red flag.' },
];

export function redFlagsFor(id: ArchetypeId): RedFlag[] {
  return RED_FLAGS.filter((f) => f.archetypeId === id);
}
