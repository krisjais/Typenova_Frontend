'use client';
import { useEffect, useState } from 'react';

const KEYBOARD_ROWS = [
  [
    { id: 'Backquote', label: '`' },
    { id: 'Digit1', label: '1' },
    { id: 'Digit2', label: '2' },
    { id: 'Digit3', label: '3' },
    { id: 'Digit4', label: '4' },
    { id: 'Digit5', label: '5' },
    { id: 'Digit6', label: '6' },
    { id: 'Digit7', label: '7' },
    { id: 'Digit8', label: '8' },
    { id: 'Digit9', label: '9' },
    { id: 'Digit0', label: '0' },
    { id: 'Minus', label: '-' },
    { id: 'Equal', label: '=' },
    { id: 'Backspace', label: '⌫', width: 'w-[90px]' },
  ],
  [
    { id: 'Tab', label: 'tab', width: 'w-[70px]' },
    { id: 'KeyQ', label: 'q' },
    { id: 'KeyW', label: 'w' },
    { id: 'KeyE', label: 'e' },
    { id: 'KeyR', label: 'r' },
    { id: 'KeyT', label: 't' },
    { id: 'KeyY', label: 'y' },
    { id: 'KeyU', label: 'u' },
    { id: 'KeyI', label: 'i' },
    { id: 'KeyO', label: 'o' },
    { id: 'KeyP', label: 'p' },
    { id: 'BracketLeft', label: '[' },
    { id: 'BracketRight', label: ']' },
    { id: 'Backslash', label: '\\', width: 'flex-1' },
  ],
  [
    { id: 'CapsLock', label: 'caps', width: 'w-[85px]' },
    { id: 'KeyA', label: 'a' },
    { id: 'KeyS', label: 's' },
    { id: 'KeyD', label: 'd' },
    { id: 'KeyF', label: 'f' },
    { id: 'KeyG', label: 'g' },
    { id: 'KeyH', label: 'h' },
    { id: 'KeyJ', label: 'j' },
    { id: 'KeyK', label: 'k' },
    { id: 'KeyL', label: 'l' },
    { id: 'Semicolon', label: ';' },
    { id: 'Quote', label: '\'' },
    { id: 'Enter', label: '↵', width: 'flex-1' },
  ],
  [
    { id: 'ShiftLeft', label: 'shift', width: 'w-[115px]' },
    { id: 'KeyZ', label: 'z' },
    { id: 'KeyX', label: 'x' },
    { id: 'KeyC', label: 'c' },
    { id: 'KeyV', label: 'v' },
    { id: 'KeyB', label: 'b' },
    { id: 'KeyN', label: 'n' },
    { id: 'KeyM', label: 'm' },
    { id: 'Comma', label: ',' },
    { id: 'Period', label: '.' },
    { id: 'Slash', label: '/' },
    { id: 'ShiftRight', label: 'shift', width: 'flex-1' },
  ],
  [
    { id: 'ControlLeft', label: 'ctrl', width: 'w-[65px]' },
    { id: 'MetaLeft', label: 'win', width: 'w-[65px]' },
    { id: 'AltLeft', label: 'alt', width: 'w-[65px]' },
    { id: 'Space', label: '', width: 'w-[325px]' },
    { id: 'AltRight', label: 'alt', width: 'w-[65px]' },
    { id: 'MetaRight', label: 'win', width: 'w-[65px]' },
    { id: 'ContextMenu', label: 'fn', width: 'w-[65px]' },
    { id: 'ControlRight', label: 'ctrl', width: 'flex-1' },
  ]
];

export default function LiveKeyboard({ active }: { active?: boolean }) {
  const [activeKeys, setActiveKeys] = useState<Set<string>>(new Set());

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      setActiveKeys((prev) => {
        const newSet = new Set(prev);
        newSet.add(e.code);
        return newSet;
      });
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      setActiveKeys((prev) => {
        const newSet = new Set(prev);
        newSet.delete(e.code);
        return newSet;
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  return (
    <div className="w-full max-w-[820px] mx-auto p-5 md:px-7 md:py-5 rounded-2xl relative bg-[var(--color-surface)] border border-[var(--color-border)]">
      <div className="relative flex flex-col gap-[5px] md:gap-[6px]">
        {KEYBOARD_ROWS.map((row, rowIndex) => (
          <div key={rowIndex} className="flex justify-center gap-[5px] md:gap-[6px]">
            {row.map((k) => {
              const isActive = activeKeys.has(k.id);
              return (
                <div key={k.id} className={`${k.width || 'w-[44px]'} relative select-none`}>
                  <div
                    className={`
                      w-full h-[40px] md:h-[44px]
                      rounded-lg flex items-center justify-center 
                      text-[11px] md:text-[12px] tracking-wider uppercase font-medium
                      transition-all duration-75 ease-out
                      ${isActive
                        ? 'translate-y-[2px] bg-[var(--color-accent)] text-white shadow-[0_0_16px_var(--color-accent-glow)]'
                        : 'bg-[var(--color-card)] text-[var(--color-text-secondary)] border border-[var(--color-border)] shadow-[0_2px_0_rgba(0,0,0,0.4)] hover:bg-[rgba(255,255,255,0.06)]'
                      }
                    `}
                  >
                    {k.label}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
