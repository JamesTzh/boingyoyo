import * as React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ScrollRailProps {
  children: React.ReactNode;
  className?: string;
  /** fraction of the visible width to advance per chevron click */
  page?: number;
}

/**
 * A horizontal, scroll-snapping rail with circular chevron controls that fade
 * in only when there's something to scroll to. Used for the hero banners and
 * every product row.
 */
export function ScrollRail({ children, className, page = 0.8 }: ScrollRailProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [atStart, setAtStart] = React.useState(true);
  const [atEnd, setAtEnd] = React.useState(false);

  const update = React.useCallback(() => {
    const el = ref.current;
    if (!el) return;
    setAtStart(el.scrollLeft <= 2);
    setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 2);
  }, []);

  React.useEffect(() => {
    update();
    const el = ref.current;
    if (!el) return;
    el.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      el.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [update]);

  const scrollBy = (dir: 1 | -1) => {
    const el = ref.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * page, behavior: 'smooth' });
  };

  return (
    <div className={cn('group relative', className)}>
      <div
        ref={ref}
        className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-1"
      >
        {children}
      </div>

      <RailButton side="left" hidden={atStart} onClick={() => scrollBy(-1)} />
      <RailButton side="right" hidden={atEnd} onClick={() => scrollBy(1)} />
    </div>
  );
}

function RailButton({
  side,
  hidden,
  onClick,
}: {
  side: 'left' | 'right';
  hidden: boolean;
  onClick: () => void;
}) {
  const Icon = side === 'left' ? ChevronLeft : ChevronRight;
  return (
    <button
      aria-label={side === 'left' ? 'Scroll left' : 'Scroll right'}
      onClick={onClick}
      className={cn(
        'absolute top-1/2 z-10 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full border border-white/10 bg-black/60 text-white backdrop-blur-md transition-all hover:bg-black/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        side === 'left' ? 'left-2' : 'right-2',
        hidden ? 'pointer-events-none opacity-0' : 'opacity-0 group-hover:opacity-100',
      )}
    >
      <Icon className="h-5 w-5" strokeWidth={2.5} />
    </button>
  );
}
