import { useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle2, XCircle } from 'lucide-react';
import { useStore } from '@/lib/store';
import { postTrace } from '@/lib/api';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { ArchetypeId } from '@/lib/types';

export function TraceScreen() {
  const { archetypeId } = useParams();
  const aId = archetypeId as ArchetypeId | undefined;
  const session = useStore((s) => s.session);
  const setTraceLines = useStore((s) => s.setTraceLines);
  const fetched = useRef(false);

  const ch = aId && session ? session.challenges[aId] : undefined;
  const trace = ch?.trace;

  useEffect(() => {
    if (!aId || !ch || !trace || trace.summaryLine || fetched.current) return;
    fetched.current = true;
    void (async () => {
      const lines = await postTrace({
        archetypeId: aId,
        outcome: trace.outcome as 'defended' | 'scammed',
        transcript: ch.messages.map((m) => ({ role: m.role as 'player' | 'seller', text: m.text })),
        signals: {
          turnsToResolve: ch.signals.turnsToResolve,
          unsafeTaps: ch.signals.unsafeTaps,
          softRiskyEngagements: ch.signals.softRiskyEngagements,
          redFlagsNoticed: ch.signals.redFlagsNoticed,
        },
      });
      if (lines) setTraceLines(aId, lines);
    })();
  }, [aId, ch, trace, setTraceLines]);

  if (!ch || !trace) return <div className="p-8 text-ink-muted">No trace yet.</div>;
  const scammed = trace.outcome === 'scammed';

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <div
        className={cn(
          'mb-6 rounded-2xl border p-5',
          scammed ? 'border-coral/30 bg-coral/10' : 'border-teal/30 bg-teal/10',
        )}
      >
        <div className={cn('flex items-center gap-2 text-lg font-bold', scammed ? 'text-coral-bright' : 'text-teal-bright')}>
          {scammed ? <XCircle className="h-5 w-5" /> : <CheckCircle2 className="h-5 w-5" />}
          {scammed ? 'You got scammed' : 'You defended this one'}
        </div>
        {trace.summaryLine && <p className="mt-2 text-sm text-ink">{trace.summaryLine}</p>}
        {trace.momentLine && <p className="mt-1 text-sm italic text-ink-muted">{trace.momentLine}</p>}
      </div>

      <h3 className="mb-3 font-semibold text-ink">Red flags</h3>
      <ul className="mb-6 space-y-2">
        {trace.redFlags.map(({ flag, noticed }) => (
          <li key={flag.id} className="flex gap-2.5 text-sm text-ink-muted">
            {noticed ? (
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-teal-bright" />
            ) : (
              <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-coral-bright" />
            )}
            <span><strong className="text-ink">{flag.label}</strong> — {flag.explanation}</span>
          </li>
        ))}
      </ul>

      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-4">
          <h4 className="mb-2 text-sm font-semibold text-coral-bright">What you did</h4>
          <ul className="list-disc space-y-1 pl-5 text-sm text-ink-muted">{trace.didVsShould.did.map((d, i) => <li key={i}>{d}</li>)}</ul>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <h4 className="mb-2 text-sm font-semibold text-teal-bright">What you should do</h4>
          <ul className="list-disc space-y-1 pl-5 text-sm text-ink-muted">{trace.didVsShould.should.map((d, i) => <li key={i}>{d}</li>)}</ul>
        </div>
      </div>

      <h3 className="mb-2 font-semibold text-ink">Tips</h3>
      <ul className="mb-6 list-disc space-y-1 pl-5 text-sm text-ink-muted">{trace.tips.map((t, i) => <li key={i}>{t}</li>)}</ul>

      <div className="mb-6 rounded-xl border border-border bg-card p-5">
        <div className="mb-3 font-semibold text-ink">Score: <span className="text-teal-bright">{trace.score.total}</span>/100</div>
        <ScoreBar label="Detection" value={trace.score.detection} max={60} />
        <ScoreBar label="Caution" value={trace.score.caution} max={25} />
        <ScoreBar label="Speed" value={trace.score.speed} max={15} />
      </div>

      <div className="flex gap-3">
        <Link to="/feed" className={cn(buttonVariants({ variant: 'outline' }))}>Keep hunting</Link>
        <Link to="/report" className={cn(buttonVariants())}>My report</Link>
      </div>
    </div>
  );
}

function ScoreBar({ label, value, max }: { label: string; value: number; max: number }) {
  return (
    <div className="mb-2.5 last:mb-0">
      <div className="mb-1 flex justify-between text-xs text-ink-muted"><span>{label}</span><span>{value}/{max}</span></div>
      <div className="h-2 overflow-hidden rounded-full bg-surface-2">
        <div className="h-full rounded-full bg-teal" style={{ width: `${(value / max) * 100}%` }} />
      </div>
    </div>
  );
}
