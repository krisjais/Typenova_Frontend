export type Level = 'beginner' | 'intermediate' | 'pro';

/** Calculate WPM: (correct chars / 5) / minutes elapsed */
export function calcWPM(correctChars: number, elapsedSeconds: number): number {
  if (elapsedSeconds <= 0) return 0;
  return Math.round(correctChars / 5 / (elapsedSeconds / 60));
}

/** Calculate accuracy percentage */
export function calcAccuracy(correct: number, total: number): number {
  if (total === 0) return 100;
  return Math.round((correct / total) * 100);
}

/** Analyse which keys were typed incorrectly */
export function analyzeWeakKeys(
  typed: string,
  target: string
): Record<string, { errorCount: number; totalCount: number }> {
  const map: Record<string, { errorCount: number; totalCount: number }> = {};
  const len = Math.min(typed.length, target.length);
  for (let i = 0; i < len; i++) {
    const key = target[i];
    if (!map[key]) map[key] = { errorCount: 0, totalCount: 0 };
    map[key].totalCount++;
    if (typed[i] !== target[i]) map[key].errorCount++;
  }
  return map;
}

// ─── Level thresholds ────────────────────────────────────────────────────────
export const LEVEL_THRESHOLDS = {
  beginner: { promote: 40, label: 'Beginner', next: 'intermediate' as Level },
  intermediate: { promote: 70, label: 'Intermediate', next: 'pro' as Level },
  pro: { promote: Infinity, label: 'Pro', next: null },
};

/** Check if user should be promoted based on recent avg WPM */
export function checkPromotion(level: Level, recentWpms: number[]): Level | null {
  if (level === 'pro') return null;
  if (recentWpms.length < 3) return null; // need at least 3 sessions
  const avg = recentWpms.slice(-5).reduce((a, b) => a + b, 0) / Math.min(recentWpms.length, 5);
  const threshold = LEVEL_THRESHOLDS[level].promote;
  if (avg >= threshold) return LEVEL_THRESHOLDS[level].next;
  return null;
}

// ─── Level-based content ─────────────────────────────────────────────────────

// Keybr-inspired algorithm for Beginners. Uses primarily the easiest physiological keys:
// e, n, i, t, r, l, s, a, o, h. These keep the fingers anchored on the home row 
// and the most natural index/middle finger extensions.
const BEGINNER_WORDS = [
  'the', 'that', 'this', 'there', 'these', 'those', 'then', 'than',
  'she', 'her', 'here', 'hero', 'hear', 'heart', 'heat', 'hate',
  'see', 'seen', 'seat', 'sit', 'sat', 'set', 'star', 'start', 'stare', 'store', 'stone',
  'are', 'art', 'area', 'arise', 'arose', 'air', 'ear', 'eat', 'era', 'east', 'earn',
  'one', 'on', 'ort', 'our', 'other', 'into', 'onto',
  'in', 'is', 'it', 'its', 'iron', 'ire', 'inner', 'insert',
  'not', 'no', 'nor', 'none', 'nest', 'near', 'neat', 'net', 'note', 'noise',
  'to', 'too', 'ten', 'tent', 'test', 'tear', 'treat', 'tree', 'trail', 'train', 'tail', 'tall',
  'rest', 'rent', 'rear', 'roar', 'roast', 'rate', 'rain', 'rail', 'real', 'reason',
  'let', 'lane', 'lean', 'learn', 'lent', 'least', 'last', 'late', 'later', 'lion', 'line',
  'share', 'shoe', 'shine', 'shirt', 'short', 'shore', 'sheet', 'shoot',
  'hair', 'hall', 'halt', 'heal', 'health', 'hole', 'horn', 'host', 'hotel', 'house',
  // Muscle-memory rhythmic builder words
  'lesson', 'listen', 'silent', 'season', 'sensor', 'senior', 'serial',
  'tailor', 'sailor', 'nation', 'ration', 'station', 'relation', 'rotten', 'letter',
  'settle', 'little', 'title', 'total', 'treatise', 'retain', 'retire', 'entire'
];

