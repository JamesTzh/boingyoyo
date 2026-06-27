import { Link } from 'react-router-dom';
import { LayoutGrid, ShieldCheck } from 'lucide-react';
import { useStore } from '@/lib/store';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const NAV = ['Electronics', 'Fashion', 'Luxury', 'Home & Services', 'Cars', 'Property'];

export function Logo({ wordmark = true }: { wordmark?: boolean }) {
  return (
    <Link to="/feed" className="flex items-center gap-2">
      <span className="grid h-8 w-8 place-items-center rounded-[10px] bg-coral text-[17px] font-extrabold leading-none text-white shadow-[0_2px_10px_-2px_rgba(239,68,68,0.7)]">
        C
      </span>
      {wordmark && <span className="text-[19px] font-bold lowercase tracking-tight text-ink">carouza</span>}
    </Link>
  );
}

export function Header() {
  const session = useStore((s) => s.session);
  const challenges = session ? Object.values(session.challenges) : [];
  const found = challenges.filter((c) => c.status !== 'unseen').length;

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-bg-nav/95 backdrop-blur supports-[backdrop-filter]:bg-bg-nav/80">
      <div className="mx-auto flex h-14 max-w-content items-center gap-5 px-4 sm:px-6">
        <Logo />

        {/* category menu */}
        <nav className="hidden items-center gap-4 lg:flex">
          {NAV.map((label) => (
            <Link
              key={label}
              to={`/feed?cat=${encodeURIComponent(label)}`}
              className="text-[13px] text-ink-muted transition-colors hover:text-ink"
            >
              {label}
            </Link>
          ))}
          <Link
            to="/feed"
            className="flex items-center gap-1.5 text-[13px] text-ink-muted transition-colors hover:text-ink"
          >
            <LayoutGrid className="h-4 w-4" />
            All Categories
          </Link>
        </nav>

        <div className="ml-auto flex items-center gap-3">
          {session && (
            <Link
              to="/report"
              className="hidden items-center gap-1.5 rounded-full border border-teal/30 bg-teal/10 px-3 py-1.5 text-[12px] font-semibold text-teal-bright transition-colors hover:bg-teal/20 sm:flex"
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              {found}/5 found
            </Link>
          )}
          <Link to="/" className="hidden text-[13px] text-ink-muted transition-colors hover:text-ink sm:block">
            Register
          </Link>
          <Link to="/" className="hidden text-[13px] text-ink-muted transition-colors hover:text-ink sm:block">
            Login
          </Link>
          <Link to="/feed" className={cn(buttonVariants({ variant: 'sell', size: 'sm' }))}>
            Sell
          </Link>
        </div>
      </div>
    </header>
  );
}
