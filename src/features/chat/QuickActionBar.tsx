import type { QuickAction } from '@/lib/types';

const styleFor: Record<QuickAction['type'], string> = {
  safe: 'border border-slate-300 bg-white text-slate-700',
  risky: 'border border-amber-300 bg-amber-50 text-amber-800',
  report: 'border border-slate-400 bg-slate-100 text-slate-700',
  unsafe: 'bg-brand text-brand-fg font-semibold',
};

export function QuickActionBar({ actions, onPick }: { actions: QuickAction[]; onPick: (a: QuickAction) => void }) {
  return (
    <div className="flex flex-wrap gap-2 border-t bg-white p-3">
      {actions.map((a) => (
        <button key={a.id} onClick={() => onPick(a)} className={`rounded-full px-3 py-1.5 text-sm ${styleFor[a.type]}`}>
          {a.label}
        </button>
      ))}
    </div>
  );
}
