import type {
  ChatRequest, ChatResponse, TraceRequest, TraceResponse, JudgeRequest, JudgeResponse, ArchetypeId,
} from './types';

const GENERIC_FALLBACK: Record<ArchetypeId, string> = {
  off_platform: 'so shall we just continue on WhatsApp? easier there',
  urgency_flash_sale: 'a few others are keen - can you pay now to lock it in?',
  deposit_before_meetup: 'lots of interest - send a deposit and i\'ll hold it for you',
  phishing_link: 'just pay through the secure link i send, then i can release it',
  counterfeit_item: 'it\'s 100% original, trust me. want me to reserve it?',
};

async function withTimeout<T>(p: (signal: AbortSignal) => Promise<T>, ms: number): Promise<T> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  try {
    return await p(ctrl.signal);
  } finally {
    clearTimeout(t);
  }
}

export async function postChat(body: ChatRequest): Promise<ChatResponse> {
  try {
    return await withTimeout(async (signal) => {
      const r = await fetch('/api/chat', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body), signal,
      });
      if (!r.ok) throw new Error(`chat ${r.status}`);
      return (await r.json()) as ChatResponse;
    }, 9000);
  } catch {
    return { reply: GENERIC_FALLBACK[body.archetypeId], viaFallback: true };
  }
}

export async function postTrace(body: TraceRequest): Promise<TraceResponse | null> {
  try {
    return await withTimeout(async (signal) => {
      const r = await fetch('/api/trace', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body), signal,
      });
      if (!r.ok) throw new Error(`trace ${r.status}`);
      return (await r.json()) as TraceResponse;
    }, 9000);
  } catch {
    return null;
  }
}

// Ask the LLM to judge the whole conversation: were they scammed or did they avoid it?
export async function postJudge(body: JudgeRequest): Promise<JudgeResponse> {
  const fallback = (): JudgeResponse => ({
    outcome: body.finalAction === 'report' ? 'avoided' : 'scammed',
    redFlagIdsNoticed: [],
    reason:
      body.finalAction === 'report'
        ? 'You reported the scam instead of going along with it.'
        : 'You went along with the deal on the scammer’s terms.',
  });
  try {
    return await withTimeout(async (signal) => {
      const r = await fetch('/api/judge', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body), signal,
      });
      if (!r.ok) throw new Error(`judge ${r.status}`);
      const j = (await r.json()) as Partial<JudgeResponse>;
      if (j.outcome !== 'scammed' && j.outcome !== 'avoided') throw new Error('bad verdict');
      return {
        outcome: j.outcome,
        redFlagIdsNoticed: Array.isArray(j.redFlagIdsNoticed) ? j.redFlagIdsNoticed : [],
        reason: typeof j.reason === 'string' && j.reason.trim() ? j.reason : fallback().reason,
      };
    }, 12000);
  } catch {
    return fallback();
  }
}
