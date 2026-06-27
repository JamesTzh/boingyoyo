import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

interface Props {
  title: string;
  actionLabel?: string;
  actionHref?: string;
  icon?: ReactNode;
}

export function SectionHeading({ title, actionLabel, actionHref, icon }: Props) {
  return (
    <div className="mb-4 flex items-end justify-between gap-4">
      <h2 className="text-[22px] font-bold tracking-tight text-ink">{title}</h2>
      {actionLabel && actionHref && (
        <Link
          to={actionHref}
          className="flex shrink-0 items-center gap-1 text-[13px] font-semibold text-teal-bright transition-colors hover:text-teal"
        >
          {icon}
          {actionLabel}
          {!icon && <ChevronRight className="h-4 w-4" />}
        </Link>
      )}
    </div>
  );
}
