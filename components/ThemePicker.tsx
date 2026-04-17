'use client';
import { useTheme, ThemeConfig } from '@/context/ThemeContext';

const PRESETS: { name: string; theme: ThemeConfig }[] = [
  { name: 'Dark', theme: { background: '#0f0f0f', text: '#e2e8f0', accent: '#6366f1', mode: 'dark' } },
  { name: 'Light', theme: { background: '#f8fafc', text: '#1e293b', accent: '#6366f1', mode: 'light' } },
  { name: 'Mocha', theme: { background: '#1e1e2e', text: '#cdd6f4', accent: '#cba6f7', mode: 'dark' } },
  { name: 'Nord', theme: { background: '#2e3440', text: '#eceff4', accent: '#88c0d0', mode: 'dark' } },
  { name: 'Solarized', theme: { background: '#002b36', text: '#839496', accent: '#268bd2', mode: 'dark' } },
  { name: 'Rose', theme: { background: '#0f0a0a', text: '#fce7f3', accent: '#f43f5e', mode: 'dark' } },
  { name: 'OLED Blue', theme: { background: '#000000', text: '#f8fafc', accent: '#3b82f6', mode: 'dark' } },
  { name: 'OLED Gold', theme: { background: '#000000', text: '#f8fafc', accent: '#fbbf24', mode: 'dark' } },
  { name: 'OLED Purple', theme: { background: '#000000', text: '#f8fafc', accent: '#a855f7', mode: 'dark' } },
  { name: 'OLED Green', theme: { background: '#000000', text: '#f8fafc', accent: '#10b981', mode: 'dark' } },
];

export default function ThemePicker({ onClose }: { onClose: () => void }) {
  const { theme, saveTheme } = useTheme();

  return (
    <div
      className="p-4 rounded-xl border border-white/10 shadow-2xl w-72 fade-in"
      style={{ background: theme.background }}
    >
      <div className="flex justify-between items-center mb-3">
        <span className="text-sm font-semibold">Theme</span>
        <button onClick={onClose} className="opacity-50 hover:opacity-100 text-lg">×</button>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-4">
        {PRESETS.map((p) => (
          <button
            key={p.name}
            onClick={() => saveTheme(p.theme)}
            className="p-2 rounded-lg border text-xs font-medium transition hover:scale-105"
            style={{
              background: p.theme.background,
              color: p.theme.text,
              borderColor: theme.accent === p.theme.accent ? p.theme.accent : 'transparent',
            }}
          >
            <div className="w-full h-4 rounded mb-1" style={{ background: p.theme.accent }} />
            {p.name}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {(['background', 'text', 'accent'] as const).map((key) => (
          <div key={key} className="flex items-center justify-between">
            <label className="text-xs capitalize opacity-70">{key}</label>
            <input
              type="color"
              value={theme[key]}
              onChange={(e) => saveTheme({ ...theme, [key]: e.target.value })}
              className="w-8 h-8 rounded cursor-pointer border-0 bg-transparent"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
