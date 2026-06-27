import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getProvider } from '../server/llm/factory.js';
import { handleTrace, type TraceRequest } from '../server/handlers.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'method not allowed' });
  try {
    res.json(await handleTrace(getProvider(), req.body as TraceRequest));
  } catch {
    res.status(503).json({ error: 'trace unavailable' }); // client falls back to template
  }
}
