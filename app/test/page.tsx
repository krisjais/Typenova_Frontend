'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TypingArea from '@/components/TypingArea';
import LevelUpToast from '@/components/LevelUpToast';
import { calcWPM, calcAccuracy, analyzeWeakKeys, getTextForLevel, LEVEL_THRESHOLDS, Level } from '@/utils/typing';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useLevel } from '@/context/LevelContext';
import { RotateCcw, Gauge, Keyboard as KeyboardIcon, Sprout, Zap, Flame, Hash, Clock, ArrowRight, Target, AlertTriangle, CheckCircle } from 'lucide-react';
import FontSizeControl, { useFontSize } from '@/components/FontSizeControl';
import LiveKeyboard from '@/components/LiveKeyboard';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from 'recharts';

const TIME_OPTIONS = [15, 30, 60, 120];
const WORD_OPTIONS = [10, 25, 50, 100];
type TestMode = 'time' | 'words';

const LEVEL_ICONS = { beginner: Sprout, intermediate: Zap, pro: Flame };
const LEVEL_COLORS = { beginner: '#34d399', intermediate: '#fbbf24', pro: '#f87171' };

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
  const [showKeyboard, setShowKeyboard] = useState(false);
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
    const count = mode === 'words' ? wordCount : 40;
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

  // Pause timer when switching tabs
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      } else {
        if (started && !finished && intervalRef.current === null) {
          intervalRef.current = setInterval(() => {
            elapsedRef.current += 1;
            const currentCorrect = typed.split('').filter((c, i) => c === text[i]).length;
            const currentWpm = calcWPM(currentCorrect, elapsedRef.current);
            setWpmHistory((h) => [...h, { t: elapsedRef.current, wpm: currentWpm }]);
            if (mode === 'time') {
              setTimeLeft((t) => {
                if (t <= 1) {
                  clearInterval(intervalRef.current!);
                  intervalRef.current = null;
                  setFinished(true);
                  return 0;
                }
                return t - 1;
              });
            }
          }, 1000);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [started, finished, mode, typed, text]);

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

  const LevelIcon = level ? LEVEL_ICONS[level] : null;
  const levelColor = level ? LEVEL_COLORS[level] : '';

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 pt-24 pb-12">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-3xl"
      >
        {!finished ? (
          <>
            {/* Toolbar */}
            <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
              {/* Mode toggle */}
              <div className="flex rounded-xl p-1 bg-[var(--color-surface)] border border-[var(--color-border)]">
                {(['time', 'words'] as TestMode[]).map((m) => (
                  <button
                    key={m}
                    onClick={() => setMode(m)}
                    className="relative px-4 py-2 text-[12px] font-semibold tracking-widest capitalize rounded-lg transition-all"
                    style={{
                      background: mode === m ? 'var(--color-accent)' : 'transparent',
                      color: mode === m ? '#fff' : 'var(--color-text-secondary)',
                    }}
                  >
                    <span className="flex items-center gap-1.5">
                      {m === 'time' ? <Clock size={13} /> : <Hash size={13} />}
                      {m}
                    </span>
                  </button>
                ))}
              </div>

              {/* Options */}
              <div className="flex rounded-xl p-1 bg-[var(--color-surface)] border border-[var(--color-border)] gap-1">
                {(mode === 'time' ? TIME_OPTIONS : WORD_OPTIONS).map((opt) => {
                  const isActive = mode === 'time' ? opt === timeDuration : opt === wordCount;
                  return (
                    <button
                      key={opt}
                      onClick={() => mode === 'time' ? setTimeDuration(opt) : setWordCount(opt)}
                      className="px-3 py-2 rounded-lg text-[12px] font-bold transition-all"
                      style={{
                        color: isActive ? 'var(--color-accent)' : 'var(--color-text-secondary)',
                        background: isActive ? 'var(--color-accent-muted)' : 'transparent',
                      }}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>

              {/* Level badge */}
              {LevelIcon && level && (
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)]">
                  <LevelIcon size={14} style={{ color: levelColor }} />
                  <span className="text-[12px] font-semibold tracking-widest uppercase text-[var(--color-text-secondary)]">
                    {LEVEL_THRESHOLDS[level].label}
                  </span>
                </div>
              )}

              {/* Font size */}
              <div className="flex items-center h-9 px-3 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)]">
                <FontSizeControl size={fontSize} increase={increase} decrease={decrease} />
              </div>
            </div>

            {/* Live stats */}
            <div className="flex justify-center items-center gap-8 mb-10">
              <StatInline label="WPM" value={started ? wpm : 0} active={started} color="var(--color-accent)" />
              <div className="w-px h-6 bg-[var(--color-border)]" />
              <StatInline
                label="ACC"
                value={started ? `${accuracy}%` : '0%'}
                active={started}
                color={started ? (accuracy >= 90 ? 'var(--color-success)' : 'var(--color-warning)') : 'var(--color-text-secondary)'}
              />
              {mode === 'time' && (
                <>
                  <div className="w-px h-6 bg-[var(--color-border)]" />
                  <StatInline
                    label="TIME"
                    value={timeLeft}
                    active={true}
                    color={timeLeft <= 5 ? 'var(--color-error)' : 'var(--color-text)'}
                  />
                </>
              )}
            </div>

            {/* Typing area */}
            <TypingArea text={text} typed={typed} onType={handleType} active={!finished} fontSize={fontSize} />

            {/* Controls */}
            <div className="flex items-center justify-center gap-4 mt-8">
              <button
                onClick={reset}
                className="flex items-center gap-2 text-[13px] text-[var(--color-text-secondary)] opacity-40 hover:opacity-70 transition-opacity"
              >
                <RotateCcw size={13} />
                <span>tab — restart</span>
              </button>
              <div className="w-px h-4 bg-[var(--color-border)]" />
              <button
                onClick={() => setShowKeyboard(!showKeyboard)}
                className="flex items-center gap-2 text-[13px] transition-opacity"
                style={{
                  color: showKeyboard ? 'var(--color-accent)' : 'var(--color-text-secondary)',
                  opacity: showKeyboard ? 1 : 0.4,
                }}
              >
                <KeyboardIcon size={13} />
                <span>{showKeyboard ? 'Hide' : 'Show'} Keyboard</span>
              </button>
            </div>

            {/* Collapsible Keyboard */}
            <AnimatePresence>
              {showKeyboard && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  className="overflow-hidden mt-6"
                >
                  <LiveKeyboard active={started} />
                </motion.div>
              )}
            </AnimatePresence>
          </>
        ) : (
          /* Result Screen */
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
      </motion.div>

      {promotedTo && <LevelUpToast newLevel={promotedTo} onClose={() => setPromotedTo(null)} />}
    </div>
  );
}

function StatInline({ label, value, active, color }: { label: string; value: string | number; active: boolean; color: string }) {
  return (
    <div className="flex items-baseline gap-2">
      <span
        className="text-2xl md:text-3xl font-bold tabular-nums tracking-tight transition-colors duration-300"
        style={{ color: active ? color : 'var(--color-text-secondary)', opacity: active ? 1 : 0.4 }}
      >
        {value}
      </span>
      <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-[var(--color-text-secondary)]">
        {label}
      </span>
    </div>
  );
}

// ── Result Screen ──────────────────────────────────────────────────────────────
function ResultScreen({
  wpm, accuracy, errors, elapsed, correct, wpmHistory, mode, onRetry,
}: {
  wpm: number; accuracy: number; errors: number; elapsed: number;
  correct: number; wpmHistory: { t: number; wpm: number }[];
  mode: string; onRetry: () => void;
}) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        onRetry();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onRetry]);

  const statItems = [
    { label: 'WPM', value: wpm, color: 'var(--color-accent)', icon: Gauge, big: true },
    { label: 'Accuracy', value: `${accuracy}%`, color: accuracy >= 90 ? 'var(--color-success)' : 'var(--color-warning)', icon: Target, big: true },
    { label: 'Correct', value: correct, color: 'var(--color-success)', icon: CheckCircle, big: false },
    { label: 'Errors', value: errors, color: errors === 0 ? 'var(--color-success)' : 'var(--color-error)', icon: AlertTriangle, big: false },
    { label: 'Time', value: `${elapsed}s`, color: 'var(--color-text)', icon: Clock, big: false },
    { label: 'Mode', value: mode, color: 'var(--color-text-secondary)', icon: Gauge, big: false },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
        {statItems.map((s) => (
          <div
            key={s.label}
            className="p-5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] transition-colors hover:bg-[var(--color-card)]"
          >
            <div className="flex items-center gap-2 mb-3">
              <s.icon size={14} style={{ color: s.color }} strokeWidth={1.8} />
              <span className="text-[11px] uppercase tracking-widest text-[var(--color-text-secondary)] font-semibold">{s.label}</span>
            </div>
            <div className={`font-bold ${s.big ? 'text-4xl' : 'text-2xl'}`} style={{ color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* WPM over time chart */}
      {wpmHistory.length > 2 && (
        <div className="mb-8 p-5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]">
          <p className="text-[12px] mb-4 uppercase tracking-widest text-[var(--color-text-secondary)] font-semibold">WPM over time</p>
          <ResponsiveContainer width="100%" height={140}>
            <LineChart data={wpmHistory}>
              <XAxis dataKey="t" stroke="rgba(255,255,255,0.1)" tick={{ fontSize: 10, fill: 'var(--color-text-secondary)' }} tickFormatter={(v) => `${v}s`} />
              <YAxis stroke="rgba(255,255,255,0.1)" tick={{ fontSize: 10, fill: 'var(--color-text-secondary)' }} />
              <Tooltip
                contentStyle={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 12, fontSize: 12, color: 'var(--color-text)' }}
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
          className="group flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-[14px] bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)] transition-colors shadow-sm"
        >
          <RotateCcw size={14} />
          Try Again
          <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>
      <p className="text-center text-[13px] mt-3 text-[var(--color-text-secondary)] opacity-50">tab — restart</p>
    </motion.div>
  );
}
