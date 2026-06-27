import type { ThemeConfig } from './types';

export const defaultTheme: ThemeConfig = {
  brandName: 'Carouza',
  currency: 'SGD',
  logo: '/logo.svg',
  colors: {
    primary: '#10b981',   // teal accent
    primaryFg: '#052e23', // dark ink on teal
    bg: '#0e0e10',
    surface: '#1a1a1d',
    text: '#ffffff',
    muted: '#9ca3af',
    danger: '#ef4444',    // coral
    success: '#22c55e',
  },
  listingCard: 'grid',
  demoMode: true,
};
