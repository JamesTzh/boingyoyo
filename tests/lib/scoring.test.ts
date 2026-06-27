import { describe, it, expect } from 'vitest';
import { scoreChallenge, levelFor, eventScore } from '@/lib/scoring';
import type { ChallengeSignals } from '@/lib/types';

const sig = (p: Partial<ChallengeSignals>): ChallengeSignals => ({
  turnsToResolve: 0, unsafeTaps: 0, softRiskyEngagements: 0, redFlagsNoticed: 0, redFlagIdsNoticed: [], ...p,
});

describe('scoreChallenge', () => {
  it('perfect defend = 100', () => {
    expect(scoreChallenge('defended', sig({ turnsToResolve: 2 })).total).toBe(100);
  });
  it('defend, 5 turns, 1 soft-risky = 81', () => {
    const s = scoreChallenge('defended', sig({ turnsToResolve: 5, softRiskyEngagements: 1 }));
    expect(s).toMatchObject({ detection: 60, caution: 15, speed: 6, total: 81 });
  });
  it('scammed but probed 2 flags = 25', () => {
    const s = scoreChallenge('scammed', sig({ unsafeTaps: 1, redFlagsNoticed: 2 }));
    expect(s).toMatchObject({ detection: 20, caution: 5, speed: 0, total: 25 });
  });
  it('scammed instantly, unaware = 5', () => {
    expect(scoreChallenge('scammed', sig({ unsafeTaps: 1 })).total).toBe(5);
  });
});

describe('levelFor', () => {
  it('maps score bands', () => {
    expect(levelFor(10)).toBe('Rookie');
    expect(levelFor(45)).toBe('Aware');
    expect(levelFor(72)).toBe('Sharp');
    expect(levelFor(90)).toBe('Guardian');
  });
});

describe('eventScore', () => {
  it('is the mean of attempted totals, 0 when none', () => {
    expect(eventScore([100, 50])).toBe(75);
    expect(eventScore([])).toBe(0);
  });
});
