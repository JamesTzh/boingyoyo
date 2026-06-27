import type { Message } from '@/lib/types';
import { cn } from '@/lib/utils';

export function MessageBubble({ msg }: { msg: Message }) {
  const mine = msg.role === 'player';
  return (
    <div className={cn('flex', mine ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'max-w-[78%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed',
          mine
            ? 'rounded-br-sm bg-teal text-primary-foreground'
            : 'rounded-bl-sm bg-surface-2 text-ink',
        )}
      >
        {msg.text}
      </div>
    </div>
  );
}
