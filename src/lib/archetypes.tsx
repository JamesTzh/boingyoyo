import { BadgeCheck, HandCoins, Link2, MessageSquare, Timer, type LucideIcon } from 'lucide-react';
import type { ArchetypeId } from './types';

export interface ArchetypeMeta {
  label: string;
  short: string;
  blurb: string;
  Icon: LucideIcon;
}

// Shared, human-readable identity for each scam archetype — used by the report,
// the trust dashboard, and anywhere a scam type is named.
export const ARCHETYPE_META: Record<ArchetypeId, ArchetypeMeta> = {
  off_platform: {
    label: 'Off-platform deal',
    short: 'Off-platform',
    blurb: 'Seller pushes you onto WhatsApp to escape buyer protection.',
    Icon: MessageSquare,
  },
  urgency_flash_sale: {
    label: 'Flash-sale urgency',
    short: 'Urgency',
    blurb: 'A countdown and “only 1 left” rush you into paying now.',
    Icon: Timer,
  },
  deposit_before_meetup: {
    label: 'Deposit before meetup',
    short: 'Deposit',
    blurb: 'Pay a deposit to “hold” an item you have not seen.',
    Icon: HandCoins,
  },
  phishing_link: {
    label: 'Phishing payment link',
    short: 'Phishing link',
    blurb: 'Seller sends a fake “secure checkout” link to steal your card details.',
    Icon: Link2,
  },
  counterfeit_item: {
    label: 'Counterfeit goods',
    short: 'Counterfeit',
    blurb: 'A branded item priced far too low, with no proof it is real.',
    Icon: BadgeCheck,
  },
};
