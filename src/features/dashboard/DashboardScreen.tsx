import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Activity, ArrowLeft, ShieldAlert, ShieldCheck, TrendingDown, Users } from 'lucide-react';
import { useStore } from '@/lib/store';
import { aggregate } from '@/lib/aggregate';
import { SEED_PLAYS } from '@/data/seeds';
import { ARCHETYPE_META } from '@/lib/archetypes';
import { RED_FLAGS } from '@/data/redFlags';
import type { PlayRecord } from '@/lib/types';
import { cn } from '@/lib/utils';

const flagLabel = (id: string) => RED_FLAGS.find((f) => f.id === id)?.label ?? id;
const pct = (n: number) => Math.round(n * 100);

export function DashboardScreen() {
  const live = useStore((s) => (s.session ? s.toPlayRecords() : []));
  const plays: PlayRecord[] = [...SEED_PLAYS, ...live];
  const stats = aggregate(plays).sort((a, b) => b.fellForRate - a.fellForRate);

  // KPIs
  const total = plays.length;
  const fellFor = plays.filter((p) => p.outcome === 'scammed').length;
  const defendedPlays = plays.filter((p) => p.outcome === 'defended');
  const avgTurns = defendedPlays.length
    ? Math.round((defendedPlays.reduce((a, p) => a + p.turnsToResolve, 0) / defendedPlays.length) * 10) / 10
    : 0;

  // resistance over the event: early encounters vs later ones
  const earlyRate = rate(plays.filter((p) => p.order <= 2));
  const lateRate = rate(plays.filter((p) => p.order >= 4));
  const improvement = Math.max(0, pct(earlyRate) - pct(lateRate));

  // most-missed red flags across all scams
  const missed = stats
    .flatMap((s) => s.mostMissedFlags.map((f) => ({ ...f, archetypeId: s.archetypeId })))
    .sort((a, b) => b.missRate - a.missRate)
    .slice(0, 5);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <Link to="/report" className="mb-4 inline-flex items-center gap-1.5 text-sm text-ink-muted transition-colors hover:text-ink">
        <ArrowLeft className="h-4 w-4" /> Back to your result
      </Link>

      <div className="inline-flex items-center gap-2 rounded-full border border-teal/30 bg-teal/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-teal-bright">
        <ShieldCheck className="h-3.5 w-3.5" /> Phish n Cheats · Trust &amp; Safety
      </div>
      <h1 className="mt-3 text-[26px] font-bold tracking-tight text-ink">Scam intelligence dashboard</h1>
      <p className="mt-1 max-w-2xl text-sm text-ink-muted">
        What every Phish n Cheats player reveals about real-world vulnerability — so the platform can
        prioritise defences and education where they matter most.{live.length ? ' Includes your play tonight.' : ''}
      </p>

      {/* KPI row */}
      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi icon={Users} label="Plays analysed" value={total.toLocaleString()} tone="ink" />
        <Kpi icon={ShieldAlert} label="Fell for a scam" value={`${pct(fellFor / total)}%`} tone="coral" />
        <Kpi icon={ShieldCheck} label="Spotted in time" value={`${pct(1 - fellFor / total)}%`} tone="teal" />
        <Kpi icon={Activity} label="Avg msgs to spot" value={avgTurns} tone="ink" />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-5">
        {/* vulnerability ranking */}
        <section className="rounded-2xl border border-border bg-card p-5 shadow-card lg:col-span-3">
          <h2 className="font-semibold text-ink">Which scams fool the most people</h2>
          <p className="mt-0.5 text-[13px] text-ink-muted">Share of players who fell for each scam type.</p>
          <div className="mt-5 space-y-4">
            {stats.map((s, i) => {
              const { label, Icon } = ARCHETYPE_META[s.archetypeId];
              return (
                <div key={s.archetypeId}>
                  <div className="mb-1.5 flex items-center gap-2 text-sm">
                    <Icon className="h-4 w-4 shrink-0 text-ink-muted" />
                    <span className="font-medium text-ink">{label}</span>
                    <span className="ml-auto font-semibold text-coral-bright">{pct(s.fellForRate)}%</span>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-surface-2">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-coral to-coral-bright"
                      initial={{ width: 0 }}
                      animate={{ width: `${s.fellForRate * 100}%` }}
                      transition={{ duration: 0.8, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                    />
                  </div>
                  <div className="mt-1 text-[12px] text-ink-muted">
                    {s.fellForCount} of {s.attempts} fell for it · avg {s.avgDetectTurns || '—'} msgs to spot when caught
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* side column: improvement + most-missed flags */}
        <div className="space-y-4 lg:col-span-2">
          <section className="rounded-2xl border border-teal/25 bg-teal/[0.07] p-5 shadow-card">
            <div className="flex items-center gap-2 text-teal-bright">
              <TrendingDown className="h-4.5 w-4.5" />
              <h2 className="font-semibold">Resistance is building</h2>
            </div>
            <div className="mt-3 flex items-end gap-2">
              <span className="text-4xl font-extrabold text-ink">{improvement}</span>
              <span className="mb-1 text-sm text-ink-muted">pts lower</span>
            </div>
            <p className="mt-1 text-[13px] text-ink-muted">
              Players fall for the {pct(earlyRate)}% on their first encounters, dropping to {pct(lateRate)}% by their
              later ones — the inoculation works.
            </p>
          </section>

          <section className="rounded-2xl border border-border bg-card p-5 shadow-card">
            <h2 className="font-semibold text-ink">Most-missed red flags</h2>
            <div className="mt-4 space-y-3">
              {missed.map((m) => (
                <div key={`${m.archetypeId}-${m.redFlagId}`}>
                  <div className="mb-1 flex items-center justify-between gap-2 text-[13px]">
                    <span className="truncate text-ink">{flagLabel(m.redFlagId)}</span>
                    <span className="shrink-0 font-semibold text-ink-muted">{pct(m.missRate)}%</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-surface-2">
                    <div className="h-full rounded-full bg-amber-400/80" style={{ width: `${m.missRate * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>

      <p className="mt-6 text-center text-[13px] text-ink-muted">
        Phish n Cheats turns a safety game into a live research instrument — educating buyers while showing the
        trust team exactly which scams to defend against next.
      </p>
    </div>
  );
}

function rate(plays: PlayRecord[]): number {
  if (!plays.length) return 0;
  return plays.filter((p) => p.outcome === 'scammed').length / plays.length;
}

function Kpi({ icon: Icon, label, value, tone }: { icon: typeof Users; label: string; value: string | number; tone: 'ink' | 'teal' | 'coral' }) {
  const color = tone === 'teal' ? 'text-teal-bright' : tone === 'coral' ? 'text-coral-bright' : 'text-ink';
  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-card">
      <Icon className={cn('h-5 w-5', color)} />
      <div className={cn('mt-2 text-2xl font-extrabold', color)}>{value}</div>
      <div className="mt-0.5 text-[12px] text-ink-muted">{label}</div>
    </div>
  );
}
