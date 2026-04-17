'use client';
import { useEffect, useState } from 'react';
import { ZoomIn, ZoomOut } from 'lucide-react';

const MIN = 14;
const MAX = 48;
const STEP = 2;
const DEFAULT = 24;
const LS_KEY = 'typing-font-size';

export function useFontSize() {
  const [size, setSize] = useState<number>(() => {
    if (typeof window === 'undefined') return DEFAULT;
    return Number(localStorage.getItem(LS_KEY) || DEFAULT);
  });

  const update = (next: number) => {
    const clamped = Math.min(MAX, Math.max(MIN, next));
    setSize(clamped);
    localStorage.setItem(LS_KEY, String(clamped));
  };

  // Ctrl + scroll wheel
  useEffect(() => {
    const handler = (e: WheelEvent) => {
      if (!e.ctrlKey) return;
      e.preventDefault();
      update(size + (e.deltaY < 0 ? STEP : -STEP));
    };
    window.addEventListener('wheel', handler, { passive: false });
    return () => window.removeEventListener('wheel', handler);
  }, [size]);

  return { size, increase: () => update(size + STEP), decrease: () => update(size - STEP) };
}

export default function FontSizeControl({
  size, increase, decrease,
}: {
  size: number; increase: () => void; decrease: () => void;
}) {
  return (
    <div className="flex items-center gap-1" style={{ color: 'var(--color-sub)' }}>
      <button
        onClick={decrease}
        className="p-1 rounded hover:text-white transition-colors"
        title="Zoom out (Ctrl+Scroll)"
      >
        <ZoomOut size={13} />
      </button>
      <span className="text-xs w-8 text-center tabular-nums">{size}px</span>
      <button
        onClick={increase}
        className="p-1 rounded hover:text-white transition-colors"
        title="Zoom in (Ctrl+Scroll)"
      >
        <ZoomIn size={13} />
      </button>
    </div>
  );
}
