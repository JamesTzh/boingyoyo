import { describe, it, expect } from 'vitest';
import { CHALLENGES } from '@/data/challenges';
import { redFlagsFor } from '@/data/redFlags';
import { ARCHETYPE_IDS } from '@/lib/types';

describe('challenge data', () => {
  it('defines every archetype with exactly one unsafe and one report action', () => {
    for (const id of ARCHETYPE_IDS) {
      const def = CHALLENGES[id];
      expect(def).toBeTruthy();
      expect(def.quickActions.filter((a) => a.type === 'unsafe')).toHaveLength(1);
      expect(def.quickActions.filter((a) => a.type === 'report')).toHaveLength(1);
    }
  });
  it('every safe action probes an existing red flag for its archetype', () => {
    for (const id of ARCHETYPE_IDS) {
      const flagIds = redFlagsFor(id).map((f) => f.id);
      for (const a of CHALLENGES[id].quickActions) {
        if (a.type === 'safe') expect(flagIds).toContain(a.probesRedFlagId);
      }
    }
  });
});
