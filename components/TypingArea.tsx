'use client';
import { useEffect, useRef, useCallback, useState } from 'react';

interface Props {
  text: string;
  typed: string;
  onType: (typed: string) => void;
  active: boolean;
  practiceMode?: boolean;
  fontSize?: number;
}

export default function TypingArea({ text, typed, onType, active, practiceMode = false, fontSize = 24 }: Props) {
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
    
    // Scroll down if caret moves below line 2
    if (word.offsetTop > container.scrollTop + lineH * 1.5) {
      container.scrollTop = word.offsetTop - lineH;
    }
    // Scroll up if caret moves above current view (e.g. holding backspace)
    else if (word.offsetTop < container.scrollTop) {
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

  // Determine which word the caret belongs to
  // Rule: caret is in word[i] if caretPos is within [word.start, word.start + word.chars.length]
  // When caretPos === wordEnd (after last char, before space), it still belongs to that word
  const caretWordIdx = (() => {
    for (let i = 0; i < words.length; i++) {
      const w = words[i];
      const wordEnd = w.start + w.chars.length;
      // caret belongs to this word if it's within the word OR at the end (before space)
      if (caretPos >= w.start && caretPos <= wordEnd) return i;
      // also belongs here if user typed extra chars beyond word end (still on this word)
      if (i === words.length - 1 && caretPos > wordEnd) return i;
      const nextStart = words[i + 1]?.start ?? Infinity;
      if (caretPos > wordEnd && caretPos < nextStart) return i;
    }
    return words.length - 1;
  })();

  return (
    <div
      className="relative select-none cursor-text"
      onClick={() => inputRef.current?.focus()}
    >
      {capsLockActive && focused && (
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-[var(--color-error)]/10 text-[var(--color-error)] px-4 py-1.5 rounded-full text-[13px] font-semibold border border-[var(--color-error)]/20 backdrop-blur-md z-20 shadow-lg tracking-wide">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
          Caps Lock is ON
        </div>
      )}

      {!focused && (
        <div
          className="absolute inset-0 z-10 flex items-center justify-center rounded-xl"
          style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(2px)' }}
        >
          <p className="text-sm" style={{ color: 'var(--color-sub)' }}>
            click or press any key to focus
          </p>
        </div>
      )}

      <div
        ref={containerRef}
        className="rounded-xl px-1 py-2 overflow-hidden"
        style={{
          maxHeight: `calc(${fontSize}px * 1.9 * 3 + 1rem)`,
          lineHeight: '1.9em',
          transition: 'max-height 0.2s ease',
        }}
      >
        <div
          className="flex flex-wrap gap-x-[0.6em]"
          style={{ fontSize: `${fontSize}px`, lineHeight: '1.9em', transition: 'font-size 0.15s ease' }}
        >
          {words.map((word, wi) => {
            const wordEnd = word.start + word.chars.length;
            const isCaretWord = wi === caretWordIdx;
            const isCompleted = caretPos > wordEnd && !isCaretWord;

            // Error underline for completed words with mistakes
            const hasError = isCompleted && word.chars.some(
              (ch, ci) => typed[word.start + ci] !== ch
            );

            // Extra chars typed beyond this word (only possible on caret word)
            const extraTyped = isCaretWord && caretPos > wordEnd
              ? typed.slice(wordEnd, caretPos)
              : '';

            return (
              <span
                key={wi}
                ref={isCaretWord ? activeWordRef : undefined}
                className="relative inline-flex items-center"
                style={{
                  borderBottom: hasError ? '2px solid var(--color-error)' : '2px solid transparent',
                }}
              >
                {word.chars.map((char, ci) => {
                  const globalIdx = word.start + ci;
                  const isTyped = globalIdx < typed.length;
                  const typedChar = typed[globalIdx];

                  // Is the caret immediately BEFORE this character?
                  const showCaretBefore = isCaretWord && globalIdx === caretPos;

                  let color: string;
                  if (!isTyped) color = 'var(--color-sub)';
                  else if (typedChar === char) color = 'var(--color-correct)';
                  else color = 'var(--color-error)';

                  return (
                    <span key={ci} className="relative" style={{ color }}>
                      {showCaretBefore && <Caret focused={focused} />}
                      {char}
                    </span>
                  );
                })}

                {/* Caret after last char of this word (caretPos === wordEnd) */}
                {isCaretWord && caretPos === wordEnd && extraTyped.length === 0 && (
                  <Caret focused={focused} inline />
                )}

                {/* Extra chars beyond word length */}
                {extraTyped.split('').map((ec, ei) => {
                  const showCaretAfter = isCaretWord && wordEnd + ei + 1 === caretPos;
                  return (
                    <span
                      key={`ex-${ei}`}
                      className="relative"
                      style={{
                        color: 'var(--color-error)',
                        background: 'rgba(239,68,68,0.2)',
                        borderRadius: 2,
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

// Single caret component — one source of truth
function Caret({ focused, inline, after }: { focused: boolean; inline?: boolean; after?: boolean }) {
  const style: React.CSSProperties = inline
    ? {
        display: 'inline-block',
        width: 2,
        height: '0.8em',
        verticalAlign: 'middle',
        borderRadius: 1,
        background: 'var(--color-accent)',
        marginLeft: 1,
      }
    : {
        position: 'absolute',
        [after ? 'right' : 'left']: -1,
        top: '10%',
        bottom: '10%',
        width: 2,
        borderRadius: 1,
        background: 'var(--color-accent)',
      };

  return (
    <span
      className={focused ? 'caret-solid' : 'caret-blink'}
      style={style}
    />
  );
}
