import type { LlmProvider } from './provider';
import { createOpenAiProvider } from './openai';

let cached: LlmProvider | null = null;

export function getProvider(): LlmProvider {
  if (cached) return cached;
  const which = process.env.AI_PROVIDER ?? 'openai';
  switch (which) {
    case 'openai':
    default:
      cached = createOpenAiProvider();
  }
  return cached;
}
