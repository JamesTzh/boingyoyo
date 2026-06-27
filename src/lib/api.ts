import type { ChatRequest, ChatResponse, TraceRequest, TraceResponse, ArchetypeId } from './types';

const GENERIC_FALLBACK: Record<ArchetypeId, string> = {
  off_platform: 'so shall we just continue on WhatsApp? easier there',
  urgency_flash_sale: 'a few others are keen - can you pay now to lock it in?',
  deposit_before_meetup: 'lots of interest - send a deposit and i\'ll hold it for you',
  fake_payment_proof: 'i\'ve paid already, sent the screenshot - can you ship today?',
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
