import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight, CheckCircle2, ChevronRight, RotateCcw, Search, ShieldCheck, Syringe, XCircle,
} from 'lucide-react';
import { useStore } from '@/lib/store';
import { ARCHETYPE_IDS, type ArchetypeId, type Level } from '@/lib/types';
import { ARCHETYPE_META } from '@/lib/archetypes';
import { redFlagsFor } from '@/data/redFlags';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const VERDICT: Record<Level, string> = {
  Guardian: 'Scam-proof. You would spot these a mile away.',
  Sharp: 'Sharp eye — most scams will not get past you.',
  Aware: 'Getting there. A few tricks still slip through.',
  Rookie: 'Just starting out. Keep hunting to build resistance.',
};

export function ReportScreen() {
  const navigate = useNavigate();
  const session = useStore((s) => s.session);
  const reset = useStore((s) => s.reset);

  if (!session) {
    return (
      <div className="mx-auto max-w-md px-6 py-24 text-center">
        <p className="text-ink-muted">No event in progress.</p>
        <Link to="/" className={cn(buttonVariants(), 'mt-4')}>Start Phish n Cheats</Link>
      </div>
    );
  }

  const chs = session.challenges;
  const defended = ARCHETYPE_IDS.filter((a) => chs[a].status === 'defended');
  const fellFor = ARCHETYPE_IDS.filter((a) => chs[a].status === 'scammed');
  const seen = ARCHETYPE_IDS.filter((a) => chs[a].status !== 'unseen');
  const notFound = ARCHETYPE_IDS.filter((a) => chs[a].status === 'unseen');

  // red flags spotted across everything attempted
  const attempted = ARCHETYPE_IDS.filter((a) => chs[a].status === 'defended' || chs[a].status === 'scammed');
  const flagsSpotted = attempted.reduce((n, a) => n + chs[a].signals.redFlagsNoticed, 0);
  const flagsTotal = attempted.reduce((n, a) => n + redFlagsFor(a).length, 0);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      {/* eyebrow */}
      <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-teal/30 bg-teal/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-teal-bright">
        <ShieldCheck className="h-3.5 w-3.5" /> Phish n Cheats · Your result
      </div>

      {/* hero result card */}
      <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-card sm:p-8">
        <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-teal/15 blur-3xl" />
        <div className="relative flex flex-col items-center gap-6 sm:flex-row sm:gap-8">
          <RadialScore score={session.eventScore} />
          <div className="text-center sm:text-left">
            <div className="text-xs uppercase tracking-[0.2em] text-ink-muted">Scam-resistance level</div>
            <div className="mt-1 text-3xl font-extrabold text-ink">{session.level}</div>
            <p className="mt-2 max-w-sm text-[15px] leading-relaxed text-ink-muted">{VERDICT[session.level]}</p>
            <div className="mt-4 flex items-center justify-center gap-2 rounded-lg bg-teal/10 px-3 py-2 text-[13px] text-teal-bright sm:justify-start">
              <Syringe className="h-4 w-4 shrink-0" />
              <span>A scam vaccine: safe exposure now builds real resistance later.</span>
            </div>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Kpi label="Scams found" value={`${seen.length}/5`} tone="ink" />
        <Kpi label="Defended" value={defended.length} tone="teal" />
        <Kpi label="Fell for" value={fellFor.length} tone="coral" />
        <Kpi label="Red flags spotted" value={flagsTotal ? `${flagsSpotted}/${flagsTotal}` : '—'} tone="ink" />
      </div>

      {/* per-archetype breakdown */}
      <h2 className="mb-3 mt-9 text-[22px] font-bold tracking-tight text-ink">The five scams</h2>
      <div className="space-y-2.5">
        {ARCHETYPE_IDS.map((a) => (
          <ArchetypeRow key={a} archetypeId={a} status={chs[a].status} score={chs[a].score?.total} />
        ))}
      </div>

      {/* what's left to learn — the inoculation nudge */}
      {notFound.length > 0 && (
        <div className="mt-8 rounded-2xl border border-border bg-card p-5 shadow-card">
          <h3 className="flex items-center gap-2 font-semibold text-ink">
            <Search className="h-4.5 w-4.5 text-teal-bright" /> Still to learn
          </h3>
          <p className="mt-1 text-sm text-ink-muted">
            You have not met {notFound.length === 1 ? 'this scam' : `these ${notFound.length} scams`} yet.
            Hunt {notFound.length === 1 ? 'it' : 'them'} down to complete your training.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {notFound.map((a) => (
              <span key={a} className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-2/60 px-3 py-1.5 text-[13px] text-ink">
                {(() => { const I = ARCHETYPE_META[a].Icon; return <I className="h-3.5 w-3.5 text-ink-muted" />; })()}
                {ARCHETYPE_META[a].label}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* actions */}
      <div className="mt-8 flex flex-wrap gap-3">
        {notFound.length > 0 && (
          <Link to="/feed" className={cn(buttonVariants())}>
            Keep hunting <ArrowRight className="h-4 w-4" />
          </Link>
        )}
        <Link to="/dashboard" className={cn(buttonVariants({ variant: notFound.length ? 'outline' : 'default' }))}>
          See the trust-team dashboard
        </Link>
        <button onClick={() => { reset(); navigate('/'); }} className={cn(buttonVariants({ variant: 'ghost' }))}>
          <RotateCcw className="h-4 w-4" /> Restart
        </button>
      </div>
    </div>
  );
}

function RadialScore({ score }: { score: number }) {
  const r = 54;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, score)) / 100;
  return (
    <div className="relative grid h-[140px] w-[140px] shrink-0 place-items-center">
      <svg width="140" height="140" className="-rotate-90">
        <circle cx="70" cy="70" r={r} fill="none" stroke="hsl(var(--secondary))" strokeWidth="10" />
        <motion.circle
          cx="70" cy="70" r={r} fill="none" stroke="var(--teal)" strokeWidth="10" strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c * (1 - pct) }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <motion.span
          initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}
          className="text-4xl font-extrabold leading-none text-ink"
        >
          {score}
        </motion.span>
        <span className="mt-0.5 text-[11px] uppercase tracking-wide text-ink-muted">/ 100</span>
      </div>
    </div>
  );
}

