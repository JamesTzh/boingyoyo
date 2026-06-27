import type { Listing, ArchetypeId } from '@/lib/types';

const CUR = 'SGD';

export const LISTINGS: Listing[] = [
  // ---- Planted (the 5 challenges) ----
  {
    id: 'p-off',
    archetypeId: 'off_platform',
    isPlanted: true,
    title: 'iPhone 14, 128GB, great condition',
    price: 720,
    marketPrice: 750,
    currency: CUR,
    photos: ['/listings/phone.jpg'],
    sellerName: 'kevin_deals',
    sellerBadges: ['Quick replies'],
    description: 'Selling my iPhone 14, barely used. Message me, I reply fast!',
  },
  {
    id: 'p-urg',
    archetypeId: 'urgency_flash_sale',
    isPlanted: true,
    title: 'PS5 Slim BNIB — FLASH SALE 🔥',
    price: 199,
    marketPrice: 650,
    currency: CUR,
    photos: ['/listings/console.jpg'],
    sellerName: 'gamerdrop_sg',
    sellerBadges: ['Only 1 left!'],
    description: 'Brand new sealed PS5 Slim. Crazy price, going FAST. Pay to lock it in!',
  },
  {
    id: 'p-dep',
    archetypeId: 'deposit_before_meetup',
    isPlanted: true,
    title: 'Specialized road bike, like new',
    price: 880,
    marketPrice: 950,
    currency: CUR,
    photos: ['/listings/bike.jpg'],
    sellerName: 'cycle_jane',
    sellerBadges: [],
    description: 'Great bike, lots of interest. Serious buyers only please.',
  },
  {
    id: 'p-pay',
    archetypeId: 'fake_payment_proof',
    isPlanted: true,
    playerIsSeller: true,
    title: 'YOUR LISTING: Nintendo Switch OLED',
    price: 320,
    currency: CUR,
    photos: ['/listings/switch.jpg'],
    sellerName: 'you',
    sellerBadges: ['Your listing'],
    description: 'You are selling this item. A buyer has just messaged you.',
  },
  {
    id: 'p-cnt',
    archetypeId: 'counterfeit_item',
    isPlanted: true,
    title: 'Louis Vuitton Neverful (authentic!)',
    price: 250,
    marketPrice: 2200,
    currency: CUR,
    photos: ['/listings/bag.jpg'],
    sellerName: 'luxe_finds88',
    sellerBadges: [],
    description: '100% original LV bag, overseas purchase. No box. Trust me, real deal!',
  },
  // ---- Genuine decoys ----
  { id: 'd-1', archetypeId: null, isPlanted: false, title: 'IKEA desk lamp', price: 12, currency: CUR, photos: ['/listings/lamp.jpg'], sellerName: 'home_clearout', description: 'Working lamp, minor scratches. Self-collect.' },
  { id: 'd-2', archetypeId: null, isPlanted: false, title: 'Uniqlo down jacket, M', price: 35, currency: CUR, photos: ['/listings/jacket.jpg'], sellerName: 'wardrobe_reset', description: 'Worn a few times, clean. Meetup at MRT.' },
  { id: 'd-3', archetypeId: null, isPlanted: false, title: 'Dyson V8 vacuum', price: 240, marketPrice: 260, currency: CUR, photos: ['/listings/vacuum.jpg'], sellerName: 'sgcleanhome', sellerBadges: ['Verified'], description: 'Strong suction, comes with attachments.' },
  { id: 'd-4', archetypeId: null, isPlanted: false, title: 'Coffee table, solid wood', price: 60, currency: CUR, photos: ['/listings/table.jpg'], sellerName: 'movingout_sg', description: 'Sturdy table. Collect this weekend.' },
  { id: 'd-5', archetypeId: null, isPlanted: false, title: 'Kindle Paperwhite', price: 90, marketPrice: 110, currency: CUR, photos: ['/listings/kindle.jpg'], sellerName: 'bookworm22', description: 'Reads perfectly, light use.' },
  { id: 'd-6', archetypeId: null, isPlanted: false, title: 'Football boots, size 9', price: 28, currency: CUR, photos: ['/listings/boots.jpg'], sellerName: 'pitchside', description: 'Used one season, still good grip.' },
  { id: 'd-7', archetypeId: null, isPlanted: false, title: 'Office chair, ergonomic', price: 75, currency: CUR, photos: ['/listings/chair.jpg'], sellerName: 'wfh_upgrade', description: 'Comfortable, adjustable height.' },
  { id: 'd-8', archetypeId: null, isPlanted: false, title: 'Board game bundle (5 games)', price: 45, currency: CUR, photos: ['/listings/games.jpg'], sellerName: 'tabletop_sg', description: 'All complete, family-friendly.' },
];

export function listingById(id: string): Listing | undefined {
  return LISTINGS.find((l) => l.id === id);
}

export function plantedListingFor(archetypeId: ArchetypeId): Listing {
  const l = LISTINGS.find((x) => x.archetypeId === archetypeId && x.isPlanted);
  if (!l) throw new Error(`no planted listing for ${archetypeId}`);
  return l;
}
