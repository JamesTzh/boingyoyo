import { Link } from 'react-router-dom';
import { Heart, ShieldCheck, Zap } from 'lucide-react';
import type { Listing } from '@/lib/types';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ItemImage } from '@/components/ui/item-image';
import { cn, price } from '@/lib/utils';

export function ListingCard({ listing, className }: { listing: Listing; className?: string }) {
  const discounted = listing.marketPrice != null && listing.marketPrice > listing.price;
  const seller = listing.playerIsSeller ? 'you' : listing.sellerName;

  return (
    <Link
      to={`/listing/${listing.id}`}
      className={cn(
        'group/card block w-full rounded-lg p-2 transition-transform duration-200 hover:-translate-y-1',
        className,
      )}
    >
      {/* seller row */}
      <div className="mb-2 flex items-center gap-2">
        <Avatar name={seller} size={26} />
        <span className="truncate text-[13px] font-semibold text-ink">{seller}</span>
        <span className="ml-auto flex shrink-0 items-center gap-0.5 text-[11px] text-ink-muted">
          <Zap className="h-3 w-3 fill-current" />
          {listing.postedAt ?? 'recently'}
        </span>
      </div>

      {/* product image */}
      <div className="relative">
        <ItemImage
          listing={listing}
          className="transition-transform duration-300 group-hover/card:scale-[1.03]"
        />
        {listing.buyerProtection && (
          <Badge variant="overlay" className="absolute bottom-2 left-2 z-10 gap-1">
            <ShieldCheck className="h-3 w-3 text-teal-bright" />
            Buyer Protection
          </Badge>
        )}
      </div>

      {/* details */}
      <div className="px-0.5 pt-2.5">
        <h3 className="line-clamp-2 min-h-[2.5em] text-[13px] leading-tight text-ink">{listing.title}</h3>
        <div className="mt-1.5 flex items-baseline gap-2">
          <span className="text-[15px] font-bold text-ink">{price(listing.price, listing.currency)}</span>
          {discounted && (
            <span className="text-xs text-ink-muted line-through">
              {price(listing.marketPrice!, listing.currency)}
            </span>
          )}
        </div>
        {listing.condition && <div className="mt-0.5 text-[12px] text-ink-muted">{listing.condition}</div>}

        <div className="mt-2 flex items-center gap-1 text-[12px] text-ink-muted">
          <Heart className="h-3.5 w-3.5" />
          {listing.likes ?? 0}
        </div>
      </div>
    </Link>
  );
}
