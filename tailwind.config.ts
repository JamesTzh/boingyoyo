import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: 'var(--brand-primary)',
        'brand-fg': 'var(--brand-primary-fg)',
        surface: 'var(--brand-surface)',
        danger: 'var(--brand-danger)',
        success: 'var(--brand-success)',
      },
    },
  },
  plugins: [],
} satisfies Config;
