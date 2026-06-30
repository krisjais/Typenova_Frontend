'use client';
import { useEffect, useState } from 'react';
import { ZoomIn, ZoomOut } from 'lucide-react';

const MIN = 14;
const MAX = 48;
const STEP = 2;
const DEFAULT = 26;
const LS_KEY = 'typing-font-size';

export function useFontSize() {
  const [size, setSize] = useState<number>(DEFAULT);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem(LS_KEY);
    if (saved) {
      setSize(Number(saved));
    }
  }, []);

  const update = (next: number) => {
    const clamped = Math.min(MAX, Math.max(MIN, next));
    setSize(clamped);
    localStorage.setItem(LS_KEY, String(clamped));
  };

  // Ctrl + scroll wheel
  useEffect(() => {
    if (!mounted) return;
    const handler = (e: WheelEvent) => {
      if (!e.ctrlKey) return;
      e.preventDefault();
      update(size + (e.deltaY < 0 ? STEP : -STEP));
    };
    window.addEventListener('wheel', handler, { passive: false });
    return () => window.removeEventListener('wheel', handler);
  }, [size, mounted]);

  return { size, increase: () => update(size + STEP), decrease: () => update(size - STEP) };
}

export default function FontSizeControl({
  size, increase, decrease,
}: {
  size: number; increase: () => void; decrease: () => void;
}) {
  return (
    <div className="flex items-center gap-1.5 text-[var(--color-text-secondary)]">
      <button
        onClick={decrease}
        className="p-1 rounded-md hover:text-[var(--color-text)] hover:bg-white/[0.06] transition-colors"
        title="Zoom out (Ctrl+Scroll)"
      >
        <ZoomOut size={13} />
      </button>
      <span className="text-[11px] w-8 text-center tabular-nums font-medium">{size}</span>
      <button
        onClick={increase}
        className="p-1 rounded-md hover:text-[var(--color-text)] hover:bg-white/[0.06] transition-colors"
        title="Zoom in (Ctrl+Scroll)"
      >
        <ZoomIn size={13} />
      </button>
    </div>
  );
}
