import type { Message } from '@/lib/types';

export function MessageBubble({ msg }: { msg: Message }) {
  const mine = msg.role === 'player';
  return (
    <div className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm ${mine ? 'bg-brand text-brand-fg' : 'bg-slate-200 text-slate-900'}`}>
        {msg.text}
      </div>
    </div>
  );
}
