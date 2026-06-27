import { NavLink, Outlet } from 'react-router-dom';
import { BrainCircuit, Radar, ShieldCheck, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AdminNavItem {
  to: string;
  label: string;
  hint: string;
  Icon: LucideIcon;
  end?: boolean;
}

const NAV: AdminNavItem[] = [
  { to: '/admin', label: 'Scam Intelligence', hint: 'What players reveal', Icon: Radar, end: true },
  { to: '/admin/fraud-model', label: 'Fraud Detection Model', hint: 'Live risk scoring', Icon: BrainCircuit },
];

// Internal Trust & Safety console. The marketplace header stays above; this shell
// gives the admin tools their own quiet, focused navigation.
export function AdminLayout() {
  return (
    <div className="mx-auto max-w-content px-4 py-6 sm:px-6 lg:py-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
        <AdminRail />
        <main className="min-w-0 flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function AdminRail() {
  return (
    <aside className="lg:sticky lg:top-[4.5rem] lg:h-fit lg:w-64 lg:shrink-0">
      <div className="rounded-2xl border border-border bg-card p-3 shadow-card">
        <div className="flex items-center gap-2.5 px-2 pb-3 pt-1">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-teal/15 text-teal-bright">
            <ShieldCheck className="h-[18px] w-[18px]" />
          </span>
          <div className="leading-tight">
            <div className="text-[13px] font-bold text-ink">Trust &amp; Safety</div>
            <div className="text-[11px] text-ink-muted">carouza · admin</div>
          </div>
        </div>

        {/* On mobile the rail becomes a horizontal tab strip. */}
        <nav className="flex gap-1.5 overflow-x-auto no-scrollbar lg:flex-col">
          {NAV.map(({ to, label, hint, Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  'group flex shrink-0 items-center gap-2.5 rounded-xl px-3 py-2.5 transition-colors lg:shrink',
                  isActive
                    ? 'bg-teal/12 text-ink ring-1 ring-inset ring-teal/30'
                    : 'text-ink-muted hover:bg-surface-2/60 hover:text-ink',
                )
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    className={cn('h-[18px] w-[18px] shrink-0', isActive ? 'text-teal-bright' : 'text-ink-muted')}
                  />
                  <span className="min-w-0">
                    <span className="block whitespace-nowrap text-[13px] font-semibold leading-tight lg:whitespace-normal">
                      {label}
                    </span>
                    <span className="hidden text-[11px] leading-tight text-ink-muted lg:block">{hint}</span>
                  </span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="mt-3 hidden items-center gap-2 rounded-lg border border-border bg-surface-2/40 px-3 py-2 lg:flex">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal/70" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-teal-bright" />
          </span>
          <span className="text-[11px] leading-tight text-ink-muted">
            MVP · illustrative data
          </span>
        </div>
      </div>
    </aside>
  );
}
