// Shared heading for an admin tab: a small eyebrow, a title, a one-line summary
// and a row of context chips. Keeps the two tabs visually in step.
export function AdminPageHeader({
  eyebrow,
  title,
  subtitle,
  chips = [],
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  chips?: string[];
}) {
  return (
    <header className="mb-6">
      <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-teal-bright">{eyebrow}</div>
      <h1 className="mt-1.5 text-[26px] font-bold leading-tight tracking-tight text-ink">{title}</h1>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-muted">{subtitle}</p>
      {chips.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {chips.map((c) => (
            <span
              key={c}
              className="inline-flex items-center rounded-full border border-border bg-surface-2/50 px-2.5 py-1 text-[12px] font-medium text-ink-muted"
            >
              {c}
            </span>
          ))}
        </div>
      )}
    </header>
  );
}
