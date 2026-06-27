import type { PlayRecord, ArchetypeId } from '@/lib/types';
import { redFlagsFor } from './redFlags';

// Per-archetype synthetic baseline: [attempts, fellForRate] tuned so urgency &
// off-platform fool the most, counterfeit the least (spec 05 §4).
const BASELINE: Record<ArchetypeId, { attempts: number; fellForRate: number; avgTurns: number }> = {
  urgency_flash_sale: { attempts: 30, fellForRate: 0.6, avgTurns: 4 },
  off_platform: { attempts: 28, fellForRate: 0.5, avgTurns: 3 },
  fake_payment_proof: { attempts: 22, fellForRate: 0.45, avgTurns: 5 },
  deposit_before_meetup: { attempts: 24, fellForRate: 0.38, avgTurns: 4 },
  counterfeit_item: { attempts: 26, fellForRate: 0.27, avgTurns: 6 },
};

function buildFor(id: ArchetypeId): PlayRecord[] {
  const { attempts, fellForRate, avgTurns } = BASELINE[id];
  const flagIds = redFlagsFor(id).map((f) => f.id);
  const fellFor = Math.round(attempts * fellForRate);
  const out: PlayRecord[] = [];
  for (let i = 0; i < attempts; i++) {
    const scammed = i < fellFor;
    // Scammed plays miss the first flag most often (drives "most-missed").
    const missed = scammed ? flagIds.slice(0, 1 + (i % flagIds.length)) : [];
    const noticed = flagIds.filter((f) => !missed.includes(f));
    out.push({
      archetypeId: id,
      outcome: scammed ? 'scammed' : 'defended',
      turnsToResolve: avgTurns,
      redFlagIdsNoticed: noticed,
      redFlagIdsMissed: missed,
      score: scammed ? 15 : 85,
      order: 1 + (i % 5),
    });
  }
  return out;
}

export const SEED_PLAYS: PlayRecord[] = (
  Object.keys(BASELINE) as ArchetypeId[]
).flatMap(buildFor);
