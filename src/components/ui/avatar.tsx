import * as React from 'react';
import { cn } from '@/lib/utils';

// A deterministic gradient so each seller keeps a stable, believable avatar
// without needing uploaded images.
const PALETTE = [
  'from-rose-400 to-orange-400',
  'from-sky-400 to-indigo-400',
  'from-emerald-400 to-teal-400',
  'from-fuchsia-400 to-purple-400',
  'from-amber-400 to-yellow-300',
  'from-cyan-400 to-blue-400',
];

function hash(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  name: string;
  size?: number;
}

export function Avatar({ name, size = 28, className, style, ...props }: AvatarProps) {
  const initials = name.replace(/[^a-zA-Z0-9]/g, ' ').trim().slice(0, 2).toUpperCase() || '?';
  const grad = PALETTE[hash(name) % PALETTE.length];
  return (
    <div
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br font-semibold text-black/80 ring-1 ring-white/10',
        grad,
        className,
      )}
      style={{ width: size, height: size, fontSize: size * 0.4, ...style }}
      {...props}
    >
      {initials}
    </div>
  );
}
