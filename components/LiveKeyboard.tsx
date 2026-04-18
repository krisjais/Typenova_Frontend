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
    { id: 'Backspace', label: 'Backspace', width: 'w-24' },
  ],
  [
    { id: 'Tab', label: 'Tab', width: 'w-20' },
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
    { id: 'CapsLock', label: 'Caps Lock', width: 'w-24' },
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
    { id: 'Enter', label: 'Enter', width: 'w-24' },
  ],
  [
    { id: 'ShiftLeft', label: 'Shift', width: 'w-32' },
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
    { id: 'ShiftRight', label: 'Shift', width: 'flex-1' },
  ],
  [
    { id: 'ControlLeft', label: 'Ctrl', width: 'w-16' },
    { id: 'MetaLeft', label: 'Win', width: 'w-16' },
    { id: 'AltLeft', label: 'Alt', width: 'w-16' },
    { id: 'Space', label: '', width: 'flex-1' },
    { id: 'AltRight', label: 'Alt', width: 'w-16' },
    { id: 'MetaRight', label: 'Win', width: 'w-16' },
    { id: 'ContextMenu', label: 'Menu', width: 'w-16' },
    { id: 'ControlRight', label: 'Ctrl', width: 'w-16' },
  ]
];

export default function LiveKeyboard() {
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
    <div className="w-full max-w-4xl mx-auto mt-8 p-4 bg-[var(--color-bg)] rounded-2xl shadow-sm border border-white/5 opacity-80 backdrop-blur-sm transition-all duration-300">
      <div className="flex flex-col gap-2">
        {KEYBOARD_ROWS.map((row, rowIndex) => (
          <div key={rowIndex} className="flex justify-center gap-2">
            {row.map((k) => {
              const isActive = activeKeys.has(k.id);
              return (
                <div
                  key={k.id}
                  className={`
                    ${k.width || 'w-12'} h-12 
                    rounded-lg flex items-center justify-center 
                    text-sm font-semibold transition-all duration-100 ease-out
                    ${isActive 
                      ? 'bg-[var(--color-accent)] text-[var(--color-bg)] scale-[0.95] shadow-inner' 
                      : 'bg-black/20 text-[var(--color-sub)] border border-white/5 shadow-sm'
                    }
                  `}
                >
                  {k.label}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
