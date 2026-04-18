'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import TypingArea from '@/components/TypingArea';
import LevelUpToast from '@/components/LevelUpToast';
import { calcWPM, calcAccuracy, analyzeWeakKeys, getTextForLevel, generateWeakKeyPractice, LEVEL_THRESHOLDS, Level } from '@/utils/typing';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useLevel } from '@/context/LevelContext';
import { RotateCcw } from 'lucide-react';
import FontSizeControl, { useFontSize } from '@/components/FontSizeControl';
import LiveKeyboard from '@/components/LiveKeyboard';

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
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    reset();
  }, [effectiveLevel]);

  // Tab to restart
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Tab') { e.preventDefault(); reset(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const typedChars = [...typed];
  const correctCount = typedChars.filter((c, i) => c === text[i]).length;
  const wpm = calcWPM(correctCount, elapsed);
  const accuracy = calcAccuracy(correctCount, typed.length);
  const errors = typedChars.filter((c, i) => c !== text[i]).length;
  const isComplete = typed.length >= text.length;

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
      if (user) {
        api.saveStats({
          wpm, accuracy, errors, mode: 'practice', duration: elapsed,
          weakKeys: Object.entries(analysis).map(([key, v]) => ({ key, ...v })),
        }).then(() => {
          api.getStats().then((d) => {
            const stats = (d as { stats: { wpm: number }[] }).stats || [];
            const promoted = checkAndPromote(stats.slice(-10).map((s) => s.wpm));
            if (promoted) setPromotedTo(promoted);
          }).catch(() => {});
        }).catch(console.error);
      }
    }
  }, [isComplete]);

  const handleType = useCallback((t: string) => {
    if (!active) setActive(true);
    setTyped(t);
  }, [active]);

  const reset = (useWeakKeys = false) => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setText(useWeakKeys && weakKeys.length ? generateWeakKeyPractice(weakKeys) : getTextForLevel(effectiveLevel));
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
  const badge = effectiveLevel === 'beginner' ? '🌱' : effectiveLevel === 'intermediate' ? '⚡' : '🔥';

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] px-4 fade-in">
      <div className="w-full max-w-3xl">

        {/* Header / Toolbar */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
          <div className="flex items-center px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm shadow-sm hover:bg-white/10 transition-colors">
            <span className="text-[11px] font-semibold tracking-widest uppercase" style={{ color: 'var(--color-accent)' }}>practice</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm shadow-sm hover:bg-white/10 transition-colors">
            <span className="text-[12px]">{badge}</span>
            <span className="text-[11px] font-semibold tracking-widest uppercase opacity-80" style={{ color: 'var(--color-text)' }}>{threshold.label}</span>
          </div>
          {effectiveLevel !== 'pro' && (
            <div className="flex items-center px-4 py-1.5 rounded-full backdrop-blur-sm shadow-sm transition-colors"
                 style={{ background: 'rgba(var(--color-accent-rgb), 0.1)', border: '1px solid rgba(var(--color-accent-rgb), 0.2)' }}>
              <span className="text-[11px] font-semibold tracking-widest uppercase" style={{ color: 'var(--color-accent)' }}>guided mode</span>
            </div>
          )}
          <div className="flex items-center h-[34px] px-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm shadow-sm">
            <FontSizeControl size={fontSize} increase={increase} decrease={decrease} />
          </div>
        </div>

        {/* Live stats */}
        <div className="flex justify-center gap-3 sm:gap-6 mb-10">
          <div className="flex flex-col items-center justify-center w-[90px] sm:w-[110px] h-[75px] sm:h-[85px] rounded-2xl bg-black/20 border border-white/5 backdrop-blur-md shadow-lg transition-transform hover:scale-105 duration-200"
               style={{ borderBottom: active ? '2px solid var(--color-accent)' : '1px solid rgba(255,255,255,0.05)' }}>
            <div className="text-2xl sm:text-3xl font-bold font-mono tracking-tight" style={{ color: active ? 'var(--color-accent)' : 'var(--color-sub)' }}>
              {active ? wpm : '0'}
            </div>
            <div className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.2em] mt-1" style={{ color: 'var(--color-sub)' }}>wpm</div>
          </div>
          
          <div className="flex flex-col items-center justify-center w-[90px] sm:w-[110px] h-[75px] sm:h-[85px] rounded-2xl bg-black/20 border border-white/5 backdrop-blur-md shadow-lg transition-transform hover:scale-105 duration-200"
               style={{ borderBottom: active && accuracy >= 90 ? '2px solid #22c55e' : active && accuracy < 90 ? '2px solid #f59e0b' : '1px solid rgba(255,255,255,0.05)' }}>
            <div className="text-2xl sm:text-3xl font-bold font-mono tracking-tight" style={{ color: active ? (accuracy >= 90 ? '#22c55e' : '#f59e0b') : 'var(--color-sub)' }}>
              {active ? `${accuracy}%` : '0%'}
            </div>
            <div className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.2em] mt-1" style={{ color: 'var(--color-sub)' }}>acc</div>
          </div>
          
          <div className="flex flex-col items-center justify-center w-[90px] sm:w-[110px] h-[75px] sm:h-[85px] rounded-2xl bg-black/20 border border-white/5 backdrop-blur-md shadow-lg transition-transform hover:scale-105 duration-200"
               style={{ borderBottom: elapsed > 0 ? '2px solid var(--color-sub)' : '1px solid rgba(255,255,255,0.05)' }}>
            <div className="text-2xl sm:text-3xl font-bold font-mono tracking-tight" style={{ color: elapsed > 0 ? 'var(--color-text)' : 'var(--color-sub)' }}>
              {elapsed}s
            </div>
            <div className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.2em] mt-1" style={{ color: 'var(--color-sub)' }}>time</div>
          </div>
        </div>

        {/* Typing area */}
        <TypingArea text={text} typed={typed} onType={handleType} active={!isComplete} practiceMode fontSize={fontSize} />

        {/* Complete banner */}
        {isComplete && (
          <div className="mt-6 p-4 rounded-xl text-center slide-up" style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)' }}>
            <p className="font-semibold text-sm mb-1" style={{ color: 'var(--color-accent)' }}>
              {wpm} wpm · {accuracy}% accuracy
            </p>
            {weakKeys.length > 0 && (
              <p className="text-xs mb-3" style={{ color: 'var(--color-sub)' }}>
                weak keys: <span className="font-mono text-red-400">{weakKeys.join(' ')}</span>
              </p>
            )}
            <div className="flex justify-center gap-2">
              <button
                onClick={() => reset(false)}
                className="px-4 py-2 rounded-lg text-xs font-semibold transition hover:opacity-90"
                style={{ background: 'var(--color-accent)', color: '#fff' }}
              >
                Next
              </button>
              {weakKeys.length > 0 && (
                <button
                  onClick={() => reset(true)}
                  className="px-4 py-2 rounded-lg text-xs border transition hover:border-white/50"
                  style={{ borderColor: 'rgba(255,255,255,0.2)', color: 'var(--color-text)' }}
                >
                  Practice Weak Keys
                </button>
              )}
            </div>
          </div>
        )}

        {!isComplete && (
          <div className="mt-8 transition-opacity duration-300">
            <LiveKeyboard active={active} />
          </div>
        )}

        {/* Restart hint */}
        {!isComplete && (
          <div className="flex justify-center mt-6">
            <button
              onClick={() => reset(false)}
              className="flex items-center gap-2 text-xs transition-all hover:opacity-60 opacity-30"
              style={{ color: 'var(--color-text)' }}
            >
              <RotateCcw size={13} />
              <span>tab — restart</span>
            </button>
          </div>
        )}
      </div>

      {promotedTo && <LevelUpToast newLevel={promotedTo} onClose={() => setPromotedTo(null)} />}
    </div>
  );
}
