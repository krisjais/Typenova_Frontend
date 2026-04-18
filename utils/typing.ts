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

const INTERMEDIATE_SENTENCES = [
  'The quick brown fox jumps over the lazy dog near the river bank.',
  'Practice makes perfect when you dedicate time every single day.',
  'Learning to type faster requires focus accuracy and consistency.',
  'She opened the window and felt the cool breeze on her face.',
  'The developer wrote clean code that was easy to read and maintain.',
  'Every great journey begins with a single determined step forward.',
  'The morning sun cast long shadows across the empty city streets.',
  'He carefully reviewed the document before submitting it online.',
  'Technology continues to reshape the way we communicate and work.',
  'The team worked together to solve the complex problem efficiently.',
];

const PRO_PARAGRAPHS = [
  'Asynchronous programming allows multiple operations to execute concurrently without blocking the main thread, significantly improving application performance and user experience in modern web development.',
  'The Byzantine Generals Problem illustrates the challenge of achieving consensus in distributed systems where some components may fail or act maliciously, forming the theoretical basis for blockchain technology.',
  'Quantum entanglement describes a phenomenon where two particles become correlated such that the quantum state of each cannot be described independently, regardless of the distance separating them.',
  'The Turing completeness of a computational system implies that it can simulate any Turing machine, meaning it can compute anything that is theoretically computable given sufficient time and memory.',
  'Polymorphism in object-oriented programming enables objects of different types to be treated as instances of the same base type, allowing for flexible and extensible software architecture design patterns.',
];

export function getTextForLevel(level: Level, count = 40): string {
  switch (level) {
    case 'beginner':
      return Array.from(
        { length: count },
        () => BEGINNER_WORDS[Math.floor(Math.random() * BEGINNER_WORDS.length)]
      ).join(' ');
    case 'intermediate':
      return INTERMEDIATE_SENTENCES[Math.floor(Math.random() * INTERMEDIATE_SENTENCES.length)];
    case 'pro':
      return PRO_PARAGRAPHS[Math.floor(Math.random() * PRO_PARAGRAPHS.length)];
  }
}

/** Generate practice text targeting weak keys */
export function generateWeakKeyPractice(weakKeys: string[]): string {
  if (!weakKeys.length) return getTextForLevel('beginner');
  const words = BEGINNER_WORDS.filter((w) => weakKeys.some((k) => w.includes(k)));
  const pool = words.length > 5 ? words : BEGINNER_WORDS;
  return Array.from({ length: 30 }, () => pool[Math.floor(Math.random() * pool.length)]).join(' ');
}

export function getRandomParagraph(): string {
  return INTERMEDIATE_SENTENCES[Math.floor(Math.random() * INTERMEDIATE_SENTENCES.length)];
}

export function getRandomWords(count = 40): string {
  return Array.from(
    { length: count },
    () => BEGINNER_WORDS[Math.floor(Math.random() * BEGINNER_WORDS.length)]
  ).join(' ');
}
