import { Flag, Sparkles, Tag } from 'lucide-react';
import type { Suggestion } from '@/data/suggestions';

export type EndAction = 'report' | 'offer';

interface Props {
  suggestions: Suggestion[];
  onSend: (s: Suggestion) => void;
  onEnd: (action: EndAction) => void;
  disabled?: boolean;
}

// Conversational suggestions (LLM-routed) plus the two consistent ways to end:
// Report (defend) or Make offer (proceed) — the LLM judges the outcome of either.
export function SuggestionBar({ suggestions, onSend, onEnd, disabled }: Props) {
  return (
    <div className="space-y-2.5 border-t border-border bg-bg-nav/60 p-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="flex items-center gap-1 text-[11px] font-medium uppercase tracking-wide text-ink-muted">
          <Sparkles className="h-3 w-3 text-teal-bright" /> Suggested
        </span>
        {suggestions.map((s) => (
          <button
            key={s.id}
            disabled={disabled}
            onClick={() => onSend(s)}
            className="rounded-full border border-border bg-transparent px-3.5 py-1.5 text-[13px] text-ink transition-colors hover:border-ink-muted disabled:opacity-40"
          >
            {s.text}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          disabled={disabled}
          onClick={() => onEnd('report')}
          className="inline-flex items-center gap-1.5 rounded-full border border-teal/40 bg-teal/10 px-3.5 py-1.5 text-[13px] text-teal-bright transition-colors hover:bg-teal/15 disabled:opacity-40"
        >
          <Flag className="h-3.5 w-3.5" /> Report this listing
        </button>
        <button
          disabled={disabled}
          onClick={() => onEnd('offer')}
          className="inline-flex items-center gap-1.5 rounded-full bg-coral px-3.5 py-1.5 text-[13px] font-semibold text-white transition-colors hover:bg-coral-bright disabled:opacity-40"
        >
          <Tag className="h-3.5 w-3.5" /> Make offer
        </button>
      </div>
    </div>
  );
}
