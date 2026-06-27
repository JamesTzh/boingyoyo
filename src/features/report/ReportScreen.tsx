import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useStore } from '@/lib/store';
import { ARCHETYPE_IDS } from '@/lib/types';

const LABEL: Record<string, string> = {
  off_platform: 'Off-platform transaction',
  urgency_flash_sale: 'Flash-sale / urgency trap',
  deposit_before_meetup: 'Deposit before meetup',
  fake_payment_proof: 'Fake payment proof',
  counterfeit_item: 'Counterfeit / too-good-to-be-true',
};

export function ReportScreen() {
  const navigate = useNavigate();
  const session = useStore((s) => s.session);
  const reset = useStore((s) => s.reset);
  if (!session) return <div className="p-8">No event in progress. <Link className="text-brand" to="/">Start</Link></div>;

  const chs = session.challenges;
  const fellFor = ARCHETYPE_IDS.filter((a) => chs[a].status === 'scammed');
  const defended = ARCHETYPE_IDS.filter((a) => chs[a].status === 'defended');
  const notFound = ARCHETYPE_IDS.filter((a) => chs[a].status === 'unseen' || chs[a].status === 'in_progress');

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6 rounded-2xl bg-white p-8 text-center shadow">
        <div className="text-sm uppercase tracking-wide text-slate-500">Your Scam Resistance</div>
        <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="my-2 text-6xl font-extrabold text-brand">
          {session.eventScore}
        </motion.div>
        <div className="text-xl font-semibold">{session.level}</div>
      </div>

      <Section title="🛡️ Scams you defended" items={defended} chs={chs} empty="None yet." />
      <Section title="⚠️ Scams you fell for" items={fellFor} chs={chs} empty="None — nice." />
      <div className="mb-4">
        <h3 className="mb-2 font-semibold">🔎 Scams you haven't found yet</h3>
        {notFound.length === 0 ? <p className="text-sm text-slate-500">You found all five. 🎉</p> : (
          <ul className="space-y-1">{notFound.map((a) => <li key={a} className="text-sm text-slate-600">{LABEL[a]} — go hunt it to complete your training.</li>)}</ul>
        )}
      </div>

      <div className="mt-6 flex gap-3">
        <Link to="/dashboard" className="rounded-lg bg-brand px-4 py-2 text-brand-fg">See the trust-team dashboard</Link>
        <button onClick={() => { reset(); navigate('/'); }} className="rounded-lg border px-4 py-2">Restart</button>
      </div>
    </div>
  );
}

function Section({ title, items, chs, empty }: { title: string; items: string[]; chs: Record<string, { archetypeId: string }>; empty: string }) {
  return (
    <div className="mb-4">
      <h3 className="mb-2 font-semibold">{title}</h3>
      {items.length === 0 ? <p className="text-sm text-slate-500">{empty}</p> : (
        <ul className="space-y-1">
          {items.map((a) => <li key={a} className="text-sm"><Link className="text-brand" to={`/trace/${a}`}>{LABEL[a]}</Link></li>)}
        </ul>
      )}
    </div>
  );
}
