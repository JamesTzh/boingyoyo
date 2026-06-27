import express from 'express';
import cors from 'cors';
import { getProvider } from './llm/factory';
import { handleChat, handleTrace, handleJudge, type ChatRequest, type TraceRequest, type JudgeRequest } from './handlers';

// The Express app with the /api routes only — shared by the local server
// (server/index.ts) and the Vercel serverless function (api/index.ts).
export const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));

// Reports whether live AI is configured (never exposes the key itself).
app.get('/api/health', (_req, res) =>
  res.json({ ok: Boolean(process.env.OPENAI_API_KEY), ai: Boolean(process.env.OPENAI_API_KEY), model: process.env.OPENAI_MODEL ?? 'gpt-4o-mini' }),
);

app.post('/api/chat', async (req, res) => {
  try {
    res.json(await handleChat(getProvider(), req.body as ChatRequest));
  } catch {
    res.status(500).json({ error: 'chat failed' });
  }
});

app.post('/api/trace', async (req, res) => {
  try {
    res.json(await handleTrace(getProvider(), req.body as TraceRequest));
  } catch {
    res.status(503).json({ error: 'trace unavailable' }); // client falls back to template
  }
});

app.post('/api/judge', async (req, res) => {
  try {
    res.json(await handleJudge(getProvider(), req.body as JudgeRequest));
  } catch {
    res.status(500).json({ error: 'judge failed' });
  }
});

export default app;
