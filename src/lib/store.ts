import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type {
  ArchetypeId, ChallengeState, ChallengeStatus, EventSession, Message, QuickAction,
  PlayRecord, TraceReport, ChallengeSignals,
} from './types';
import { ARCHETYPE_IDS } from './types';
import { scoreChallenge, eventScore, levelFor } from './scoring';
import { outcomeForAction, isSoftRisky } from './intervention';
import { plantedListingFor } from '@/data/listings';
import { redFlagsFor } from '@/data/redFlags';
import { challengeDef } from '@/data/challenges';

let seq = 0;
const id = () => `m${++seq}-${Date.now()}`;

const emptySignals = (): ChallengeSignals => ({
  turnsToResolve: 0, unsafeTaps: 0, softRiskyEngagements: 0, redFlagsNoticed: 0, redFlagIdsNoticed: [],
});

function freshChallenge(archetypeId: ArchetypeId): ChallengeState {
  return {
    archetypeId,
    status: 'unseen',
    listingId: plantedListingFor(archetypeId).id,
    messages: [],
    signals: emptySignals(),
  };
}

export function buildTraceSkeleton(
  archetypeId: ArchetypeId,
  outcome: 'defended' | 'scammed',
  signals: ChallengeSignals,
): TraceReport {
  const def = challengeDef(archetypeId);
  return {
    outcome,
    redFlags: redFlagsFor(archetypeId).map((flag) => ({
      flag,
      noticed: signals.redFlagIdsNoticed.includes(flag.id),
    })),
    didVsShould: def.didVsShould,
    tips: def.tips,
    score: scoreChallenge(outcome, signals),
  };
}

interface StoreState {
  session: EventSession | null;
  startEvent: (theme: { brandName: string; currency: string }) => void;
  openChallenge: (id: ArchetypeId) => void;
  appendMessage: (id: ArchetypeId, msg: Omit<Message, 'id' | 'ts'>) => void;
  applyQuickAction: (id: ArchetypeId, action: QuickAction) => void;
  resolveChallenge: (id: ArchetypeId, outcome: 'defended' | 'scammed') => void;
  setTraceLines: (id: ArchetypeId, lines: { summaryLine: string; momentLine: string }) => void;
  toPlayRecords: () => PlayRecord[];
  reset: () => void;
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      session: null,

      startEvent: (theme) => {
        const challenges = Object.fromEntries(
          ARCHETYPE_IDS.map((a) => [a, freshChallenge(a)]),
        ) as Record<ArchetypeId, ChallengeState>;
        set({
          session: {
            id: `evt-${Date.now()}`,
            startedAt: Date.now(),
            theme,
            challenges,
            eventScore: 0,
            level: 'Rookie',
          },
        });
      },

      openChallenge: (cid) =>
        set((s) => {
          if (!s.session) return s;
          const ch = s.session.challenges[cid];
          if (ch.status !== 'unseen') return s;
          return patchChallenge(s, cid, { status: 'in_progress' });
        }),

      appendMessage: (cid, msg) =>
        set((s) => {
          if (!s.session) return s;
          const ch = s.session.challenges[cid];
          return patchChallenge(s, cid, { messages: [...ch.messages, { ...msg, id: id(), ts: Date.now() }] });
        }),

      applyQuickAction: (cid, action) => {
        const s = get();
        if (!s.session) return;
        const ch = s.session.challenges[cid];
        const sig = { ...ch.signals };
        if (action.type === 'unsafe') sig.unsafeTaps += 1;
        if (isSoftRisky(action.type)) sig.softRiskyEngagements += 1;
        if (action.type === 'safe' && action.probesRedFlagId && !sig.redFlagIdsNoticed.includes(action.probesRedFlagId)) {
          sig.redFlagIdsNoticed = [...sig.redFlagIdsNoticed, action.probesRedFlagId];
          sig.redFlagsNoticed = sig.redFlagIdsNoticed.length;
        }
        sig.turnsToResolve = ch.messages.filter((m) => m.role === 'player').length + 1;

        set((cur) => patchChallenge(cur, cid, {
          signals: sig,
          messages: [...ch.messages, { id: id(), ts: Date.now(), role: 'player', text: action.label }],
        }));

        const outcome = outcomeForAction(action.type);
        if (outcome) get().resolveChallenge(cid, outcome);
      },

      resolveChallenge: (cid, outcome) =>
        set((s) => {
          if (!s.session) return s;
          const ch = s.session.challenges[cid];
          const status: ChallengeStatus = outcome;
          const score = scoreChallenge(outcome, ch.signals);
          const trace = buildTraceSkeleton(cid, outcome, ch.signals);
          const next = patchChallenge(s, cid, { status, score, trace });
          return recompute(next);
        }),

      setTraceLines: (cid, lines) =>
        set((s) => {
          if (!s.session) return s;
          const ch = s.session.challenges[cid];
          if (!ch.trace) return s;
          return patchChallenge(s, cid, { trace: { ...ch.trace, ...lines } });
        }),

      toPlayRecords: () => {
        const s = get().session;
        if (!s) return [];
        const attempted = Object.values(s.challenges).filter(
          (c) => c.status === 'defended' || c.status === 'scammed',
        );
        return attempted.map((c, i) => {
          const all = redFlagsFor(c.archetypeId).map((f) => f.id);
          const noticed = c.signals.redFlagIdsNoticed;
          return {
            archetypeId: c.archetypeId,
            outcome: c.status as 'defended' | 'scammed',
            turnsToResolve: c.signals.turnsToResolve,
            redFlagIdsNoticed: noticed,
            redFlagIdsMissed: all.filter((f) => !noticed.includes(f)),
            score: c.score?.total ?? 0,
            order: i + 1,
          };
        });
      },

      reset: () => set({ session: null }),
    }),
    { name: 'scam-school', storage: createJSONStorage(() => sessionStorage) },
  ),
);

function patchChallenge(s: StoreState, cid: ArchetypeId, patch: Partial<ChallengeState>): StoreState {
  if (!s.session) return s;
  return {
    ...s,
    session: {
      ...s.session,
      challenges: { ...s.session.challenges, [cid]: { ...s.session.challenges[cid], ...patch } },
    },
  };
}

function recompute(s: StoreState): StoreState {
  if (!s.session) return s;
  const totals = Object.values(s.session.challenges)
    .filter((c) => c.status === 'defended' || c.status === 'scammed')
    .map((c) => c.score?.total ?? 0);
  const es = eventScore(totals);
  return { ...s, session: { ...s.session, eventScore: es, level: levelFor(es) } };
}
