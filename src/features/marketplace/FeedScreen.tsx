import { useMemo, useState, type ReactNode } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Flame, Sparkles } from 'lucide-react';
import { LISTINGS } from '@/data/listings';
import type { Listing } from '@/lib/types';
import { ScrollRail } from '@/components/ui/scroll-rail';
import { ListingCard } from './ListingCard';
import { SearchBar } from './SearchBar';
import { HeroCarousel } from './HeroCarousel';
import { CategoryGrid } from './CategoryGrid';
import { SectionHeading } from './SectionHeading';
import { FilterPills } from './FilterPills';

const PILL_CATEGORIES = ['All', 'Electronics', 'Gaming', 'Luxury', 'Fashion', 'Home', 'Sports', 'Hobbies'];

/** A horizontal rail of product cards. */
function ProductRail({ items }: { items: Listing[] }) {
  return (
    <ScrollRail>
      {items.map((l) => (
        <div key={l.id} className="w-[150px] shrink-0 snap-start sm:w-[190px]">
          <ListingCard listing={l} />
        </div>
      ))}
    </ScrollRail>
  );
}

function ProductGrid({ items }: { items: Listing[] }) {
  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border py-16 text-center">
        <p className="text-sm text-ink-muted">Nothing here yet. Try another category or search.</p>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-2 gap-x-2 gap-y-4 sm:grid-cols-3 lg:grid-cols-5">
      {items.map((l) => <ListingCard key={l.id} listing={l} />)}
    </div>
  );
}

export function FeedScreen() {
  const [params] = useSearchParams();
  const q = (params.get('q') ?? '').toLowerCase().trim();
  const cat = params.get('cat') ?? '';
  const [pill, setPill] = useState('All');

  const byLikes = useMemo(() => [...LISTINGS].sort((a, b) => (b.likes ?? 0) - (a.likes ?? 0)), []);

  // search view
  if (q) {
    const results = LISTINGS.filter(
      (l) => l.title.toLowerCase().includes(q) || (l.category ?? '').toLowerCase().includes(q),
    );
    return (
      <Page>
        <SearchBar />
        <section>
          <h2 className="mb-4 text-[22px] font-bold tracking-tight text-ink">
            {results.length} result{results.length === 1 ? '' : 's'} for “{params.get('q')}”
          </h2>
          <ProductGrid items={results} />
        </section>
      </Page>
    );
  }

  // category view
  if (cat) {
    const results = LISTINGS.filter((l) => (l.category ?? '').toLowerCase() === cat.toLowerCase());
    return (
      <Page>
        <SearchBar />
        <section>
          <h2 className="mb-1 text-[22px] font-bold tracking-tight text-ink">{cat}</h2>
          <p className="mb-4 text-sm text-ink-muted">{results.length} listing{results.length === 1 ? '' : 's'} near you</p>
          <ProductGrid items={results} />
        </section>
      </Page>
    );
  }

  // homepage
  const trending = pill === 'All' ? byLikes : byLikes.filter((l) => l.category === pill);

  return (
    <Page>
      <SearchBar />
      <HeroCarousel />
      <CategoryGrid />

      <section>
        <SectionHeading title="Trending now" actionLabel="See more" actionHref="/feed?cat=Electronics" />
        <FilterPills options={PILL_CATEGORIES} value={pill} onChange={setPill} />
        <ProductRail items={trending} />
      </section>

      <section>
        <SectionHeading title="Fresh finds near you" actionLabel="See more" actionHref="/feed?cat=Home" />
        <ProductGrid items={LISTINGS} />
      </section>

      <div className="flex items-center justify-center gap-2 pt-2 text-[13px] text-ink-muted">
        <Flame className="h-4 w-4 text-coral" />
        Hidden among these listings are scams. Tap one and chat to test your instincts.
        <Sparkles className="h-4 w-4 text-teal-bright" />
      </div>
    </Page>
  );
}

function Page({ children }: { children: ReactNode }) {
  return <div className="mx-auto max-w-content space-y-10 px-4 py-6 sm:px-6">{children}</div>;
}