function Kpi({ label, value, tone }: { label: string; value: string | number; tone: 'ink' | 'teal' | 'coral' }) {
  const color = tone === 'teal' ? 'text-teal-bright' : tone === 'coral' ? 'text-coral-bright' : 'text-ink';
  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-card">
      <div className={cn('text-2xl font-extrabold', color)}>{value}</div>
      <div className="mt-0.5 text-[12px] text-ink-muted">{label}</div>
    </div>
  );
}

function ArchetypeRow({ archetypeId, status, score }: { archetypeId: ArchetypeId; status: string; score?: number }) {
  const { label, blurb, Icon } = ARCHETYPE_META[archetypeId];
  const attempted = status === 'defended' || status === 'scammed';

  const badge =
    status === 'defended' ? { cls: 'bg-teal/15 text-teal-bright', Ico: CheckCircle2, text: 'Defended' }
    : status === 'scammed' ? { cls: 'bg-coral/15 text-coral-bright', Ico: XCircle, text: 'Fell for it' }
    : { cls: 'bg-surface-2 text-ink-muted', Ico: Search, text: 'Not found' };

  const inner = (
    <>
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-surface-2 text-ink-muted">
        <Icon className="h-5 w-5" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate font-semibold text-ink">{label}</span>
          {attempted && score != null && <span className="text-[12px] text-ink-muted">· {score}/100</span>}
        </div>
        <p className="truncate text-[13px] text-ink-muted">{blurb}</p>
      </div>
      <span className={cn('inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[12px] font-medium', badge.cls)}>
        <badge.Ico className="h-3.5 w-3.5" /> {badge.text}
      </span>
      {attempted && <ChevronRight className="h-4 w-4 shrink-0 text-ink-muted" />}
    </>
  );

  const className = 'flex items-center gap-3 rounded-xl border border-border bg-card p-3.5 shadow-card transition-colors';
  return attempted ? (
    <Link to={`/trace/${archetypeId}`} className={cn(className, 'hover:bg-surface-2/40')}>{inner}</Link>
  ) : (
    <div className={className}>{inner}</div>
  );
}
