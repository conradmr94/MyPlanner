// src/nlp/priority.js
import { getUserCues } from './userCues';

// Configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

let chrono = null;

// Initialize chrono if available
(async () => {
  try {
    const chronoModule = await import('chrono-node');
    chrono = chronoModule.default || chronoModule;
  } catch {
    chrono = null;
  }
})();

// Main exported function now async so we can call the server
export async function derivePriority(rawText, now = new Date()) {
  const text = (rawText || '').trim();

  // 1️⃣ Try Ollama-backed classification via your backend
  try {
    const res = await fetch(`${API_BASE_URL}/classify_task`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    });

    if (res.ok) {
      const { priority } = await res.json();
      const scoreMap = { high: 0.9, medium: 0.5, low: 0.1 };
      return {
        cleanText: text,
        due: null,
        signals: { hits: [], minutes: null, hoursToDue: null },
        score: scoreMap[priority] ?? 0.5,
        label: priority,
        rationale: `LLM classification: ${priority}`
      };
    } else {
      const errorData = await res.json().catch(() => ({}));
      
      // Handle specific error cases
      if (res.status === 503 && errorData.error === 'model still loading') {
        console.warn('Model is still loading, please wait...');
        return null; // Will trigger fallback
      } else if (res.status === 408 && errorData.error === 'request timeout') {
        console.warn('Request timed out, model may be busy');
        return null; // Will trigger fallback
      } else {
        console.warn(`API returned ${res.status}: ${res.statusText}`, errorData);
      }
    }
  } catch (err) {
    console.warn('Ollama classification failed:', err.message);
  }

  // 2️⃣ Fallback: use local scoring
  return localDerivePriority(rawText, now);
}

// ---------------- LOCAL SCORING LOGIC (unchanged) ----------------
function localDerivePriority(rawText, now = new Date()) {
  const text = (rawText || '').trim();
  const cleaned = text.replace(/\s+/g, ' ');
  const lower = cleaned.toLowerCase();

  // --- Built-in cues -------------------------------------------------------
  const builtin = [
    { rx: /\b(asap|urgent|immediately|right away|now)\b/i, w: 0.45, tag: 'urgent_keyword' },
    { rx: /\b(important|priority|critical|high(-|\s*)prio)\b/i, w: 0.35, tag: 'importance' },
    { rx: /\b(eod|end of day|by tonight|tonight)\b/i, w: 0.35, tag: 'eod' },
    { rx: /\b(tomorrow|tmr|tmrw)\b/i, w: 0.25, tag: 'tomorrow' },
    { rx: /\b(this (morning|afternoon|evening))\b/i, w: 0.25, tag: 'same_day' },
    { rx: /!!+|🔥|⚠️|❗/i, w: 0.20, tag: 'punct_emphasis' },
    { rx: /\b(maybe|someday|later|nice to have)\b/i, w: -0.35, tag: 'deemphasis' },
    { rx: /\b(low\s*prio|low priority)\b/i, w: -0.45, tag: 'lowprio' },
  ];

  // --- User-defined cues ---------------------------------------------------
  const userCues = getUserCues().map(c => ({
    rx: new RegExp(`\\b${escapeRegex(c.phrase)}\\b`, 'i'),
    w: Number(c.w) || 0,
    tag: `user:${c.phrase.toLowerCase()}`
  }));

  const cues = [...builtin, ...userCues];

  // Lexical score
  const hits = [];
  let lexicalScore = 0;
  for (const c of cues) {
    if (c.rx.test(lower)) {
      hits.push(c.tag);
      lexicalScore += c.w;
    }
  }

  // Duration nudge
  const durationRx = /\b((\d+)\s*(min|mins|minutes|m|hour|hours|h))\b/;
  const durMatch = lower.match(durationRx);
  let minutes = null;
  if (durMatch) {
    const n = parseInt(durMatch[2], 10);
    const unit = durMatch[3];
    minutes = /h/.test(unit) ? n * 60 : n;
  }
  if (minutes != null) {
    if (minutes <= 10) lexicalScore -= 0.05;
    else if (minutes <= 30) lexicalScore -= 0.025;
  }

  // Due date parsing
  let due = null;
  if (chrono) {
    const parsed = chrono.parse(cleaned, now, { forwardDate: true });
    if (parsed?.length) {
      due = parsed
        .map(p => p.start?.date?.() ?? null)
        .filter(Boolean)
        .sort((a, b) => a - b)[0] || null;
    }
  } else {
    if (/\btoday\b/i.test(lower)) due = endOfDay(now);
    else if (/\b(tomorrow|tmr|tmrw)\b/i.test(lower)) due = endOfDay(addDays(now, 1));
    else if (/\bnext week\b/i.test(lower)) due = endOfDay(addDays(now, 7));
  }

  // Treat "immediately" as a near-term due date
  const immediateRx = /\b(asap|immediately|right away|now|today|urgent|critical|high(-|\s*)prio)\b/i;
  if (!due && immediateRx.test(lower)) {
    due = new Date(now.getTime() + 60 * 60 * 1000); // now + 1 hour
  }

  // Due proximity score
  let dueScore = 0;
  let hoursToDue = null;
  if (due) {
    hoursToDue = Math.max(0, (due - now) / (1000 * 60 * 60));
    dueScore = 0.8 * Math.exp(-hoursToDue / 36);
  }

  // Combine
  let score = clamp(dueScore + lexicalScore, 0, 1);
  let label = scoreToLabel(score);

  // Respect explicit de-emphasis unless due is soon
  if (hits.some(h => h.includes('lowprio') || h.includes('deemphasis'))) {
    if (!due || (hoursToDue != null && hoursToDue > 24)) {
      label = 'low';
      score = Math.min(score, 0.33);
    }
  }

  const reasons = [];
  if (due) {
    if (hoursToDue <= 1) reasons.push('due ~now');
    else if (hoursToDue <= 24) reasons.push('due within a day');
    else if (hoursToDue <= 72) reasons.push('due in a few days');
    else reasons.push('has a due date');
  } else {
    reasons.push('no due date');
  }
  if (hits.length) reasons.push(`urgency cues: ${hits.join(', ')}`);
  if (minutes != null) reasons.push(`estimated ${minutes} min`);

  return {
    cleanText: cleaned,
    due,
    signals: { hits, minutes, hoursToDue },
    score,
    label,
    rationale: reasons.join(' · ')
  };
}

// helpers
function clamp(x, a, b) { return Math.max(a, Math.min(b, x)); }
function scoreToLabel(s) { return s >= 0.66 ? 'high' : s >= 0.33 ? 'medium' : 'low'; }
function endOfDay(d) { const x = new Date(d); x.setHours(23,59,59,999); return x; }
function addDays(d, n) { const x = new Date(d); x.setDate(x.getDate()+n); return x; }
function escapeRegex(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
