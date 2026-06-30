'use client';
import { useEffect, useRef, useCallback, useState } from 'react';
import { Lock } from 'lucide-react';

interface Props {
  text: string;
  typed: string;
  onType: (typed: string) => void;
  active: boolean;
  practiceMode?: boolean;
  fontSize?: number;
}

export default function TypingArea({ text, typed, onType, active, practiceMode = false, fontSize = 26 }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const activeWordRef = useRef<HTMLSpanElement>(null);
  const [focused, setFocused] = useState(false);
  const [capsLockActive, setCapsLockActive] = useState(false);

  useEffect(() => {
    if (active) inputRef.current?.focus();
  }, [active]);

  // Track CapsLock state globally
  useEffect(() => {
    const handleKey = (e: KeyboardEvent | MouseEvent) => {
      if (e instanceof KeyboardEvent || e instanceof MouseEvent) {
        setCapsLockActive(e.getModifierState('CapsLock'));
      }
    };
    window.addEventListener('keydown', handleKey);
    window.addEventListener('keyup', handleKey);
    window.addEventListener('mousedown', handleKey);
    return () => {
      window.removeEventListener('keydown', handleKey);
      window.removeEventListener('keyup', handleKey);
      window.removeEventListener('mousedown', handleKey);
    };
  }, []);

  // Reset scroll when text changes (new session)
  useEffect(() => {
    if (containerRef.current) containerRef.current.scrollTop = 0;
  }, [text]);

  // Scroll active word into view (keep on row 2)
  useEffect(() => {
    if (!containerRef.current || !activeWordRef.current) return;
    const container = containerRef.current;
    const word = activeWordRef.current;
    const lineH = word.offsetHeight;

    if (word.offsetTop > container.scrollTop + lineH * 1.5) {
      container.scrollTop = word.offsetTop - lineH;
    } else if (word.offsetTop < container.scrollTop) {
      container.scrollTop = word.offsetTop;
    }
  }, [typed]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (!active) return;
      if (e.key === 'Backspace') {
        e.preventDefault();
        if (practiceMode && typed.length > 0 && typed[typed.length - 1] === ' ') return;
        onType(typed.slice(0, -1));
        return;
      }
      if (e.key.length !== 1) return;
      if (typed.length >= text.length) return;
      onType(typed + e.key);
    },
    [active, typed, text, onType, practiceMode]
  );

  // Build word list
  const words: { chars: string[]; start: number }[] = [];
  let idx = 0;
  for (const w of text.split(' ')) {
    words.push({ chars: w.split(''), start: idx });
    idx += w.length + 1;
  }

  const caretPos = typed.length;

  const caretWordIdx = (() => {
    for (let i = 0; i < words.length; i++) {
      const w = words[i];
      const wordEnd = w.start + w.chars.length;
      if (caretPos >= w.start && caretPos <= wordEnd) return i;
      if (i === words.length - 1 && caretPos > wordEnd) return i;
      const nextStart = words[i + 1]?.start ?? Infinity;
      if (caretPos > wordEnd && caretPos < nextStart) return i;
    }
    return words.length - 1;
  })();

  return (
    <div
      className="relative select-none cursor-text rounded-2xl p-6 bg-[var(--color-surface)] border border-[var(--color-border)]"
      onClick={() => inputRef.current?.focus()}
    >
      {/* CapsLock Warning */}
      {capsLockActive && focused && (
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-[var(--color-error)]/10 text-[var(--color-error)] px-4 py-2 rounded-xl text-[13px] font-semibold border border-[var(--color-error)]/20 backdrop-blur-md z-20 shadow-lg tracking-wide">
          <Lock size={13} />
          Caps Lock is ON
        </div>
      )}

      {/* Focus overlay */}
      {!focused && (
        <div
          className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl"
          style={{ background: 'rgba(9, 9, 11, 0.7)', backdropFilter: 'blur(3px)' }}
        >
          <p className="text-[14px] font-medium text-[var(--color-text-secondary)]">
            Click or press any key to focus
          </p>
        </div>
      )}

      <div
        ref={containerRef}
        className="overflow-hidden"
        style={{
          maxHeight: `calc(${fontSize}px * 2 * 3 + 1.5rem)`,
          lineHeight: '2em',
          transition: 'max-height 0.2s ease',
        }}
      >
        <div
          className="flex flex-wrap gap-x-[0.5em] font-mono tracking-wide antialiased"
          style={{ fontSize: `${fontSize}px`, lineHeight: '2em', transition: 'font-size 0.15s ease' }}
        >
          {words.map((word, wi) => {
            const wordEnd = word.start + word.chars.length;
            const isCaretWord = wi === caretWordIdx;
            const isCompleted = caretPos > wordEnd && !isCaretWord;
            const isUpcoming = wi > caretWordIdx;

            const hasError = isCompleted && word.chars.some(
              (ch, ci) => typed[word.start + ci] !== ch
            );

            const extraTyped = isCaretWord && caretPos > wordEnd
              ? typed.slice(wordEnd, caretPos)
              : '';

            return (
              <span
                key={wi}
                ref={isCaretWord ? activeWordRef : undefined}
                className={`relative inline-flex items-center px-1 rounded-md transition-all duration-200 ${
                  hasError
                    ? 'border-b-2 border-[var(--color-error)]'
                    : 'border-b border-transparent'
                }`}
              >
                {word.chars.map((char, ci) => {
                  const globalIdx = word.start + ci;
                  const isTyped = globalIdx < typed.length;
                  const typedChar = typed[globalIdx];
                  const showCaretBefore = isCaretWord && globalIdx === caretPos;

                  let color: string;
                  if (!isTyped) color = 'var(--color-sub)';
                  else if (typedChar === char) color = 'var(--color-correct)';
                  else color = 'var(--color-error)';

                  return (
                    <span key={ci} className="relative transition-colors duration-75" style={{ color }}>
                      {showCaretBefore && <Caret focused={focused} />}
                      {char}
                    </span>
                  );
                })}

                {isCaretWord && caretPos === wordEnd && extraTyped.length === 0 && (
                  <Caret focused={focused} inline />
                )}

                {extraTyped.split('').map((ec, ei) => {
                  const showCaretAfter = isCaretWord && wordEnd + ei + 1 === caretPos;
                  return (
                    <span
                      key={`ex-${ei}`}
                      className="relative"
                      style={{
                        color: 'var(--color-error)',
                        background: 'var(--color-error-bg)',
                        borderRadius: 3,
                      }}
                    >
                      {ec}
                      {showCaretAfter && <Caret focused={focused} after />}
                    </span>
                  );
                })}
              </span>
            );
          })}
        </div>
      </div>

      <input
        ref={inputRef}
        className="typing-input absolute opacity-0 w-0 h-0 top-0 left-0"
        onKeyDown={handleKeyDown}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        readOnly
        aria-label="Typing input"
        tabIndex={0}
      />
    </div>
  );
}

function Caret({ focused, inline, after }: { focused: boolean; inline?: boolean; after?: boolean }) {
  const style: React.CSSProperties = inline
    ? {
        display: 'inline-block',
        width: 2.5,
        height: '0.85em',
        verticalAlign: 'middle',
        borderRadius: 2,
        background: 'var(--color-accent)',
        marginLeft: 1,
        boxShadow: '0 0 8px var(--color-accent-glow)',
      }
    : {
        position: 'absolute',
        [after ? 'right' : 'left']: -1,
        top: '10%',
        bottom: '10%',
        width: 2.5,
        borderRadius: 2,
        background: 'var(--color-accent)',
        boxShadow: '0 0 8px var(--color-accent-glow)',
      };

  return (
    <span
      className={focused ? 'caret-solid' : 'caret-blink'}
      style={style}
    />
  );
}
