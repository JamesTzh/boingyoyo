import OpenAI from 'openai';
import type { LlmProvider, ChatTurn } from './provider';

export function createOpenAiProvider(): LlmProvider {
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const model = process.env.OPENAI_MODEL ?? 'gpt-4o-mini';
  return {
    async complete(messages: ChatTurn[], opts) {
      const res = await client.chat.completions.create({
        model,
        messages,
        temperature: opts?.temperature ?? 0.8,
        max_tokens: opts?.maxTokens ?? 220,
      });
      return res.choices[0]?.message?.content?.trim() ?? '';
    },
  };
}
