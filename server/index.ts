import express from 'express';
import cors from 'cors';
import { getProvider } from './llm/factory';
import { handleChat, handleTrace, type ChatRequest, type TraceRequest } from './handlers';

const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (_req, res) => res.json({ ok: true }));

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

const port = Number(process.env.PORT ?? 8787);
app.listen(port, () => console.log(`[scam-school] proxy on :${port}`));
