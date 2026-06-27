import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getProvider } from '../server/llm/factory';
import { handleChat, type ChatRequest } from '../server/handlers';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'method not allowed' });
  try {
    res.json(await handleChat(getProvider(), req.body as ChatRequest));
  } catch {
    res.status(500).json({ error: 'chat failed' });
  }
}
