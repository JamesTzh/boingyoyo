import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Heart, MapPin, ShieldCheck, Zap } from 'lucide-react';
import { listingById } from '@/data/listings';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ItemImage } from '@/components/ui/item-image';
import { buttonVariants } from '@/components/ui/button';
import { cn, price } from '@/lib/utils';

export function ListingDetailScreen() {
  const { id } = useParams();
  const listing = id ? listingById(id) : undefined;
  if (!listing) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-20 text-center text-ink-muted">
        Listing not found. <Link to="/feed" className="text-teal-bright">Back to browse</Link>
      </div>
    );
  }

  const seller = listing.playerIsSeller ? 'you' : listing.sellerName;
  const discounted = listing.marketPrice != null && listing.marketPrice > listing.price;

  return (
    <div className="mx-auto max-w-content px-4 py-6 sm:px-6">
      <Link to="/feed" className="mb-4 inline-flex items-center gap-1.5 text-sm text-ink-muted transition-colors hover:text-ink">
        <ArrowLeft className="h-4 w-4" /> Back
      </Link>

      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        {/* image */}
        <div className="relative">
          <ItemImage listing={listing} className="rounded-2xl" iconClassName="text-[6rem]" />
          {listing.buyerProtection && (
            <Badge variant="overlay" className="absolute bottom-3 left-3 z-10 gap-1">
              <ShieldCheck className="h-3.5 w-3.5 text-teal-bright" /> Buyer Protection eligible
            </Badge>
          )}
        </div>

        {/* details */}
        <div>
          {/* seller */}
          <div className="flex items-center gap-3">
            <Avatar name={seller} size={40} />
            <div>
              <div className="text-sm font-semibold text-ink">{seller}</div>
              <div className="flex items-center gap-1 text-[12px] text-ink-muted">
                <Zap className="h-3 w-3 fill-current" /> {listing.postedAt ?? 'recently'}
              </div>
            </div>
            {listing.sellerBadges?.[0] && (
              <Badge variant="teal" className="ml-auto">{listing.sellerBadges[0]}</Badge>
            )}
          </div>

          <h1 className="mt-5 text-2xl font-bold leading-snug text-ink">{listing.title}</h1>

          <div className="mt-3 flex items-baseline gap-3">
            <span className="text-3xl font-extrabold text-ink">{price(listing.price, listing.currency)}</span>
            {discounted && (
              <span className="text-base text-ink-muted line-through">{price(listing.marketPrice!, listing.currency)}</span>
            )}
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2 text-[13px] text-ink-muted">
            {listing.condition && <Badge variant="outline">{listing.condition}</Badge>}
            <span className="flex items-center gap-1"><Heart className="h-3.5 w-3.5" /> {listing.likes ?? 0} likes</span>
            <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> Singapore</span>
          </div>

          {listing.playerIsSeller && (
            <div className="mt-5 rounded-lg border border-amber-500/25 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
              This is your listing. A buyer has just messaged you.
            </div>
          )}

          <p className="mt-5 whitespace-pre-line text-[15px] leading-relaxed text-ink-muted">{listing.description}</p>

          <Link
            to={`/chat/${listing.id}`}
            className={cn(buttonVariants({ size: 'lg' }), 'mt-7 w-full sm:w-auto')}
          >
            {listing.playerIsSeller ? 'Open buyer chat' : 'Chat with seller'}
          </Link>
        </div>
      </div>
    </div>
  );
}
