import type { LlmProvider, ChatTurn } from './llm/provider';
import {
  basePersona, ARCHETYPE_SCRIPTS, FALLBACK_LINES, tracePrompt, judgePrompt, type ArchetypeId,
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
    const reply = await provider.complete(composeSellerMessages(body), { temperature: 0.85, maxTokens: 160 });
    if (!reply) return { reply: FALLBACK_LINES[body.archetypeId], viaFallback: true };
    return { reply };
  } catch (err) {
    // Log server-side (never exposes the key) so silent fallbacks are debuggable in prod.
    console.error('[scam-school] chat LLM error -> using fallback:', err instanceof Error ? err.message : err);
    return { reply: FALLBACK_LINES[body.archetypeId], viaFallback: true };
  }
}

export interface JudgeRequest {
  archetypeId: ArchetypeId;
  playerIsSeller?: boolean;
  finalAction: 'report' | 'offer';
  transcript: { role: 'player' | 'seller'; text: string }[];
  redFlags: { id: string; label: string }[];
}
export interface JudgeResponse {
  outcome: 'scammed' | 'avoided';
  redFlagIdsNoticed: string[];
  reason: string;
}

export async function handleJudge(provider: LlmProvider, body: JudgeRequest): Promise<JudgeResponse> {
  const validIds = new Set((body.redFlags ?? []).map((f) => f.id));
  const heuristic = (): 'scammed' | 'avoided' => (body.finalAction === 'report' ? 'avoided' : 'scammed');
  const defaultReason = (o: 'scammed' | 'avoided') =>
    o === 'scammed' ? "You went along with the scammer's demand." : 'You refused the unsafe request and stayed safe.';
  try {
    const raw = await provider.complete([{ role: 'user', content: judgePrompt(body) }], { temperature: 0.2, maxTokens: 220 });
    const parsed = JSON.parse(extractJson(raw)) as Partial<JudgeResponse>;
    const outcome = parsed.outcome === 'scammed' || parsed.outcome === 'avoided' ? parsed.outcome : heuristic();
    const redFlagIdsNoticed = Array.isArray(parsed.redFlagIdsNoticed)
      ? parsed.redFlagIdsNoticed.filter((id): id is string => typeof id === 'string' && validIds.has(id))
      : [];
    const reason = typeof parsed.reason === 'string' && parsed.reason.trim() ? parsed.reason.trim() : defaultReason(outcome);
    return { outcome, redFlagIdsNoticed, reason };
  } catch (err) {
    console.error('[scam-school] judge LLM error -> heuristic:', err instanceof Error ? err.message : err);
    const outcome = heuristic();
    return { outcome, redFlagIdsNoticed: [], reason: defaultReason(outcome) };
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
