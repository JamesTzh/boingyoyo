import { createContext, useContext, useEffect, type ReactNode } from 'react';
import { defaultTheme } from '@/lib/theme.config';
import type { ThemeConfig } from '@/lib/types';

const ThemeContext = createContext<ThemeConfig>(defaultTheme);
export const useTheme = () => useContext(ThemeContext);

export function ThemeProvider({ theme = defaultTheme, children }: { theme?: ThemeConfig; children: ReactNode }) {
  useEffect(() => {
    const r = document.documentElement;
    r.style.setProperty('--brand-primary', theme.colors.primary);
    r.style.setProperty('--brand-primary-fg', theme.colors.primaryFg);
    r.style.setProperty('--brand-surface', theme.colors.surface);
    r.style.setProperty('--brand-danger', theme.colors.danger);
    r.style.setProperty('--brand-success', theme.colors.success);
  }, [theme]);
  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}
