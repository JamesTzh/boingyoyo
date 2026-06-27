import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import { ScrollRail } from '@/components/ui/scroll-rail';

interface Banner {
  id: string;
  eyebrow: string;
  title: string;
  sub: string;
  cta: string;
  href: string;
  gradient: string;
  art: string;
  event?: boolean;
}

const BANNERS: Banner[] = [
  {
    id: 'event',
    eyebrow: 'Phish n Cheats · Live',
    title: 'Can you spot the scam?',
    sub: '5 fake listings are hidden below. Find them all before they find you.',
    cta: 'How it works',
    href: '/',
    gradient: 'from-emerald-500 via-teal-600 to-emerald-700',
    art: '🛡️',
    event: true,
  },
  {
    id: 'tech',
    eyebrow: 'Certified pre-loved',
    title: 'Up to 70% off tech',
    sub: 'Phones, laptops and consoles, inspected and Buyer-Protected.',
    cta: 'Shop Electronics',
    href: '/feed?cat=Electronics',
    gradient: 'from-sky-500 via-blue-600 to-indigo-700',
    art: '📱',
  },
  {
    id: 'sell',
    eyebrow: 'Earn from your clutter',
    title: 'Sell in 60 seconds',
    sub: 'Snap, list, and reach millions of buyers near you. It is free.',
    cta: 'Start selling',
    href: '/feed',
    gradient: 'from-rose-500 via-red-600 to-orange-600',
    art: '💸',
  },
];

export function HeroCarousel() {
  return (
    <ScrollRail>
      {BANNERS.map((b) => (
        <Link
          key={b.id}
          to={b.href}
          className={`relative flex h-48 w-[88%] shrink-0 snap-start flex-col justify-between overflow-hidden rounded-2xl bg-gradient-to-br p-6 text-white sm:w-[60%] sm:h-56 lg:w-[47%] ${b.gradient}`}
        >
          {/* soft light blob for depth */}
          <div className="pointer-events-none absolute -right-10 -top-10 h-44 w-44 rounded-full bg-white/15 blur-2xl" />
          <div className="relative">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-black/20 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide backdrop-blur-sm">
              {b.event && <ShieldCheck className="h-3.5 w-3.5" />}
              {b.eyebrow}
            </span>
            <h2 className="mt-3 max-w-[72%] text-2xl font-extrabold leading-tight text-balance sm:text-[28px]">
              {b.title}
            </h2>
            <p className="mt-1.5 max-w-[78%] text-[13px] text-white/85">{b.sub}</p>
          </div>
          <div className="relative flex items-center gap-1.5 text-sm font-semibold">
            {b.cta}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </div>
          <div className="pointer-events-none absolute bottom-3 right-5 text-[64px] leading-none opacity-90 sm:text-[88px]">
            {b.art}
          </div>
        </Link>
      ))}
    </ScrollRail>
  );
}
