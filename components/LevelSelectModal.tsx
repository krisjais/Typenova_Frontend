'use client';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sprout, Zap, Flame, type LucideIcon } from 'lucide-react';
import { api } from '@/lib/api';
import { Level } from '@/utils/typing';

interface Props {
  onSelect: (level: Level) => void;
  onClose?: () => void;
}

const LEVELS: { id: Level; icon: LucideIcon; iconColor: string; label: string; desc: string; wpm: string; examples: string[] }[] = [
  {
    id: 'beginner',
    icon: Sprout,
    iconColor: '#34d399',
    label: 'Beginner',
    desc: "Short common words, simple patterns. Perfect if you're just starting out.",
    wpm: '< 40 WPM',
    examples: ['the', 'and', 'cat', 'run', 'big'],
  },
  {
    id: 'intermediate',
    icon: Zap,
    iconColor: '#fbbf24',
    label: 'Intermediate',
    desc: 'Full sentences with varied vocabulary. For those who can type but want to improve.',
    wpm: '40–70 WPM',
    examples: ['The quick brown fox jumps...'],
  },
  {
    id: 'pro',
    icon: Flame,
    iconColor: '#f87171',
    label: 'Pro',
    desc: 'Complex technical paragraphs. For experienced typists chasing peak performance.',
    wpm: '70+ WPM',
    examples: ['Asynchronous programming allows...'],
  },
];

export default function LevelSelectModal({ onSelect, onClose }: Props) {
  const [selected, setSelected] = useState<Level | null>(null);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const handleConfirm = async () => {
    if (!selected) return;
    setLoading(true);
    try {
      await api.setLevel({ level: selected });
      onSelect(selected);
    } catch {
      onSelect(selected);
    } finally {
      setLoading(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && onClose) onClose();
  };

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm px-4"
        onClick={handleBackdropClick}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-lg rounded-2xl p-8 shadow-2xl border border-[var(--color-border)] bg-[var(--color-bg)]"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-start justify-between mb-1">
            <h2 className="text-2xl font-bold text-[var(--color-accent)]">
              Choose Your Level
            </h2>
            {onClose && (
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/[0.06] text-[var(--color-text-secondary)] transition-colors text-lg"
                aria-label="Close"
              >
                ×
              </button>
            )}
          </div>
          <p className="text-sm text-[var(--color-text-secondary)] mb-6">
            We&apos;ll tailor your practice content to match your skill. You can change this later.
          </p>

          <div className="space-y-3 mb-6">
            {LEVELS.map((l) => (
              <button
                key={l.id}
                onClick={() => setSelected(l.id)}
                className="w-full text-left p-4 rounded-2xl transition-all duration-200 hover:scale-[1.01]"
                style={{
                  background: selected === l.id ? 'var(--color-accent-muted)' : 'var(--color-surface)',
                  border: `1px solid ${selected === l.id ? 'var(--color-accent)' : 'var(--color-border)'}`,
                  boxShadow: selected === l.id ? '0 0 20px var(--color-accent-glow)' : 'none',
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold flex items-center gap-3">
                    <span
                      className="flex shrink-0 items-center justify-center w-9 h-9 rounded-xl border transition-all duration-300"
                      style={{
                        backgroundColor: `${l.iconColor}12`,
                        color: l.iconColor,
                        borderColor: selected === l.id ? l.iconColor : `${l.iconColor}25`,
                        boxShadow: selected === l.id ? `0 0 12px ${l.iconColor}30` : 'none'
                      }}
                    >
                      <l.icon size={18} strokeWidth={2.2} />
                    </span>
                    <span className="text-[16px] tracking-wide text-[var(--color-text)]">{l.label}</span>
                  </span>
                  <span className="text-[12px] px-2.5 py-1 rounded-lg font-mono bg-white/[0.06] text-[var(--color-accent)]">
                    {l.wpm}
                  </span>
                </div>
                <p className="text-[13px] text-[var(--color-text-secondary)] ml-12">{l.desc}</p>
                <p className="text-[12px] mt-1 font-mono text-[var(--color-text-secondary)] opacity-50 ml-12 truncate">
                  e.g. {l.examples.join(' · ')}
                </p>
              </button>
            ))}
          </div>

          <button
            onClick={handleConfirm}
            disabled={!selected || loading}
            className="w-full py-3 rounded-xl font-semibold text-[14px] bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)] transition-colors disabled:opacity-30 shadow-sm shadow-[var(--color-accent)]/20"
          >
            {loading ? 'Saving...' : 'Start Typing →'}
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
}
