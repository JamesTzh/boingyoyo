import type { ChallengeSignals, ScoreBreakdown, Level } from './types';

const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));

export function scoreChallenge(
  outcome: 'defended' | 'scammed',
  s: ChallengeSignals,
): ScoreBreakdown {
  const detection =
    outcome === 'defended' ? 60 : Math.min(30, 10 * s.redFlagsNoticed);
  const caution = clamp(25 - 20 * s.unsafeTaps - 10 * s.softRiskyEngagements, 0, 25);
  const speed =
    outcome === 'defended' ? clamp(15 - 3 * Math.max(0, s.turnsToResolve - 2), 0, 15) : 0;
  const total = clamp(detection + caution + speed, 0, 100);
  return { detection, caution, speed, total };
}

export function levelFor(score: number): Level {
  if (score >= 80) return 'Guardian';
  if (score >= 60) return 'Sharp';
  if (score >= 40) return 'Aware';
  return 'Rookie';
}

export function eventScore(totals: number[]): number {
  if (totals.length === 0) return 0;
  return Math.round(totals.reduce((a, b) => a + b, 0) / totals.length);
}
