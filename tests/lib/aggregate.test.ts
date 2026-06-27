import { describe, it, expect } from 'vitest';
import { aggregate } from '@/lib/aggregate';
import type { PlayRecord } from '@/lib/types';
import { SEED_PLAYS } from '@/data/seeds';

const play = (p: Partial<PlayRecord>): PlayRecord => ({
  archetypeId: 'off_platform', outcome: 'defended', turnsToResolve: 3,
  redFlagIdsNoticed: [], redFlagIdsMissed: [], score: 80, order: 1, ...p,
});

describe('aggregate', () => {
  it('computes fell-for rate per archetype', () => {
    const stats = aggregate([
      play({ archetypeId: 'off_platform', outcome: 'scammed' }),
      play({ archetypeId: 'off_platform', outcome: 'defended' }),
    ]);
    const op = stats.find((s) => s.archetypeId === 'off_platform')!;
    expect(op.attempts).toBe(2);
    expect(op.fellForCount).toBe(1);
    expect(op.fellForRate).toBe(0.5);
  });
  it('ranks most-missed flags by miss rate', () => {
    const stats = aggregate([
      play({ archetypeId: 'counterfeit_item', outcome: 'scammed', redFlagIdsMissed: ['price_too_low', 'evasive_seller'] }),
      play({ archetypeId: 'counterfeit_item', outcome: 'scammed', redFlagIdsMissed: ['price_too_low'] }),
    ]);
    const cf = stats.find((s) => s.archetypeId === 'counterfeit_item')!;
    expect(cf.mostMissedFlags[0].redFlagId).toBe('price_too_low');
    expect(cf.mostMissedFlags[0].missRate).toBe(1);
  });
  it('returns a row for every archetype even with zero attempts', () => {
    expect(aggregate([])).toHaveLength(5);
  });
  it('seed baseline ranks urgency above counterfeit for fell-for rate', () => {
    const stats = aggregate(SEED_PLAYS);
    const urg = stats.find((s) => s.archetypeId === 'urgency_flash_sale')!;
    const cnt = stats.find((s) => s.archetypeId === 'counterfeit_item')!;
    expect(urg.fellForRate).toBeGreaterThan(cnt.fellForRate);
  });
  it('avgDetectTurns averages only defended plays, rounds to 1 dp', () => {
    const stats = aggregate([
      play({ archetypeId: 'off_platform', outcome: 'defended', turnsToResolve: 4 }),
      play({ archetypeId: 'off_platform', outcome: 'defended', turnsToResolve: 3 }),
      play({ archetypeId: 'off_platform', outcome: 'scammed', turnsToResolve: 1 }),
    ]);
    const op = stats.find((s) => s.archetypeId === 'off_platform')!;
    expect(op.avgDetectTurns).toBe(3.5); // (4+3)/2, excludes the scammed play
  });
});
