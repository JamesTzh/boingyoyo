import 'dotenv/config'; // load .env before anything reads process.env
import path from 'node:path';
import fs from 'node:fs';
import express from 'express';
import cors from 'cors';
import { getProvider } from './llm/factory';
import { handleChat, handleTrace, handleJudge, type ChatRequest, type TraceRequest, type JudgeRequest } from './handlers';

const aiReady = Boolean(process.env.OPENAI_API_KEY);
if (!aiReady) {
  console.warn(
    '[scam-school] ⚠  OPENAI_API_KEY is not set — sellers will use canned fallback lines.\n' +
      '             Add it to .env (copy .env.example) to enable live GPT replies.',
  );
}

const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));

// Reports whether live AI is configured (never exposes the key itself).
app.get('/api/health', (_req, res) => res.json({ ok: true, ai: aiReady, model: process.env.OPENAI_MODEL ?? 'gpt-4o-mini' }));

app.post('/api/chat', async (req, res) => {
  try {
    const out = await handleChat(getProvider(), req.body as ChatRequest);
    res.json(out);
  } catch {
    res.status(500).json({ error: 'chat failed' });
  }
});

app.post('/api/trace', async (req, res) => {
  try {
    const out = await handleTrace(getProvider(), req.body as TraceRequest);
    res.json(out);
  } catch {
    res.status(503).json({ error: 'trace unavailable' }); // client falls back to template
  }
});

app.post('/api/judge', async (req, res) => {
  try {
    const out = await handleJudge(getProvider(), req.body as JudgeRequest);
    res.json(out);
  } catch {
    res.status(500).json({ error: 'judge failed' });
  }
});

// In production, serve the built client from this same process so the app and
// its /api routes share one origin — no separate proxy needed. No-op in dev
// (Vite serves the client and proxies /api here).
const distDir = path.resolve(process.cwd(), 'dist');
if (fs.existsSync(distDir)) {
  app.use(express.static(distDir));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(distDir, 'index.html'));
  });
}

const port = Number(process.env.PORT ?? 8787);
app.listen(port, () => console.log(`[scam-school] server on :${port} (ai=${aiReady})`));
