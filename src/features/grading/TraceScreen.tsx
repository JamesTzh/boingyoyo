import { useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useStore } from '@/lib/store';
import { postTrace } from '@/lib/api';
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

  if (!ch || !trace) return <div className="p-8">No trace yet.</div>;
  const scammed = trace.outcome === 'scammed';

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <div className={`mb-4 rounded-lg p-4 ${scammed ? 'bg-red-50 text-red-800' : 'bg-green-50 text-green-800'}`}>
        <div className="text-lg font-bold">{scammed ? '⚠️ You got scammed' : '✅ You defended this one'}</div>
        {trace.summaryLine && <p className="mt-1 text-sm">{trace.summaryLine}</p>}
        {trace.momentLine && <p className="mt-1 text-sm italic">{trace.momentLine}</p>}
      </div>

      <h3 className="mb-2 font-semibold">Red flags</h3>
      <ul className="mb-4 space-y-1">
        {trace.redFlags.map(({ flag, noticed }) => (
          <li key={flag.id} className="text-sm">
            <span>{noticed ? '✅' : '❌'}</span> <strong>{flag.label}</strong> — {flag.explanation}
          </li>
        ))}
      </ul>

      <div className="mb-4 grid grid-cols-2 gap-4">
        <div>
          <h4 className="font-semibold text-red-700">What you did</h4>
          <ul className="list-disc pl-5 text-sm">{trace.didVsShould.did.map((d, i) => <li key={i}>{d}</li>)}</ul>
        </div>
        <div>
          <h4 className="font-semibold text-green-700">What you should do</h4>
          <ul className="list-disc pl-5 text-sm">{trace.didVsShould.should.map((d, i) => <li key={i}>{d}</li>)}</ul>
        </div>
      </div>

      <h3 className="mb-2 font-semibold">Tips</h3>
      <ul className="mb-4 list-disc pl-5 text-sm">{trace.tips.map((t, i) => <li key={i}>{t}</li>)}</ul>

      <div className="mb-6 rounded-lg border p-4">
        <div className="mb-2 font-semibold">Score: {trace.score.total}/100</div>
        <ScoreBar label="Detection" value={trace.score.detection} max={60} />
        <ScoreBar label="Caution" value={trace.score.caution} max={25} />
        <ScoreBar label="Speed" value={trace.score.speed} max={15} />
      </div>

      <div className="flex gap-3">
        <Link to="/feed" className="rounded-lg border px-4 py-2">Keep hunting</Link>
        <Link to="/report" className="rounded-lg bg-brand px-4 py-2 text-brand-fg">My report</Link>
      </div>
    </div>
  );
}

function ScoreBar({ label, value, max }: { label: string; value: number; max: number }) {
  return (
    <div className="mb-1">
      <div className="flex justify-between text-xs"><span>{label}</span><span>{value}/{max}</span></div>
      <div className="h-2 rounded bg-slate-200"><div className="h-2 rounded bg-brand" style={{ width: `${(value / max) * 100}%` }} /></div>
    </div>
  );
}
