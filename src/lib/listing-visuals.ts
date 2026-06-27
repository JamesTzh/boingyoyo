import type { Listing } from './types';

// A recognizable glyph per item, matched on the title with a category fallback.
// Used by the product placeholder so every card reads as a real item even
// though this demo repo ships without photographs.
const KEYWORDS: [RegExp, string][] = [
  [/iphone|phone|galaxy|pixel/i, '📱'],
  [/macbook|laptop/i, '💻'],
  [/ipad|tablet|kindle|paperwhite|e-?reader/i, '📖'],
  [/airpods|earbuds|headphone/i, '🎧'],
  [/ps5|playstation|xbox|nintendo|switch|console|gaming/i, '🎮'],
  [/bike|bicycle|cycle/i, '🚲'],
  [/louis|vuitton|gucci|prada|chanel|hermes|bag|handbag|neverful/i, '👜'],
  [/watch|rolex|omega/i, '⌚'],
  [/sunglass|glasses/i, '🕶️'],
  [/jacket|coat|hoodie|shirt|dress|uniqlo/i, '🧥'],
  [/sneaker|shoe|boot|nike|adidas/i, '👟'],
  [/vacuum|dyson/i, '🧹'],
  [/lamp|light/i, '💡'],
  [/desk|table/i, '🪑'],
  [/chair|sofa|couch/i, '🛋️'],
  [/board game|lego|puzzle|toy/i, '🎲'],
  [/camera|lens/i, '📷'],
  [/keyboard/i, '⌨️'],
  [/monitor|screen|display/i, '🖥️'],
];

const CATEGORY_EMOJI: Record<string, string> = {
  Electronics: '📱',
  Gaming: '🎮',
  Luxury: '👜',
  Fashion: '🧥',
  Home: '🛋️',
  Sports: '⚽',
  Hobbies: '🎲',
};

const CATEGORY_GRADIENT: Record<string, string> = {
  Electronics: 'from-sky-600/35 to-indigo-700/35',
  Gaming: 'from-violet-600/35 to-fuchsia-700/35',
  Luxury: 'from-amber-500/35 to-yellow-700/30',
  Fashion: 'from-fuchsia-600/35 to-rose-700/35',
  Home: 'from-emerald-600/35 to-teal-700/35',
  Sports: 'from-lime-600/35 to-green-700/35',
  Hobbies: 'from-orange-600/35 to-red-700/35',
};

export function itemEmoji(listing: Pick<Listing, 'title' | 'category'>): string {
  for (const [re, emoji] of KEYWORDS) if (re.test(listing.title)) return emoji;
  return CATEGORY_EMOJI[listing.category ?? ''] ?? '🛍️';
}

export function itemGradient(listing: Pick<Listing, 'category'>): string {
  return CATEGORY_GRADIENT[listing.category ?? ''] ?? 'from-zinc-600/35 to-zinc-800/35';
}
