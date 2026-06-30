'use client';
import { useTheme, ThemeConfig } from '@/context/ThemeContext';
import { Palette, X, Check } from 'lucide-react';

const PRESETS: { name: string; theme: ThemeConfig }[] = [
  { name: 'TypeNova', theme: { background: '#09090B', text: '#FAFAFA', accent: '#7C5CFF', mode: 'dark' } },
  { name: 'Midnight', theme: { background: '#0f0f0f', text: '#e2e8f0', accent: '#6366f1', mode: 'dark' } },
  { name: 'Light', theme: { background: '#f8fafc', text: '#1e293b', accent: '#6366f1', mode: 'light' } },
  { name: 'Mocha', theme: { background: '#1e1e2e', text: '#cdd6f4', accent: '#cba6f7', mode: 'dark' } },
  { name: 'Nord', theme: { background: '#2e3440', text: '#eceff4', accent: '#88c0d0', mode: 'dark' } },
  { name: 'Solarized', theme: { background: '#002b36', text: '#839496', accent: '#268bd2', mode: 'dark' } },
  { name: 'Rose', theme: { background: '#0f0a0a', text: '#fce7f3', accent: '#f43f5e', mode: 'dark' } },
  { name: 'OLED Blue', theme: { background: '#000000', text: '#f8fafc', accent: '#3b82f6', mode: 'dark' } },
  { name: 'OLED Gold', theme: { background: '#000000', text: '#f8fafc', accent: '#fbbf24', mode: 'dark' } },
  { name: 'OLED Green', theme: { background: '#000000', text: '#f8fafc', accent: '#10b981', mode: 'dark' } },
];

export default function ThemePicker({ onClose }: { onClose: () => void }) {
  const { theme, saveTheme } = useTheme();

  return (
    <div className="p-5 rounded-2xl border border-[var(--color-border)] shadow-2xl shadow-black/40 w-80 bg-[var(--color-surface)]">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <Palette size={15} className="text-[var(--color-accent)]" />
          <span className="text-[14px] font-semibold text-[var(--color-text)]">Theme</span>
        </div>
        <button
          onClick={onClose}
          className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white/[0.06] text-[var(--color-text-secondary)] transition-colors"
        >
          <X size={14} />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-5">
        {PRESETS.map((p) => {
          const isActive = theme.accent === p.theme.accent && theme.background === p.theme.background;
          return (
            <button
              key={p.name}
              onClick={() => saveTheme(p.theme)}
              className="relative p-3 rounded-xl text-left text-[12px] font-medium transition-all hover:scale-[1.02] active:scale-[0.98]"
              style={{
                background: p.theme.background,
                color: p.theme.text,
                border: isActive ? `1.5px solid ${p.theme.accent}` : '1px solid var(--color-border)',
                boxShadow: isActive ? `0 0 12px ${p.theme.accent}20` : 'none',
              }}
            >
              <div className="w-full h-3 rounded-md mb-2" style={{ background: p.theme.accent }} />
              <span className="opacity-80">{p.name}</span>
              {isActive && (
                <span className="absolute top-2 right-2">
                  <Check size={12} style={{ color: p.theme.accent }} />
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="space-y-3 pt-3 border-t border-[var(--color-border)]">
        <p className="text-[11px] uppercase tracking-widest text-[var(--color-text-secondary)] font-semibold">Custom</p>
        {(['background', 'text', 'accent'] as const).map((key) => (
          <div key={key} className="flex items-center justify-between">
            <label className="text-[13px] capitalize text-[var(--color-text-secondary)]">{key}</label>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono text-[var(--color-text-secondary)] opacity-60">{theme[key]}</span>
              <input
                type="color"
                value={theme[key]}
                onChange={(e) => saveTheme({ ...theme, [key]: e.target.value })}
                className="w-7 h-7 rounded-lg cursor-pointer border-0 bg-transparent p-0"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
