import 'dotenv/config'; // load .env before anything reads process.env
import path from 'node:path';
import fs from 'node:fs';
import express from 'express';
import app from './app';

// Local / single-service entry point. (On Vercel, api/index.ts uses the same
// app as a serverless function and the static client is served by the CDN.)

if (!process.env.OPENAI_API_KEY) {
  console.warn(
    '[scam-school] ⚠  OPENAI_API_KEY is not set — sellers will use canned fallback lines.\n' +
      '             Add it to .env (copy .env.example) to enable live GPT replies.',
  );
}

// In production (npm run build && npm run server) serve the built client from
// this same process so the app and its /api routes share one origin.
const distDir = path.resolve(process.cwd(), 'dist');
if (fs.existsSync(distDir)) {
  app.use(express.static(distDir));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(distDir, 'index.html'));
  });
}

const port = Number(process.env.PORT ?? 8787);
app.listen(port, () => console.log(`[scam-school] server on :${port} (ai=${Boolean(process.env.OPENAI_API_KEY)})`));
