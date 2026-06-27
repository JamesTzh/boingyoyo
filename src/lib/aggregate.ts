import type { PlayRecord, AggregateStat, ArchetypeId } from './types';
import { ARCHETYPE_IDS } from './types';

export function aggregate(plays: PlayRecord[]): AggregateStat[] {
  return ARCHETYPE_IDS.map((id) => statFor(id, plays.filter((p) => p.archetypeId === id)));
}

function statFor(archetypeId: ArchetypeId, plays: PlayRecord[]): AggregateStat {
  const attempts = plays.length;
  const fellForCount = plays.filter((p) => p.outcome === 'scammed').length;
  const defended = plays.filter((p) => p.outcome === 'defended');
  const avgDetectTurns =
    defended.length === 0
      ? 0
      : Math.round((defended.reduce((a, p) => a + p.turnsToResolve, 0) / defended.length) * 10) / 10;

  const missCounts = new Map<string, number>();
  for (const p of plays) {
    for (const id of p.redFlagIdsMissed) missCounts.set(id, (missCounts.get(id) ?? 0) + 1);
  }
  const mostMissedFlags = [...missCounts.entries()]
    .map(([redFlagId, count]) => ({ redFlagId, missRate: attempts ? count / attempts : 0 }))
    .sort((a, b) => b.missRate - a.missRate)
    .slice(0, 3);

  return {
    archetypeId,
    attempts,
    fellForCount,
    fellForRate: attempts ? fellForCount / attempts : 0,
    avgDetectTurns,
    mostMissedFlags,
  };
}
