import { describe, it, expect } from 'vitest';
import { outcomeForAction, isSoftRisky } from '@/lib/intervention';

describe('intervention mapping', () => {
  it('unsafe → scammed, report → defended, others → null', () => {
    expect(outcomeForAction('unsafe')).toBe('scammed');
    expect(outcomeForAction('report')).toBe('defended');
    expect(outcomeForAction('safe')).toBeNull();
    expect(outcomeForAction('risky')).toBeNull();
  });
  it('only risky is soft-risky', () => {
    expect(isSoftRisky('risky')).toBe(true);
    expect(isSoftRisky('safe')).toBe(false);
    expect(isSoftRisky('unsafe')).toBe(false);
  });
});
