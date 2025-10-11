// server/server.mjs
import express from 'express';
import cors from 'cors';

// If you're on Node < 18, uncomment the next 2 lines:
// import fetch from 'node-fetch';
// globalThis.fetch = fetch;

const app = express();
app.use(cors());
app.use(express.json({ limit: '256kb' }));

// Simple health check
app.get('/health', (req, res) => res.json({ ok: true }));

// Model warmup endpoint to preload the model
app.post('/warmup', async (req, res) => {
  try {
    const OLLAMA_URL = process.env.OLLAMA_URL || 'http://127.0.0.1:11434';
    const MODEL = process.env.PRIORITY_MODEL || 'mistral';
    
    console.log(`[Server] Warming up model: ${MODEL}`);
    
    // Send a simple request to load the model
    const resp = await fetch(`${OLLAMA_URL}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: MODEL,
        prompt: 'Hello',
        stream: false,
      })
    });
    
    if (resp.ok) {
      console.log(`[Server] Model ${MODEL} warmed up successfully`);
      res.json({ status: 'warmed up' });
    } else {
      console.error(`[Server] Warmup failed: ${resp.status}`);
      res.status(502).json({ error: 'warmup failed' });
    }
  } catch (e) {
    console.error('[Server] Warmup error:', e.message || e);
    res.status(500).json({ error: 'warmup error' });
  }
});

app.post('/classify_task', async (req, res) => {
  const started = Date.now();
  try {
    const { text } = req.body || {};
    if (!text || !text.trim()) return res.status(400).json({ error: 'text required' });

    const OLLAMA_URL = process.env.OLLAMA_URL || 'http://127.0.0.1:11434';
    const MODEL = process.env.PRIORITY_MODEL || 'mistral';
    const timeoutMs = Number(process.env.OLLAMA_TIMEOUT_MS || 15000); // Increased to 15s

    const prompt = `
Classify the task as "high", "medium", or "low" priority.

Rules:
- High: urgent, time-sensitive, important, blocking, due soon.
- Medium: normal importance, not urgent.
- Low: optional, vague, "someday", non-urgent.

Return ONLY one word: high, medium, or low.

Task: "${text}"
`.trim();

    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), timeoutMs);

    console.log(`[Server] → Ollama (${MODEL}) classify: "${text}"`);
    const resp = await fetch(`${OLLAMA_URL}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: ctrl.signal,
      body: JSON.stringify({
        model: MODEL,
        prompt,
        stream: false,
        // You can tweak params below if desired:
        // options: { temperature: 0 }  // make it deterministic-ish
      })
    });
    clearTimeout(timer);

    if (!resp.ok) {
      const body = await resp.text().catch(() => '');
      console.error(`[Server] Ollama HTTP ${resp.status}: ${body}`);
      
      // Special handling for model loading errors
      if (resp.status === 500 && body.includes('loading model')) {
        return res.status(503).json({ 
          error: 'model still loading', 
          message: 'Please wait a moment and try again' 
        });
      }
      
      return res.status(502).json({ error: `ollama http ${resp.status}` });
    }

    const data = await resp.json().catch(() => ({}));
    // Ollama returns { response: "..." } when stream:false
    let out = String(data?.response ?? '').toLowerCase().trim();

    // Harden parsing
    if (out.includes('high')) out = 'high';
    else if (out.includes('medium')) out = 'medium';
    else if (out.includes('low')) out = 'low';
    else out = 'medium';

    console.log(`[Server] ← Ollama result: ${out} (${Date.now() - started}ms)`);

    return res.json({ priority: out });
  } catch (e) {
    console.error('[Server] classify_task failed:', e.message || e);
    
    // Special handling for timeout errors
    if (e.name === 'AbortError') {
      return res.status(408).json({ 
        error: 'request timeout', 
        message: 'Model is taking too long to respond. Please try again.' 
      });
    }
    
    return res.status(500).json({ error: 'classification failed' });
  }
});


const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Priority API running on :${PORT}`));
