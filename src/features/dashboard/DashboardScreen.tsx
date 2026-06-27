import { useStore } from '@/lib/store';
import { aggregate } from '@/lib/aggregate';
import { SEED_PLAYS } from '@/data/seeds';

const LABEL: Record<string, string> = {
  off_platform: 'Off-platform',
  urgency_flash_sale: 'Urgency / flash sale',
  deposit_before_meetup: 'Deposit before meetup',
  fake_payment_proof: 'Fake payment proof',
  counterfeit_item: 'Counterfeit',
};

export function DashboardScreen() {
  const live = useStore((s) => (s.session ? s.toPlayRecords() : []));
  const stats = aggregate([...SEED_PLAYS, ...live]).sort((a, b) => b.fellForRate - a.fellForRate);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-bold">Trust &amp; Safety — Scam School insights</h1>
      <p className="mb-6 text-sm text-slate-500">Aggregated across all players{live.length ? ' + you, tonight' : ''}.</p>

      <h2 className="mb-3 font-semibold">Which scams fool the most people</h2>
      <div className="space-y-2">
        {stats.map((s) => (
          <div key={s.archetypeId}>
            <div className="flex justify-between text-sm">
              <span>{LABEL[s.archetypeId]}</span>
              <span>{Math.round(s.fellForRate * 100)}% fell for it</span>
            </div>
            <div className="h-3 rounded bg-slate-200">
              <div className="h-3 rounded bg-danger" style={{ width: `${s.fellForRate * 100}%` }} />
            </div>
          </div>
        ))}
      </div>

      <h2 className="mb-3 mt-8 font-semibold">Most-missed red flags</h2>
      <ul className="list-disc pl-5 text-sm">
        {stats.flatMap((s) => s.mostMissedFlags.slice(0, 1).map((f) => (
          <li key={`${s.archetypeId}-${f.redFlagId}`}>{LABEL[s.archetypeId]}: <code>{f.redFlagId}</code> missed {Math.round(f.missRate * 100)}% of the time</li>
        )))}
      </ul>
    </div>
  );
}
