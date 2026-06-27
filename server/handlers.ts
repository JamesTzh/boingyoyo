import type { LlmProvider, ChatTurn } from './llm/provider';
import {
  basePersona, ARCHETYPE_SCRIPTS, FALLBACK_LINES, tracePrompt, type ArchetypeId,
} from './prompts';

export interface ChatRequest {
  archetypeId: ArchetypeId;
  theme: { brandName: string; currency: string };
  listing: { title: string; price: number; playerIsSeller?: boolean };
  history: { role: 'player' | 'seller'; text: string }[];
}
export interface ChatResponse { reply: string; viaFallback?: boolean }

export interface TraceRequest {
  archetypeId: ArchetypeId;
  outcome: 'defended' | 'scammed';
  transcript: { role: 'player' | 'seller'; text: string }[];
  signals: { turnsToResolve: number; unsafeTaps: number; softRiskyEngagements: number; redFlagsNoticed: number };
}
export interface TraceResponse { summaryLine: string; momentLine: string }

export function composeSellerMessages(body: ChatRequest): ChatTurn[] {
  const system = `${basePersona(body.theme, body.listing)}\n\n${ARCHETYPE_SCRIPTS[body.archetypeId]}`;
  const turns: ChatTurn[] = [{ role: 'system', content: system }];
  for (const m of body.history) {
    turns.push({ role: m.role === 'player' ? 'user' : 'assistant', content: m.text });
  }
  return turns;
}

export async function handleChat(provider: LlmProvider, body: ChatRequest): Promise<ChatResponse> {
  try {
    const reply = await provider.complete(composeSellerMessages(body), { temperature: 0.8, maxTokens: 220 });
    if (!reply) return { reply: FALLBACK_LINES[body.archetypeId], viaFallback: true };
    return { reply };
  } catch {
    return { reply: FALLBACK_LINES[body.archetypeId], viaFallback: true };
  }
}

export async function handleTrace(provider: LlmProvider, body: TraceRequest): Promise<TraceResponse> {
  const raw = await provider.complete([{ role: 'user', content: tracePrompt(body) }], { temperature: 0.4, maxTokens: 200 });
  const parsed = JSON.parse(extractJson(raw)) as TraceResponse;
  if (!parsed.summaryLine || !parsed.momentLine) throw new Error('incomplete trace JSON');
  return { summaryLine: parsed.summaryLine, momentLine: parsed.momentLine };
}

function extractJson(s: string): string {
  const start = s.indexOf('{');
  const end = s.lastIndexOf('}');
  if (start === -1 || end === -1) throw new Error('no JSON in response');
  return s.slice(start, end + 1);
}
