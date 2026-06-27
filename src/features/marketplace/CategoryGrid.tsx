import { Link } from 'react-router-dom';
import { LayoutGrid } from 'lucide-react';
import { SectionHeading } from './SectionHeading';

interface Cat {
  label: string;
  emoji: string;
  tint: string;
}

const CATEGORIES: Cat[] = [
  { label: 'Electronics', emoji: '📱', tint: 'bg-sky-500/20' },
  { label: 'Fashion', emoji: '👗', tint: 'bg-fuchsia-500/20' },
  { label: 'Luxury', emoji: '👜', tint: 'bg-amber-500/20' },
  { label: 'Gaming', emoji: '🎮', tint: 'bg-violet-500/20' },
  { label: 'Home', emoji: '🛋️', tint: 'bg-emerald-500/20' },
  { label: 'Sports', emoji: '⚽', tint: 'bg-lime-500/20' },
  { label: 'Cars', emoji: '🚗', tint: 'bg-red-500/20' },
  { label: 'Property', emoji: '🏠', tint: 'bg-teal-500/20' },
  { label: 'Hobbies', emoji: '🎲', tint: 'bg-orange-500/20' },
];

export function CategoryGrid() {
  return (
    <section>
      <SectionHeading title="What would you like to find?" actionLabel="See all categories" actionHref="/feed" icon={<LayoutGrid className="h-4 w-4" />} />
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-5 lg:grid-cols-9">
        {CATEGORIES.map((c) => (
          <Link
            key={c.label}
            to={`/feed?cat=${encodeURIComponent(c.label)}`}
            className="group flex flex-col items-center gap-2.5 rounded-xl bg-surface-2/60 p-3 pt-4 transition-all duration-200 hover:-translate-y-1 hover:bg-surface-2"
          >
            <span className={`grid h-11 w-11 place-items-center rounded-full text-xl ${c.tint}`}>{c.emoji}</span>
            <span className="text-center text-[12px] font-medium leading-tight text-ink">{c.label}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