const INTERMEDIATE_WORDS = [
  // Expands to the entire core keyboard, adding reaches like: d, u, c, y, p, m, g, b, w, k, f, v
  'public', 'become', 'game', 'much', 'found', 'black', 'could', 'would', 'quick',
  'people', 'place', 'water', 'write', 'board', 'word', 'work', 'part', 'place',
  'made', 'make', 'like', 'look', 'time', 'more', 'some', 'come', 'number', 'sound',
  'most', 'know', 'over', 'down', 'only', 'very', 'good', 'think', 'after', 'thing',
  'great', 'where', 'help', 'through', 'much', 'before', 'line', 'right', 'means',
  'old', 'any', 'same', 'tell', 'boy', 'follow', 'came', 'want', 'show', 'also',
  'form', 'three', 'small', 'set', 'put', 'end', 'does', 'another', 'well', 'large',
  'must', 'big', 'even', 'such', 'because', 'turn', 'here', 'why', 'ask', 'went',
  // Specific words to drill new keys heavily:
  'copy', 'camp', 'away', 'company', 'page', 'power', 'perhaps', 'pace', 'pick',
  'way', 'play', 'away', 'always', 'today', 'say', 'may', 'day', 'system', 'type'
];

const PRO_WORDS = [
  // The gauntlet: Full alphabet (specifically targeting z, x, j, q), advanced tech words, and tough patterns
  'javascript', 'function', 'object', 'array', 'string', 'boolean', 'undefined',
  'promise', 'async', 'await', 'component', 'interface', 'variable', 'dynamic',
  'export', 'import', 'default', 'return', 'console', 'window', 'document',
  'execute', 'query', 'syntax', 'context', 'module', 'package', 'version',
  'project', 'equal', 'require', 'complex', 'quality', 'example', 'zero',
  'analyze', 'maximize', 'optimize', 'visualize', 'recognize', 'organize',
  'subject', 'reject', 'inject', 'adjust', 'justify', 'judge', 'major', 'majority',
  'objective', 'subjective', 'quick', 'quiet', 'quite', 'query', 'queue', 'unique',
  'acquire', 'expect', 'except', 'explain', 'experience', 'experiment', 'explore',
  'extend', 'exact', 'examine', 'exist', 'exit', 'index', 'matrix', 'pixel', 'proxy'
];

export function getTextForLevel(level: Level, count = 25): string {
  let pool: string[];
  switch (level) {
    case 'beginner':
      pool = BEGINNER_WORDS;
      break;
    case 'intermediate':
      pool = INTERMEDIATE_WORDS;
      break;
    case 'pro':
      pool = PRO_WORDS;
      break;
  }
  
  return Array.from(
    { length: count },
    () => pool[Math.floor(Math.random() * pool.length)]
  ).join(' ');
}

/** Generate practice text targeting weak keys */
export function generateWeakKeyPractice(weakKeys: string[]): string {
  if (!weakKeys.length) return getTextForLevel('beginner');
  const words = BEGINNER_WORDS.filter((w) => weakKeys.some((k) => w.includes(k)));
  const pool = words.length > 5 ? words : BEGINNER_WORDS;
  return Array.from({ length: 20 }, () => pool[Math.floor(Math.random() * pool.length)]).join(' ');
}

export function getRandomParagraph(): string {
  return Array.from(
    { length: 20 },
    () => INTERMEDIATE_WORDS[Math.floor(Math.random() * INTERMEDIATE_WORDS.length)]
  ).join(' ');
}

export function getRandomWords(count = 40): string {
  return Array.from(
    { length: count },
    () => BEGINNER_WORDS[Math.floor(Math.random() * BEGINNER_WORDS.length)]
  ).join(' ');
}
