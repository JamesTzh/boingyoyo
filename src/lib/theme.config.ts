import type { ThemeConfig } from './types';

export const defaultTheme: ThemeConfig = {
  brandName: 'Marketly',
  currency: 'SGD',
  logo: '/logo.svg',
  colors: {
    primary: '#2563eb',
    primaryFg: '#ffffff',
    bg: '#f8fafc',
    surface: '#ffffff',
    text: '#0f172a',
    muted: '#64748b',
    danger: '#dc2626',
    success: '#16a34a',
  },
  listingCard: 'grid',
  demoMode: true,
};
