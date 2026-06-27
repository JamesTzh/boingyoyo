import { describe, it, expect } from 'vitest';
import { defaultTheme } from '@/lib/theme.config';
import { ARCHETYPE_IDS } from '@/lib/types';

describe('theme + constants', () => {
  it('ships the demo brand defaults', () => {
    expect(defaultTheme.brandName).toBe('Carouza');
    expect(defaultTheme.currency).toBe('SGD');
  });
  it('declares exactly 5 archetypes', () => {
    expect(ARCHETYPE_IDS).toHaveLength(5);
  });
});
