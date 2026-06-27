import { Link } from 'react-router-dom';
import type { Listing } from '@/lib/types';

export function ListingCard({ listing }: { listing: Listing }) {
  return (
    <Link to={`/listing/${listing.id}`} className="block overflow-hidden rounded-lg border bg-white hover:shadow">
      <img src={listing.photos[0]} alt={listing.title} className="h-40 w-full object-cover" />
      <div className="p-3">
        <div className="font-semibold">{listing.currency} {listing.price}</div>
        <div className="line-clamp-1 text-sm text-slate-600">{listing.title}</div>
        {listing.sellerBadges?.[0] && (
          <span className="mt-1 inline-block rounded bg-slate-100 px-2 py-0.5 text-xs">{listing.sellerBadges[0]}</span>
        )}
      </div>
    </Link>
  );
}
