'use client';
import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gauge, Target, AlertTriangle, Clock, ArrowRight, RotateCcw } from 'lucide-react';

interface Props {
  wpm: number;
  accuracy: number;
  errors: number;
  duration: number;
  onRetry: () => void;
  onClose: () => void;
}

export default function ResultModal({ wpm, accuracy, errors, duration, onRetry, onClose }: Props) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        onRetry();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onRetry]);

  const stats = [
    { label: 'WPM', value: wpm, color: 'var(--color-accent)', icon: Gauge },
    { label: 'Accuracy', value: `${accuracy}%`, color: accuracy >= 90 ? 'var(--color-success)' : 'var(--color-warning)', icon: Target },
    { label: 'Errors', value: errors, color: errors === 0 ? 'var(--color-success)' : 'var(--color-error)', icon: AlertTriangle },
    { label: 'Time', value: `${duration}s`, color: 'var(--color-text)', icon: Clock },
  ];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="rounded-2xl p-8 w-full max-w-sm text-center shadow-2xl border border-[var(--color-border)] bg-[var(--color-bg)]"
        >
          <h2 className="text-2xl font-bold mb-6 text-[var(--color-accent)]">
            Results
          </h2>

          <div className="grid grid-cols-2 gap-3 mb-8">
            {stats.map((s) => (
              <div key={s.label} className="p-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]">
                <div className="flex items-center gap-1.5 mb-2">
                  <s.icon size={12} style={{ color: s.color }} strokeWidth={1.8} />
                  <span className="text-[10px] uppercase tracking-widest text-[var(--color-text-secondary)] font-semibold">{s.label}</span>
                </div>
                <div className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</div>
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <button
              onClick={onRetry}
              className="group flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-[14px] bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)] transition-colors shadow-sm"
            >
              <RotateCcw size={14} />
              Try Again
            </button>
            <button
              onClick={onClose}
              className="flex-1 py-3 rounded-xl font-semibold text-[14px] border border-[var(--color-border)] text-[var(--color-text)] hover:bg-white/[0.04] transition-colors"
            >
              Close
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
