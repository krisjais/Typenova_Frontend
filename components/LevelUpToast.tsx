'use client';
import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Level } from '@/utils/typing';
import { Sprout, Zap, Flame, PartyPopper } from 'lucide-react';

const LEVEL_CONFIG: Record<Level, { label: string; icon: React.ElementType; color: string }> = {
  beginner: { label: 'Beginner', icon: Sprout, color: '#34d399' },
  intermediate: { label: 'Intermediate', icon: Zap, color: '#fbbf24' },
  pro: { label: 'Pro', icon: Flame, color: '#f87171' },
};

interface Props {
  newLevel: Level;
  onClose: () => void;
}

export default function LevelUpToast({ newLevel, onClose }: Props) {
  useEffect(() => {
    const t = setTimeout(onClose, 5000);
    return () => clearTimeout(t);
  }, [onClose]);

  const config = LEVEL_CONFIG[newLevel];
  const LevelIcon = config.icon;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="fixed bottom-6 right-6 z-50 px-5 py-4 rounded-2xl shadow-2xl shadow-black/30 flex items-center gap-3 border border-[var(--color-accent)]/30 bg-[var(--color-surface)]"
        style={{ minWidth: 280 }}
      >
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[var(--color-accent-muted)]">
          <PartyPopper size={20} className="text-[var(--color-accent)]" />
        </div>
        <div className="flex-1">
          <p className="font-semibold text-[14px] text-[var(--color-text)]">Level Up!</p>
          <p className="text-[13px] text-[var(--color-text-secondary)] flex items-center gap-1.5">
            Promoted to
            <LevelIcon size={13} style={{ color: config.color }} />
            <span style={{ color: config.color }} className="font-medium">{config.label}</span>
          </p>
        </div>
        <button
          onClick={onClose}
          className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white/[0.06] text-[var(--color-text-secondary)] transition-colors text-sm"
        >
          ×
        </button>
      </motion.div>
    </AnimatePresence>
  );
}
