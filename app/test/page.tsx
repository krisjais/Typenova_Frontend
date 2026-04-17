'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import TypingArea from '@/components/TypingArea';
import LevelUpToast from '@/components/LevelUpToast';
import { calcWPM, calcAccuracy, analyzeWeakKeys, getTextForLevel, LEVEL_THRESHOLDS, Level } from '@/utils/typing';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useLevel } from '@/context/LevelContext';
import { RotateCcw } from 'lucide-react';
import FontSizeControl, { useFontSize } from '@/components/FontSizeControl';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from 'recharts';

const TIME_OPTIONS = [15, 30, 60, 120];
const WORD_OPTIONS = [10, 25, 50, 100];
type TestMode = 'time' | 'words';

export default function TestPage() {
  const { user } = useAuth();
  const { level, checkAndPromote } = useLevel();
  const effectiveLevel: Level = level || 'intermediate';
  const { size: fontSize, increase, decrease } = useFontSize();

  const [mode, setMode] = useState<TestMode>('time');
  const [timeDuration, setTimeDuration] = useState(30);
  const [wordCount, setWordCount] = useState(25);
  const [text, setText] = useState('');
  const [typed, setTyped] = useState('');
  const [timeLeft, setTimeLeft] = useState(30);
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [wpmHistory, setWpmHistory] = useState<{ t: number; wpm: number }[]>([]);
  const [promotedTo, setPromotedTo] = useState<Level | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const elapsedRef = useRef(0);

  const elapsed = mode === 'time' ? timeDuration - timeLeft : elapsedRef.current;
  const typedChars = typed.split('');
  const correctChars = typedChars.filter((c, i) => c === text[i]).length;
  const wpm = calcWPM(correctChars, elapsed);
  const accuracy = calcAccuracy(correctChars, typed.length);
  const errors = typedChars.filter((c, i) => c !== text[i]).length;
  const isComplete = mode === 'words' && typed.length >= text.length;

  // Generate text
  const generateText = useCallback(() => {
    const count = mode === 'words' ? wordCount : 80;
    return getTextForLevel(effectiveLevel, count);
  }, [mode, wordCount, effectiveLevel]);

  useEffect(() => {
    reset();
  }, [mode, timeDuration, wordCount, effectiveLevel]);

  // Timer
  useEffect(() => {
    if (!started || finished) return;

    intervalRef.current = setInterval(() => {
      elapsedRef.current += 1;

      // Track WPM over time
      const currentCorrect = typed.split('').filter((c, i) => c === text[i]).length;
      const currentWpm = calcWPM(currentCorrect, elapsedRef.current);
      setWpmHistory((h) => [...h, { t: elapsedRef.current, wpm: currentWpm }]);

      if (mode === 'time') {
        setTimeLeft((t) => {
          if (t <= 1) {
            clearInterval(intervalRef.current!);
            setFinished(true);
            return 0;
          }
          return t - 1;
        });
      }
    }, 1000);

    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [started, finished]);

  // Words mode completion
  useEffect(() => {
    if (isComplete && !finished) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setFinished(true);
    }
  }, [isComplete]);

  // Save on finish
  useEffect(() => {
    if (!finished || !started) return;
    const analysis = analyzeWeakKeys(typed, text);
    if (user) {
      api.saveStats({
        wpm, accuracy, errors,
        mode: 'test',
        duration: mode === 'time' ? timeDuration : elapsedRef.current,
        weakKeys: Object.entries(analysis).map(([key, v]) => ({ key, ...v })),
      }).then(() => {
        api.getStats().then((d) => {
          const stats = (d as { stats: { wpm: number }[] }).stats || [];
          const promoted = checkAndPromote(stats.slice(-10).map((s) => s.wpm));
          if (promoted) setPromotedTo(promoted);
        }).catch(() => {});
      }).catch(console.error);
    }
  }, [finished]);

  // Tab to restart
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Tab') { e.preventDefault(); reset(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const handleType = useCallback((t: string) => {
    if (finished) return;
    if (!started) setStarted(true);
    setTyped(t);
  }, [started, finished]);

  const reset = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    elapsedRef.current = 0;
    setTimeLeft(timeDuration);
    setText(generateText());
    setTyped('');
    setStarted(false);
    setFinished(false);
    setWpmHistory([]);
  };

  const badge = level ? (level === 'beginner' ? '🌱' : level === 'intermediate' ? '⚡' : '🔥') : '';

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] px-4 fade-in">
      <div className="w-full max-w-3xl">

        {!finished ? (
          <>
            {/* Toolbar */}
            <div className="flex items-center justify-center gap-1 mb-10 flex-wrap">
              {/* Mode toggle */}
              <div className="flex rounded-lg overflow-hidden mr-3" style={{ background: 'rgba(255,255,255,0.06)' }}>
                {(['time', 'words'] as TestMode[]).map((m) => (
                  <button
                    key={m}
                    onClick={() => setMode(m)}
                    className="px-4 py-1.5 text-xs font-medium transition-all capitalize"
                    style={{
                      background: mode === m ? 'var(--color-accent)' : 'transparent',
                      color: mode === m ? '#fff' : 'var(--color-sub)',
                    }}
                  >
                    {m}
                  </button>
                ))}
              </div>

              {/* Options */}
              <div className="flex gap-1">
                {(mode === 'time' ? TIME_OPTIONS : WORD_OPTIONS).map((opt) => {
                  const active = mode === 'time' ? opt === timeDuration : opt === wordCount;
                  return (
                    <button
                      key={opt}
                      onClick={() => mode === 'time' ? setTimeDuration(opt) : setWordCount(opt)}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                      style={{
                        color: active ? 'var(--color-accent)' : 'var(--color-sub)',
                        background: active ? 'rgba(99,102,241,0.12)' : 'transparent',
                      }}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>

              {/* Level badge */}
              {badge && (
                <span className="ml-3 text-xs opacity-40">{badge} {level && LEVEL_THRESHOLDS[level].label}</span>
              )}

              {/* Font size */}
              <div className="ml-3">
                <FontSizeControl size={fontSize} increase={increase} decrease={decrease} />
              </div>
            </div>

            {/* Live stats */}
            <div className="flex justify-center gap-10 mb-6">
              <div className="text-center">
                <div className="text-4xl font-bold" style={{ color: 'var(--color-accent)' }}>
                  {started ? wpm : '—'}
                </div>
                <div className="text-xs mt-1" style={{ color: 'var(--color-sub)' }}>wpm</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold" style={{ color: started ? (accuracy >= 90 ? '#22c55e' : '#f59e0b') : 'var(--color-sub)' }}>
                  {started ? `${accuracy}%` : '—'}
                </div>
                <div className="text-xs mt-1" style={{ color: 'var(--color-sub)' }}>acc</div>
              </div>
              {mode === 'time' && (
                <div className="text-center">
                  <div className="text-4xl font-bold" style={{ color: timeLeft <= 5 ? '#ef4444' : 'var(--color-text)' }}>
                    {timeLeft}
                  </div>
                  <div className="text-xs mt-1" style={{ color: 'var(--color-sub)' }}>time</div>
                </div>
              )}
            </div>

            {/* Typing area */}
            <TypingArea text={text} typed={typed} onType={handleType} active={!finished} fontSize={fontSize} />

            {/* Restart hint */}
            <div className="flex justify-center mt-6">
              <button
                onClick={reset}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs transition-all opacity-30 hover:opacity-60"
                style={{ color: 'var(--color-text)' }}
                title="Tab to restart"
              >
                <RotateCcw size={13} />
                <span>tab — restart</span>
              </button>
            </div>
          </>
        ) : (
          /* ── Result Screen ── */
          <ResultScreen
            wpm={wpm}
            accuracy={accuracy}
            errors={errors}
            elapsed={mode === 'time' ? timeDuration : elapsedRef.current}
            correct={correctChars}
            wpmHistory={wpmHistory}
            mode={mode}
            onRetry={reset}
          />
        )}
      </div>

      {promotedTo && <LevelUpToast newLevel={promotedTo} onClose={() => setPromotedTo(null)} />}
    </div>
  );
}

// ── Result Screen Component ──────────────────────────────────────────────────
function ResultScreen({
  wpm, accuracy, errors, elapsed, correct, wpmHistory, mode, onRetry,
}: {
  wpm: number; accuracy: number; errors: number; elapsed: number;
  correct: number; wpmHistory: { t: number; wpm: number }[];
  mode: string; onRetry: () => void;
}) {
  return (
    <div className="slide-up">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'wpm', value: wpm, color: 'var(--color-accent)', big: true },
          { label: 'accuracy', value: `${accuracy}%`, color: accuracy >= 90 ? '#22c55e' : '#f59e0b', big: true },
          { label: 'correct', value: correct, color: '#22c55e', big: false },
          { label: 'errors', value: errors, color: errors === 0 ? '#22c55e' : '#ef4444', big: false },
          { label: 'time', value: `${elapsed}s`, color: 'var(--color-text)', big: false },
          { label: 'mode', value: mode, color: 'var(--color-sub)', big: false },
        ].map((s) => (
          <div key={s.label} className="p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <div className={`font-bold ${s.big ? 'text-4xl' : 'text-2xl'}`} style={{ color: s.color }}>{s.value}</div>
            <div className="text-xs mt-1 uppercase tracking-widest" style={{ color: 'var(--color-sub)' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* WPM over time chart */}
      {wpmHistory.length > 2 && (
        <div className="mb-8 p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <p className="text-xs mb-3 uppercase tracking-widest" style={{ color: 'var(--color-sub)' }}>wpm over time</p>
          <ResponsiveContainer width="100%" height={140}>
            <LineChart data={wpmHistory}>
              <XAxis dataKey="t" stroke="rgba(255,255,255,0.15)" tick={{ fontSize: 10 }} tickFormatter={(v) => `${v}s`} />
              <YAxis stroke="rgba(255,255,255,0.15)" tick={{ fontSize: 10 }} />
              <Tooltip
                contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 }}
                formatter={(v) => [`${v} wpm`]}
                labelFormatter={(l) => `${l}s`}
              />
              <Line type="monotone" dataKey="wpm" stroke="var(--color-accent)" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="flex justify-center gap-3">
        <button
          onClick={onRetry}
          className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition hover:opacity-90"
          style={{ background: 'var(--color-accent)', color: '#fff' }}
        >
          <RotateCcw size={14} /> Try Again
        </button>
      </div>
      <p className="text-center text-xs mt-3" style={{ color: 'var(--color-sub)' }}>tab — restart</p>
    </div>
  );
}
