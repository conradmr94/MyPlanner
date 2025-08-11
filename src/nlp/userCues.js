// src/nlp/userCues.js
const LS_KEY = 'myplanner.userCues.v1';

// Map the user's intent to a sensible weight.
// Tweak these if you want the nudge stronger/weaker.
const LEVEL_TO_WEIGHT = {
  high:   0.66,
  medium: 0.00,
  low:   -0.66,
};

const WEIGHT_TO_LEVEL = (w) => {
  if (typeof w !== 'number') return 'medium';
  if (w >= 0.3) return 'high';
  if (w <= -0.3) return 'low';
  return 'medium';
};

export function getUserCues() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    // Migrate old shape { phrase, w } → { phrase, level }
    const normalized = parsed.map((c) => {
      if (!c || typeof c.phrase !== 'string') return null;
      const phrase = c.phrase.trim();
      if (!phrase) return null;

      let level = c.level;
      if (!level && typeof c.w === 'number') {
        level = WEIGHT_TO_LEVEL(c.w);
      }
      if (!['high', 'medium', 'low'].includes(level)) level = 'medium';

      return { phrase, level, w: LEVEL_TO_WEIGHT[level] };
    }).filter(Boolean);

    return normalized;
  } catch {
    return [];
  }
}

export function saveUserCues(cues) {
  const cleaned = (Array.isArray(cues) ? cues : [])
    .map((c) => {
      if (!c || typeof c.phrase !== 'string') return null;
      const phrase = c.phrase.trim();
      if (!phrase) return null;

      const level = (c.level || '').toLowerCase();
      const safeLevel = ['high','medium','low'].includes(level) ? level : 'medium';
      return { phrase, level: safeLevel };
    })
    .filter(Boolean);

  localStorage.setItem(LS_KEY, JSON.stringify(cleaned));

  // Return with computed weights for callers that expect w
  return cleaned.map(c => ({ ...c, w: LEVEL_TO_WEIGHT[c.level] }));
}

export function addUserCue(phrase, level = 'medium') {
  const cues = getUserCues().map(({ phrase, level }) => ({ phrase, level })); // drop computed w
  const p = String(phrase || '').trim();
  if (!p) return saveUserCues(cues);
  const lvl = ['high','medium','low'].includes(level) ? level : 'medium';

  const idx = cues.findIndex(c => c.phrase.toLowerCase() === p.toLowerCase());
  if (idx >= 0) cues[idx] = { phrase: p, level: lvl };
  else cues.push({ phrase: p, level: lvl });

  return saveUserCues(cues);
}

export function removeUserCue(phrase) {
  const p = String(phrase || '').trim().toLowerCase();
  const cues = getUserCues()
    .map(({ phrase, level }) => ({ phrase, level }))
    .filter(c => c.phrase.toLowerCase() !== p);
  return saveUserCues(cues);
}
