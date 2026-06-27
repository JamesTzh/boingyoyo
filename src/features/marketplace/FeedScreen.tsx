import { LISTINGS } from '@/data/listings';
import { useTheme } from '@/app/ThemeProvider';
import { ListingCard } from './ListingCard';

export function FeedScreen() {
  const theme = useTheme();
  const ordered = [...LISTINGS];
  if (theme.demoMode) {
    const i = ordered.findIndex((l) => l.archetypeId === 'off_platform');
    if (i > 1) ordered.unshift(ordered.splice(i, 1)[0]);
  }
  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <h2 className="mb-4 text-xl font-bold">Browse {theme.brandName}</h2>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {ordered.map((l) => <ListingCard key={l.id} listing={l} />)}
      </div>
    </div>
  );
}
