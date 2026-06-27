import type { Listing, ArchetypeId } from '@/lib/types';

const CUR = 'SGD';
const P = '/listings'; // real product photos live in public/listings

// The 5 planted scams (archetypeId set) are scattered among many genuine decoys
// so the hunt feels real. Every listing uses a real photograph from public/.
export const LISTINGS: Listing[] = [
  { id: 'd-airpods', archetypeId: null, isPlanted: false, title: 'AirPods Pro (2nd gen)', price: 150, marketPrice: 199, currency: CUR, photos: [`${P}/airpods.jpg`], sellerName: 'soundbar.sg', sellerBadges: ['Verified'], description: 'Bought last year, barely used. Comes with box and charging case.', category: 'Electronics', condition: 'Like new', likes: 41, postedAt: '18 minutes ago', buyerProtection: true },

  // ---- planted: off-platform ----
  {
    id: 'p-off',
    archetypeId: 'off_platform',
    isPlanted: true,
    title: 'iPhone 14, 128GB, great condition',
    price: 720,
    marketPrice: 750,
    currency: CUR,
    photos: [`${P}/iphone15.jpg`],
    sellerName: 'kevin_deals',
    sellerBadges: ['Quick replies'],
    description: 'Selling my iPhone 14, barely used. Message me, I reply fast!',
    category: 'Electronics',
    condition: 'Like new',
    likes: 34,
    postedAt: '3 minutes ago',
    buyerProtection: true,
  },

  { id: 'd-keyboard', archetypeId: null, isPlanted: false, title: 'Keychron K2 mechanical keyboard', price: 70, marketPrice: 109, currency: CUR, photos: [`${P}/decoy-mechanical-keyboard.jpg`], sellerName: 'keeb_lover', description: 'Brown switches, RGB. Typed on but well kept.', category: 'Electronics', condition: 'Like new', likes: 33, postedAt: '2 hours ago', buyerProtection: true },
  { id: 'd-jacket', archetypeId: null, isPlanted: false, title: 'Uniqlo down jacket, M', price: 35, currency: CUR, photos: [`${P}/decoy-uniqlo-jacket.jpg`], sellerName: 'wardrobe_reset', description: 'Worn a few times, clean. Meetup at MRT.', category: 'Fashion', condition: 'Well used', likes: 11, postedAt: '1 hour ago' },

  // ---- planted: urgency / flash sale ----
  {
    id: 'p-urg',
    archetypeId: 'urgency_flash_sale',
    isPlanted: true,
    title: 'MacBook Air M2, 256GB (sealed) — FLASH SALE 🔥',
    price: 520,
    marketPrice: 1499,
    currency: CUR,
    photos: [`${P}/macbook.jpg`],
    sellerName: 'techdeals_sg',
    sellerBadges: ['Only 1 left!'],
    description: 'Brand new sealed MacBook Air M2. Clearing stock, crazy price, going FAST. Pay now to lock it in!',
    category: 'Electronics',
    condition: 'Brand new',
    likes: 263,
    postedAt: '1 minute ago',
    buyerProtection: true,
  },

  { id: 'd-vacuum', archetypeId: null, isPlanted: false, title: 'Dyson V8 vacuum', price: 240, marketPrice: 280, currency: CUR, photos: [`${P}/decoy-dyson-vacuum.jpg`], sellerName: 'sgcleanhome', sellerBadges: ['Verified'], description: 'Strong suction, comes with attachments.', category: 'Home', condition: 'Like new', likes: 28, postedAt: '40 minutes ago', buyerProtection: true },
  { id: 'd-monitor', archetypeId: null, isPlanted: false, title: 'Dell 27" 1440p monitor', price: 180, marketPrice: 320, currency: CUR, photos: [`${P}/decoy-monitor.jpg`], sellerName: 'pixelpush', description: 'Great for WFH. No dead pixels.', category: 'Electronics', condition: 'Lightly used', likes: 26, postedAt: '3 hours ago', buyerProtection: true },
  { id: 'd-bag-decoy', archetypeId: null, isPlanted: false, title: 'Herschel Little America backpack', price: 45, marketPrice: 99, currency: CUR, photos: [`${P}/decoy-backpack.jpg`], sellerName: 'carry_on', description: 'Roomy daypack, minor wear on base.', category: 'Fashion', condition: 'Lightly used', likes: 11, postedAt: '4 hours ago' },

  // ---- planted: deposit before meetup ----
  {
    id: 'p-dep',
    archetypeId: 'deposit_before_meetup',
    isPlanted: true,
    title: 'Specialized road bike, like new',
    price: 880,
    marketPrice: 950,
    currency: CUR,
    photos: [`${P}/decoy-bicycle.jpg`],
    sellerName: 'cycle_jane',
    description: 'Great bike, lots of interest. Serious buyers only please.',
    category: 'Sports',
    condition: 'Like new',
    likes: 47,
    postedAt: '12 minutes ago',
    buyerProtection: true,
  },

  { id: 'd-galaxy', archetypeId: null, isPlanted: false, title: 'Samsung Galaxy S23, 256GB', price: 540, marketPrice: 600, currency: CUR, photos: [`${P}/galaxy.jpg`], sellerName: 'mobile_hub', sellerBadges: ['Verified'], description: 'Phantom black, with case and charger.', category: 'Electronics', condition: 'Lightly used', likes: 22, postedAt: '1 hour ago', buyerProtection: true },
  { id: 'd-coffee', archetypeId: null, isPlanted: false, title: 'Breville espresso machine', price: 220, marketPrice: 350, currency: CUR, photos: [`${P}/decoy-coffee-machine.jpg`], sellerName: 'cafe.home', description: 'Pulls great shots. Descaled regularly.', category: 'Home', condition: 'Lightly used', likes: 19, postedAt: '5 hours ago', buyerProtection: true },
  { id: 'd-watch', archetypeId: null, isPlanted: false, title: 'Seiko 5 automatic watch', price: 180, marketPrice: 260, currency: CUR, photos: [`${P}/watch.jpg`], sellerName: 'timepiece_sg', description: 'Self-winding, keeps good time. Original strap.', category: 'Luxury', condition: 'Like new', likes: 29, postedAt: '47 minutes ago', buyerProtection: true },

  // ---- planted: counterfeit ----
  {
    id: 'p-cnt',
    archetypeId: 'counterfeit_item',
    isPlanted: true,
    title: 'Louis Vuitton Neverfull (authentic!)',
    price: 250,
    marketPrice: 2200,
    currency: CUR,
    photos: [`${P}/designerbag.jpg`],
    sellerName: 'luxe_finds88',
    description: '100% original LV bag, overseas purchase. No box. Trust me, real deal!',
    category: 'Luxury',
    condition: 'Like new',
    likes: 176,
    postedAt: '5 minutes ago',
    buyerProtection: true,
  },

  { id: 'd-lens', archetypeId: null, isPlanted: false, title: 'Canon EF 50mm f/1.8 lens', price: 110, marketPrice: 145, currency: CUR, photos: [`${P}/decoy-camera-lens.jpg`], sellerName: 'shutterbug', description: 'Nifty fifty, sharp glass. No fungus.', category: 'Electronics', condition: 'Like new', likes: 24, postedAt: '3 hours ago', buyerProtection: true },
  { id: 'd-sneakers', archetypeId: null, isPlanted: false, title: 'Nike Pegasus 40, US9', price: 75, marketPrice: 159, currency: CUR, photos: [`${P}/sneakers.jpg`], sellerName: 'kicks.co', description: 'Ran a few times, plenty of life left.', category: 'Fashion', condition: 'Lightly used', likes: 18, postedAt: '3 hours ago' },
  { id: 'd-airfryer', archetypeId: null, isPlanted: false, title: 'Philips air fryer XL', price: 65, marketPrice: 120, currency: CUR, photos: [`${P}/decoy-air-fryer.jpg`], sellerName: 'kitchenclearout', description: 'Family size, works perfectly. Cleaned.', category: 'Home', condition: 'Like new', likes: 15, postedAt: '2 hours ago', buyerProtection: true },

  // ---- planted: phishing payment link ----
  {
    id: 'p-pay',
    archetypeId: 'phishing_link',
    isPlanted: true,
    title: 'Nintendo Switch OLED, like new',
    price: 240,
    marketPrice: 330,
    currency: CUR,
    photos: [`${P}/decoy-nintendo-switch.jpg`],
    sellerName: 'switch.deals.sg',
    sellerBadges: ['Fast deal'],
    description: 'Switch OLED, lightly used with all accessories. Pay via my secure checkout link for buyer protection.',
    category: 'Gaming',
    condition: 'Lightly used',
    likes: 21,
    postedAt: '8 minutes ago',
    buyerProtection: true,
  },

  { id: 'd-ricecooker', archetypeId: null, isPlanted: false, title: 'Zojirushi rice cooker', price: 60, marketPrice: 110, currency: CUR, photos: [`${P}/decoy-rice-cooker.jpg`], sellerName: 'kitchensg', description: '5.5 cup, fuzzy logic. Inner pot like new.', category: 'Home', condition: 'Like new', likes: 13, postedAt: '4 hours ago' },
  { id: 'd-guitar', archetypeId: null, isPlanted: false, title: 'Yamaha F310 acoustic guitar', price: 120, currency: CUR, photos: [`${P}/decoy-acoustic-guitar.jpg`], sellerName: 'strum_it', description: 'Good starter guitar, fresh strings.', category: 'Hobbies', condition: 'Well used', likes: 9, postedAt: '5 hours ago' },
  { id: 'd-sunglasses', archetypeId: null, isPlanted: false, title: 'Ray-Ban Wayfarer sunglasses', price: 85, marketPrice: 200, currency: CUR, photos: [`${P}/sunglasses.jpg`], sellerName: 'shadestyle', description: 'Classic black, with case. Light scratches.', category: 'Fashion', condition: 'Well used', likes: 12, postedAt: '2 hours ago' },
  { id: 'd-desk', archetypeId: null, isPlanted: false, title: 'IKEA Micke desk, white', price: 55, currency: CUR, photos: [`${P}/decoy-ikea-desk.jpg`], sellerName: 'wfh_setup', description: 'Sturdy, with drawer. Self-collect.', category: 'Home', condition: 'Lightly used', likes: 10, postedAt: 'yesterday' },
  { id: 'd-chair', archetypeId: null, isPlanted: false, title: 'Ergonomic office chair', price: 75, currency: CUR, photos: [`${P}/decoy-office-chair.jpg`], sellerName: 'wfh_upgrade', description: 'Comfortable, adjustable height and lumbar.', category: 'Home', condition: 'Lightly used', likes: 14, postedAt: '2 hours ago', buyerProtection: true },
  { id: 'd-table', archetypeId: null, isPlanted: false, title: 'Solid wood dining table', price: 160, currency: CUR, photos: [`${P}/decoy-dining-table.jpg`], sellerName: 'homereset', description: 'Seats 4-6. Some marks, very sturdy.', category: 'Home', condition: 'Well used', likes: 8, postedAt: '2 days ago' },
  { id: 'd-lego', archetypeId: null, isPlanted: false, title: 'Lego collectible minifigure (rare)', price: 18, marketPrice: 30, currency: CUR, photos: [`${P}/decoy-lego-set.jpg`], sellerName: 'brick_vault', description: 'Sealed minifig, from retired series.', category: 'Hobbies', condition: 'Brand new', likes: 16, postedAt: '6 hours ago' },
  { id: 'd-boardgame', archetypeId: null, isPlanted: false, title: 'Board game bundle (5 games)', price: 45, currency: CUR, photos: [`${P}/decoy-board-game.jpg`], sellerName: 'tabletop_sg', description: 'All complete, family-friendly.', category: 'Hobbies', condition: 'Like new', likes: 7, postedAt: '6 hours ago' },
  { id: 'd-bookshelf', archetypeId: null, isPlanted: false, title: 'IKEA Billy bookshelf', price: 40, currency: CUR, photos: [`${P}/decoy-bookshelf.jpg`], sellerName: 'movingout_sg', description: 'White, good condition. Collect this weekend.', category: 'Home', condition: 'Well used', likes: 5, postedAt: '1 day ago' },
  { id: 'd-yoga', archetypeId: null, isPlanted: false, title: 'Yoga mat, 6mm', price: 20, marketPrice: 39, currency: CUR, photos: [`${P}/decoy-yoga-mat.jpg`], sellerName: 'zenflow', description: 'Non-slip, cleaned. Comes with strap.', category: 'Sports', condition: 'Like new', likes: 8, postedAt: '5 hours ago' },
  { id: 'd-stroller', archetypeId: null, isPlanted: false, title: 'Foldable baby stroller', price: 90, currency: CUR, photos: [`${P}/decoy-baby-stroller.jpg`], sellerName: 'mummysg', description: 'Lightweight, one-hand fold. Clean.', category: 'Home', condition: 'Well used', likes: 6, postedAt: 'yesterday' },
  { id: 'd-kettle', archetypeId: null, isPlanted: false, title: 'Electric kettle, 1.7L', price: 18, currency: CUR, photos: [`${P}/decoy-electric-kettle.jpg`], sellerName: 'declutter_sg', description: 'Fast boil, works great.', category: 'Home', condition: 'Well used', likes: 3, postedAt: '6 hours ago' },
  { id: 'd-fan', archetypeId: null, isPlanted: false, title: 'Standing fan, 3-speed', price: 22, currency: CUR, photos: [`${P}/decoy-standing-fan.jpg`], sellerName: 'coolbreeze', description: 'Height adjustable, quiet. Self-collect.', category: 'Home', condition: 'Well used', likes: 4, postedAt: '1 day ago' },
];

export function listingById(id: string): Listing | undefined {
  return LISTINGS.find((l) => l.id === id);
}

export function plantedListingFor(archetypeId: ArchetypeId): Listing {
  const l = LISTINGS.find((x) => x.archetypeId === archetypeId && x.isPlanted);
  if (!l) throw new Error(`no planted listing for ${archetypeId}`);
  return l;
}
