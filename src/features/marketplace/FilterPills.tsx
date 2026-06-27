import { cn } from '@/lib/utils';

interface Props {
  options: string[];
  value: string;
  onChange: (v: string) => void;
}

export function FilterPills({ options, value, onChange }: Props) {
  return (
    <div className="no-scrollbar -mx-1 mb-4 flex gap-2 overflow-x-auto px-1 pb-1">
      {options.map((opt) => {
        const active = opt === value;
        return (
          <button
            key={opt}
            onClick={() => onChange(opt)}
            aria-pressed={active}
            className={cn(
              'h-8 shrink-0 rounded-full px-4 text-[13px] font-medium transition-colors',
              active
                ? 'bg-teal text-primary-foreground'
                : 'border border-border bg-transparent text-ink hover:border-ink-muted',
            )}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}
