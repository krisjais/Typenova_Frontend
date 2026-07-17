'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TypingArea from '@/components/TypingArea';
import LevelUpToast from '@/components/LevelUpToast';
import { calcWPM, calcAccuracy, analyzeWeakKeys, getTextForLevel, generateWeakKeyPractice, LEVEL_THRESHOLDS, Level } from '@/utils/typing';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useLevel } from '@/context/LevelContext';
import { RotateCcw, Keyboard as KeyboardIcon, Sprout, Zap, Flame, ArrowRight } from 'lucide-react';
import FontSizeControl, { useFontSize } from '@/components/FontSizeControl';
import LiveKeyboard from '@/components/LiveKeyboard';

const LEVEL_ICONS = {
  beginner: Sprout,
  intermediate: Zap,
  pro: Flame,
};

const LEVEL_COLORS = {
  beginner: '#34d399',
  intermediate: '#fbbf24',
  pro: '#f87171',
};

export default function PracticePage() {
  const { user } = useAuth();
  const { level, checkAndPromote } = useLevel();
  const effectiveLevel: Level = level || 'beginner';
  const { size: fontSize, increase, decrease } = useFontSize();

  const [text, setText] = useState(() => getTextForLevel(effectiveLevel));
  const [typed, setTyped] = useState('');
  const [active, setActive] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [weakKeys, setWeakKeys] = useState<string[]>([]);
  const [saved, setSaved] = useState(false);
  const [promotedTo, setPromotedTo] = useState<Level | null>(null);
  const [showKeyboard, setShowKeyboard] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const initializeSession = useCallback(async (useWeakKeys = false) => {
    if (!user) {
      setText(useWeakKeys && weakKeys.length ? generateWeakKeyPractice(weakKeys) : getTextForLevel(effectiveLevel));
      return;
    }
    try {
      let customText = '';
      if (useWeakKeys && weakKeys.length) {
        customText = generateWeakKeyPractice(weakKeys);
      }
      const res: any = await api.startStatsSession({
        subtype: 'practice',
        language: 'English',
        difficulty: effectiveLevel.toUpperCase(),
        text: customText || undefined
      });
      setSessionId(res.sessionId);
      if (res.text) {
        setText(res.text);
      } else {
        setText(customText || getTextForLevel(effectiveLevel));
      }
    } catch (err) {
      console.error('Failed to start practice session:', err);
      setText(useWeakKeys && weakKeys.length ? generateWeakKeyPractice(weakKeys) : getTextForLevel(effectiveLevel));
    }
  }, [user, effectiveLevel, weakKeys]);

  useEffect(() => {
    reset();
  }, [effectiveLevel]);

  const typedChars = [...typed];
  const correctCount = typedChars.filter((c, i) => c === text[i]).length;
  const wpm = calcWPM(correctCount, elapsed);
  const accuracy = calcAccuracy(correctCount, typed.length);
  const errors = typedChars.filter((c, i) => c !== text[i]).length;
  const isComplete = typed.length >= text.length;

  // Stop timer when switching tabs
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      } else {
        if (active && !isComplete && intervalRef.current === null) {
          intervalRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [active, isComplete]);

  // Tab to restart
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Tab') { e.preventDefault(); reset(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  useEffect(() => {
    if (active && !isComplete) {
      intervalRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [active, isComplete]);

  useEffect(() => {
    if (isComplete && !saved) {
      setSaved(true);
      const analysis = analyzeWeakKeys(typed, text);
      const wk = Object.entries(analysis).filter(([, v]) => v.errorCount > 0).map(([k]) => k);
      setWeakKeys(wk);
      if (user && sessionId) {
        api.saveStats({
          sessionId,
          wpm, accuracy, errors, mode: 'practice', duration: elapsed,
          weakKeys: Object.entries(analysis).map(([key, v]) => ({ key, ...v })),
          text,
          consistency: 90
        }).then(() => {
          api.getStats().then((d) => {
            const stats = (d as { stats: { wpm: number }[] }).stats || [];
            const promoted = checkAndPromote(stats.slice(-10).map((s) => s.wpm));
            if (promoted) setPromotedTo(promoted);
          }).catch(() => {});
        }).catch(console.error);
      }
    }
  }, [isComplete, user, sessionId, wpm, accuracy, errors, elapsed, typed, text, checkAndPromote, saved]);

  const handleType = useCallback((t: string) => {
    if (!active) setActive(true);
    setTyped(t);
  }, [active]);

  const reset = (useWeakKeys = false) => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    initializeSession(useWeakKeys);
    setTyped('');
    setActive(false);
    setElapsed(0);
    setSaved(false);
  };

  // Enter to go Next
  useEffect(() => {
    if (!isComplete) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        reset(false);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  });

  const threshold = LEVEL_THRESHOLDS[effectiveLevel];
  const LevelIcon = LEVEL_ICONS[effectiveLevel];
  const levelColor = LEVEL_COLORS[effectiveLevel];

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 pt-24 pb-12">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-3xl"
      >
        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)]">
            <KeyboardIcon size={14} className="text-[var(--color-accent)]" />
            <span className="text-[12px] font-semibold tracking-widest uppercase text-[var(--color-accent)]">
              practice
            </span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)]">
            <LevelIcon size={14} style={{ color: levelColor }} />
            <span className="text-[12px] font-semibold tracking-widest uppercase text-[var(--color-text-secondary)]">
              {threshold.label}
            </span>
          </div>
          {effectiveLevel !== 'pro' && (
            <div className="flex items-center px-4 py-2 rounded-xl bg-[var(--color-accent-muted)] border border-[var(--color-accent)]/20">
              <span className="text-[12px] font-semibold tracking-widest uppercase text-[var(--color-accent)]">
                guided mode
              </span>
            </div>
          )}
          <div className="flex items-center h-9 px-3 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)]">
            <FontSizeControl size={fontSize} increase={increase} decrease={decrease} />
          </div>
        </div>

        {/* Live stats — inline horizontal */}
        <div className="flex justify-center items-center gap-8 mb-10">
          <StatInline label="WPM" value={active ? wpm : 0} active={active} color="var(--color-accent)" />
          <div className="w-px h-6 bg-[var(--color-border)]" />
          <StatInline
            label="ACC"
            value={active ? `${accuracy}%` : '0%'}
            active={active}
            color={active ? (accuracy >= 90 ? 'var(--color-success)' : 'var(--color-warning)') : 'var(--color-text-secondary)'}
          />
          <div className="w-px h-6 bg-[var(--color-border)]" />
          <StatInline label="TIME" value={`${elapsed}s`} active={elapsed > 0} color="var(--color-text)" />
        </div>

        {/* Typing area */}
        <TypingArea text={text} typed={typed} onType={handleType} active={!isComplete} practiceMode fontSize={fontSize} />

        {/* Complete banner */}
        <AnimatePresence>
          {isComplete && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="mt-8 p-6 rounded-2xl text-center border border-[var(--color-accent)]/20 bg-[var(--color-accent-muted)]"
            >
              <div className="flex items-center justify-center gap-6 mb-4">
                <div>
                  <div className="text-3xl font-bold text-[var(--color-accent)]">{wpm}</div>
                  <div className="text-[11px] uppercase tracking-widest text-[var(--color-text-secondary)] mt-1">WPM</div>
                </div>
                <div className="w-px h-10 bg-[var(--color-border)]" />
                <div>
                  <div className="text-3xl font-bold" style={{ color: accuracy >= 90 ? 'var(--color-success)' : 'var(--color-warning)' }}>
                    {accuracy}%
                  </div>
                  <div className="text-[11px] uppercase tracking-widest text-[var(--color-text-secondary)] mt-1">Accuracy</div>
                </div>
              </div>

              {weakKeys.length > 0 && (
                <div className="flex items-center justify-center gap-2 mb-5">
                  <span className="text-[12px] text-[var(--color-text-secondary)]">Weak keys:</span>
                  <div className="flex gap-1.5">
                    {weakKeys.map((k) => (
                      <span key={k} className="px-2 py-0.5 rounded-md text-[12px] font-mono font-semibold bg-[var(--color-error)]/10 text-[var(--color-error)] border border-[var(--color-error)]/20">
                        {k}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-center gap-3">
                <button
                  onClick={() => reset(false)}
                  className="group inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-semibold bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)] transition-colors shadow-sm"
                >
                  Next
                  <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
                </button>
                {weakKeys.length > 0 && (
                  <button
                    onClick={() => reset(true)}
                    className="px-5 py-2.5 rounded-xl text-[13px] font-semibold border border-[var(--color-border)] text-[var(--color-text)] hover:bg-white/[0.04] transition-colors"
                  >
                    Practice Weak Keys
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Keyboard toggle + restart */}
        {!isComplete && (
          <div className="flex items-center justify-center gap-4 mt-8">
            <button
              onClick={() => reset(false)}
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
        )}

        {/* Collapsible Keyboard */}
        <AnimatePresence>
          {showKeyboard && !isComplete && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden mt-6"
            >
              <LiveKeyboard active={active} />
            </motion.div>
          )}
        </AnimatePresence>
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
