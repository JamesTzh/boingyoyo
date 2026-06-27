import type { VercelRequest, VercelResponse } from '@vercel/node';

// Confirms whether the OpenAI key is configured (without ever exposing it).
export default function handler(_req: VercelRequest, res: VercelResponse) {
  const ai = Boolean(process.env.OPENAI_API_KEY);
  res.json({ ok: true, ai, model: process.env.OPENAI_MODEL ?? 'gpt-4o-mini' });
}
