'use client';
import { useEffect } from 'react';
import { Level } from '@/utils/typing';

const LABELS: Record<Level, string> = {
  beginner: '🌱 Beginner',
  intermediate: '⚡ Intermediate',
  pro: '🔥 Pro',
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

  return (
    <div
      className="fixed bottom-6 right-6 z-50 px-5 py-4 rounded-xl shadow-2xl fade-in flex items-center gap-3"
      style={{ background: 'var(--color-accent)', color: '#fff', minWidth: 260 }}
    >
      <span className="text-2xl">🎉</span>
      <div>
        <p className="font-bold text-sm">Level Up!</p>
        <p className="text-xs opacity-80">You've been promoted to {LABELS[newLevel]}</p>
      </div>
      <button onClick={onClose} className="ml-auto opacity-70 hover:opacity-100 text-lg">×</button>
    </div>
  );
}
