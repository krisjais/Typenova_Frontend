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
    { id: 'Backspace', label: 'backspace', width: 'w-[90px]' },
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
    { id: 'Enter', label: 'enter', width: 'flex-1' },
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
    { id: 'ContextMenu', label: 'menu', width: 'w-[65px]' },
    { id: 'ControlRight', label: 'ctrl', width: 'flex-1' },
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
    <div className="w-full max-w-[850px] mx-auto mt-6 mb-2 p-5 md:px-8 md:py-6 rounded-3xl relative preserve-3d transition-transform duration-300" 
         style={{ perspective: '1000px' }}>
      
      {/* Container Background with Glassmorphic styling */}
      <div className="absolute inset-0 bg-black/20 backdrop-blur-xl rounded-[2rem] border border-white/5 
          shadow-[0_8px_32px_rgba(0,0,0,0.4),inset_0_1px_1px_rgba(255,255,255,0.05)] pointer-events-none" />

      {/* Decorative gradient orb behind keyboard */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 
          rounded-full bg-[var(--color-accent)] opacity-5 blur-[100px] pointer-events-none" />

      <div className="relative flex flex-col gap-[6px] md:gap-[8px]">
        {KEYBOARD_ROWS.map((row, rowIndex) => (
          <div key={rowIndex} className="flex justify-center gap-[6px] md:gap-[8px]">
            {row.map((k) => {
              const isActive = activeKeys.has(k.id);
              return (
                <div key={k.id} className={`${k.width || 'w-[46px]'} relative select-none group`}>
                  {/* The tactile key body */}
                  <div
                    className={`
                      w-full h-[44px] md:h-[50px]
                      rounded-xl flex items-center justify-center 
                      text-[12px] md:text-[13px] tracking-wider uppercase font-semibold
                      transition-all duration-[50ms] ease-out
                      ${isActive 
                        ? 'translate-y-[4px] bg-[var(--color-accent)] text-[var(--color-bg)] shadow-[0_0_24px_rgba(var(--color-accent-rgb),0.5)] z-10' 
                        : 'bg-gradient-to-b from-[rgba(255,255,255,0.05)] to-[rgba(255,255,255,0.01)] text-[var(--color-sub)] border-t border-[rgba(255,255,255,0.05)] shadow-[0_4px_0_rgba(0,0,0,0.6),0_5px_8px_rgba(0,0,0,0.5)] hover:from-[rgba(255,255,255,0.08)] hover:to-[rgba(255,255,255,0.03)]'
                      }
                    `}
                    style={{
                      boxShadow: isActive ? '0 0 16px var(--color-accent), 0 0px 0px rgba(0,0,0,0)' : undefined
                    }}
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
