import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MapPin, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function SearchBar() {
  const [params, setParams] = useSearchParams();
  const [q, setQ] = useState(params.get('q') ?? '');

  const submit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const next = new URLSearchParams(params);
    if (q.trim()) next.set('q', q.trim());
    else next.delete('q');
    setParams(next, { replace: true });
  };

  return (
    <form onSubmit={submit} className="flex items-stretch gap-2">
      <div className="flex flex-1 items-center overflow-hidden rounded-lg bg-surface-input ring-1 ring-inset ring-border focus-within:ring-2 focus-within:ring-ring">
        {/* item field */}
        <div className="flex flex-1 items-center gap-2.5 px-3.5">
          <Search className="h-4 w-4 shrink-0 text-ink-muted" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search for an item"
            className="h-11 w-full bg-transparent text-sm text-ink placeholder:text-ink-muted focus:outline-none"
          />
        </div>
        {/* divider + location field */}
        <div className="hidden h-6 w-px shrink-0 bg-border sm:block" />
        <div className="hidden items-center gap-2 px-3.5 text-sm text-ink-muted sm:flex">
          <MapPin className="h-4 w-4 shrink-0" />
          <span className="whitespace-nowrap">All of Singapore</span>
        </div>
      </div>

      <Button type="submit" size="lg" className="h-11 px-6">
        <Search className="h-4 w-4" />
        <span className="hidden sm:inline">Search</span>
      </Button>
    </form>
  );
}
