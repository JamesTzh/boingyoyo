import * as React from 'react';
import type { Listing } from '@/lib/types';
import { itemEmoji, itemGradient } from '@/lib/listing-visuals';
import { cn } from '@/lib/utils';

interface Props {
  listing: Listing;
  className?: string;
  iconClassName?: string;
  /** Optional real photograph. Drop a clean image in /public and pass its path. */
  photo?: string;
}

/**
 * Product imagery for a listing. This demo repo ships without usable photos
 * (placeholders are 1×1 stubs, and the only real assets are pre-composed cards
 * with prices baked in), so we render a designed, per-item placeholder. Pass a
 * real `photo` path to override it once photography is available.
 */
export function ItemImage({ listing, className, iconClassName, photo }: Props) {
  const [broken, setBroken] = React.useState(false);
  const emoji = itemEmoji(listing);
  const grad = itemGradient(listing);
  const src = photo ?? listing.photos?.[0];
  const showPhoto = Boolean(src) && !broken;

  return (
    <div className={cn('relative aspect-square overflow-hidden rounded-lg bg-surface-2', className)}>
      <div className={cn('absolute inset-0 bg-gradient-to-br', grad)} />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_22%,rgba(255,255,255,0.12),transparent_55%)]" />
      <span className="pointer-events-none absolute -bottom-5 -right-3 select-none text-[7rem] leading-none opacity-[0.12]">
        {emoji}
      </span>
      <span className={cn('absolute inset-0 grid place-items-center drop-shadow', iconClassName ?? 'text-5xl')}>
        {emoji}
      </span>
      {showPhoto && (
        <img
          src={src}
          alt={listing.title}
          loading="lazy"
          onError={() => setBroken(true)}
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}
    </div>
  );
}
