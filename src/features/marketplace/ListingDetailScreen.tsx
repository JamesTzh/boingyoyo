import { useParams, Link } from 'react-router-dom';
import { listingById } from '@/data/listings';

export function ListingDetailScreen() {
  const { id } = useParams();
  const listing = id ? listingById(id) : undefined;
  if (!listing) return <div className="p-8">Listing not found.</div>;

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <img src={listing.photos[0]} alt={listing.title} className="mb-4 h-72 w-full rounded-lg object-cover" />
      <h1 className="text-2xl font-bold">{listing.title}</h1>
      <div className="my-2 text-2xl font-extrabold text-brand">{listing.currency} {listing.price}</div>
      {listing.marketPrice && listing.marketPrice > listing.price && (
        <div className="mb-2 text-sm text-slate-500">Market price ~{listing.currency} {listing.marketPrice}</div>
      )}
      {listing.playerIsSeller && (
        <div className="mb-3 rounded bg-amber-50 px-3 py-2 text-sm text-amber-800">You are selling this item.</div>
      )}
      <p className="mb-6 text-slate-700">{listing.description}</p>
      <div className="text-sm text-slate-600">Seller: {listing.sellerName}</div>
      <Link to={`/chat/${listing.id}`} className="mt-6 inline-block rounded-lg bg-brand px-6 py-3 font-semibold text-brand-fg">
        {listing.playerIsSeller ? 'Open buyer chat' : 'Chat with seller'}
      </Link>
    </div>
  );
}
