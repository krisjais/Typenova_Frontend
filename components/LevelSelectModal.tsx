'use client';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
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
    iconColor: '#34d399', // Emerald
    label: 'Beginner',
    desc: "Short common words, simple patterns. Perfect if you're just starting out.",
    wpm: '< 40 WPM',
    examples: ['the', 'and', 'cat', 'run', 'big'],
  },
  {
    id: 'intermediate',
    icon: Zap,
    iconColor: '#fbbf24', // Amber
    label: 'Intermediate',
    desc: 'Full sentences with varied vocabulary. For those who can type but want to improve.',
    wpm: '40–70 WPM',
    examples: ['The quick brown fox jumps...'],
  },
  {
    id: 'pro',
    icon: Flame,
    iconColor: '#f87171', // Red
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

  // Wait for client mount before using portal
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
    <div
      className="fixed inset-0 z-9999 flex items-center justify-center bg-black/70 backdrop-blur-sm fade-in px-4"
      onClick={handleBackdropClick}
    >
      <div
        className="w-full max-w-lg rounded-2xl p-8 shadow-2xl"
        style={{ background: 'var(--color-bg)', border: '1px solid rgba(255,255,255,0.1)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-1">
          <h2 className="text-2xl font-bold" style={{ color: 'var(--color-accent)' }}>
            Choose Your Level
          </h2>
          {onClose && (
            <button
              onClick={onClose}
              className="text-2xl opacity-40 hover:opacity-100 transition-opacity leading-none"
              aria-label="Close"
            >
              ×
            </button>
          )}
        </div>
        <p className="text-sm opacity-50 mb-6">
          We'll tailor your practice content to match your skill. You can change this later.
        </p>

        <div className="space-y-3 mb-6">
          {LEVELS.map((l) => (
            <button
              key={l.id}
              onClick={() => setSelected(l.id)}
              className="w-full text-left p-4 rounded-xl transition-all hover:scale-[1.01]"
              style={{
                background: selected === l.id ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${selected === l.id ? 'var(--color-accent)' : 'rgba(255,255,255,0.08)'}`,
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold flex items-center gap-3">
                  <span 
                    className="flex shrink-0 items-center justify-center p-1.5 rounded-lg border shadow-sm transition-all duration-300"
                    style={{ 
                      backgroundColor: `${l.iconColor}15`, 
                      color: l.iconColor,
                      borderColor: selected === l.id ? l.iconColor : `${l.iconColor}30`,
                      boxShadow: selected === l.id ? `0 0 10px ${l.iconColor}40` : 'none'
                    }}
                  >
                    <l.icon size={18} strokeWidth={2.5} />
                  </span>
                  <span className="text-lg tracking-wide">{l.label}</span>
                </span>
                <span
                  className="text-xs px-2 py-0.5 rounded-full font-mono"
                  style={{ background: 'rgba(255,255,255,0.08)', color: 'var(--color-accent)' }}
                >
                  {l.wpm}
                </span>
              </div>
              <p className="text-xs opacity-50">{l.desc}</p>
              <p className="text-xs mt-1 font-mono opacity-40 truncate">
                e.g. {l.examples.join(' · ')}
              </p>
            </button>
          ))}
        </div>

        <button
          onClick={handleConfirm}
          disabled={!selected || loading}
          className="w-full py-3 rounded-lg font-semibold text-sm transition hover:opacity-90 disabled:opacity-30"
          style={{ background: 'var(--color-accent)', color: '#fff' }}
        >
          {loading ? 'Saving...' : 'Start Typing →'}
        </button>
      </div>
    </div>,
    document.body
  );
}
