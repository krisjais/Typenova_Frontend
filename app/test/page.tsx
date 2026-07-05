'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TypingArea from '@/components/TypingArea';
import LevelUpToast from '@/components/LevelUpToast';
import { calcWPM, calcAccuracy, analyzeWeakKeys, getTextForLevel, LEVEL_THRESHOLDS, Level } from '@/utils/typing';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useLevel } from '@/context/LevelContext';
import {
  RotateCcw,
  Gauge,
  Keyboard as KeyboardIcon,
  Sprout,
  Zap,
  Flame,
  Hash,
  Clock,
  ArrowRight,
  Target,
  AlertTriangle,
  CheckCircle,
  Plus,
  Trash2,
  Globe,
  FileText,
  Check,
  BookOpen,
  X,
  Loader,
  BookMarked
} from 'lucide-react';
import FontSizeControl, { useFontSize } from '@/components/FontSizeControl';
import LiveKeyboard from '@/components/LiveKeyboard';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from 'recharts';
import { PRACTICE_TEXTS, PracticeText, computeTextStats } from '@/utils/practiceContent';

const TIME_OPTIONS = [15, 30, 60, 120];
const WORD_OPTIONS = [10, 25, 50, 100];
type TestMode = 'time' | 'words';

const LEVEL_ICONS = { beginner: Sprout, intermediate: Zap, pro: Flame };
const LEVEL_COLORS = { beginner: '#34d399', intermediate: '#fbbf24', pro: '#f87171' };

const LANGUAGES = [
  { code: 'English', label: 'English' },
  { code: 'Spanish', label: 'Español' },
  { code: 'French', label: 'Français' },
  { code: 'German', label: 'Deutsch' },
  { code: 'Japanese', label: '日本語 (Romaji)' },
  { code: 'Chinese', label: '中文 (Pinyin)' },
];

const CATEGORIES = [
  { id: 'English', label: 'General Prose', icon: BookOpen },
  { id: 'Code Snippets', label: 'Code Snippets', icon: KeyboardIcon },
  { id: 'Quotes', label: 'Quotes', icon: BookMarked },
  { id: 'Technical Documentation', label: 'Tech Docs', icon: FileText },
  { id: 'Poetry', label: 'Poetry', icon: Sprout },
  { id: 'Custom', label: 'Custom Texts', icon: Plus },
];

export default function TestPage() {
  const { user } = useAuth();
  const { level, checkAndPromote } = useLevel();
  const effectiveLevel: Level = level || 'intermediate';
  const { size: fontSize, increase, decrease } = useFontSize();

  const [mode, setMode] = useState<TestMode>('time');
  const [timeDuration, setTimeDuration] = useState(30);
  const [wordCount, setWordCount] = useState(25);
  const [text, setText] = useState('');
  const [typed, setTyped] = useState('');
  const [timeLeft, setTimeLeft] = useState(30);
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [wpmHistory, setWpmHistory] = useState<{ t: number; wpm: number }[]>([]);
  const [promotedTo, setPromotedTo] = useState<Level | null>(null);
  const [showKeyboard, setShowKeyboard] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const elapsedRef = useRef(0);

  // Content Selection states
  const [selectedCategory, setSelectedCategory] = useState<string>('English');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All');
  const [language, setLanguage] = useState<string>('English');
  const [customTexts, setCustomTexts] = useState<any[]>([]);
  const [activePracticeText, setActivePracticeText] = useState<PracticeText | null>(null);

  // Upload modal states
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newDifficulty, setNewDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Easy');
  const [newLanguage, setNewLanguage] = useState('English');
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const elapsed = mode === 'time' ? timeDuration - timeLeft : elapsedRef.current;
  const typedChars = typed.split('');
  const correctChars = typedChars.filter((c, i) => c === text[i]).length;
  const wpm = calcWPM(correctChars, elapsed);
  const accuracy = calcAccuracy(correctChars, typed.length);
  const errors = typedChars.filter((c, i) => c !== text[i]).length;
  const isComplete = mode === 'words' && typed.length >= text.length;

  // Fetch language preference and custom texts if user logged in
  useEffect(() => {
    if (user) {
      api.getLanguage()
        .then((res: any) => {
          if (res && res.language) setLanguage(res.language);
        })
        .catch(console.error);

      api.getCustomTexts()
        .then((res: any) => {
          if (Array.isArray(res)) setCustomTexts(res);
        })
        .catch(console.error);
    }
  }, [user]);

  // Generate fallback text if no activePracticeText is selected
  const generateText = useCallback(() => {
    const count = mode === 'words' ? wordCount : 40;
    return getTextForLevel(effectiveLevel, count);
  }, [mode, wordCount, effectiveLevel]);

  // Filter texts based on category, language, and difficulty
  const getFilteredTexts = useCallback(() => {
    if (selectedCategory === 'Custom') {
      return customTexts.filter((t) => {
        const matchesLang = t.language === language;
        const matchesDiff = selectedDifficulty === 'All' || t.difficulty === selectedDifficulty;
        return matchesLang && matchesDiff;
      });
    }

    return PRACTICE_TEXTS.filter((t) => {
      const matchesCat = t.category === selectedCategory;
      const matchesLang = t.language === language;
      const matchesDiff = selectedDifficulty === 'All' || t.difficulty === selectedDifficulty;
      return matchesCat && matchesLang && matchesDiff;
    });
  }, [selectedCategory, selectedDifficulty, language, customTexts]);

  // Handle switching categories/difficulties to auto-select matching text
  useEffect(() => {
    const matches = getFilteredTexts();
    if (matches.length > 0) {
      const currentStillValid = matches.some(
        (m) => (m.id && m.id === activePracticeText?.id) || (m._id && m._id === (activePracticeText as any)?._id)
      );
      if (!currentStillValid) {
        setActivePracticeText(matches[0]);
      }
    } else {
      setActivePracticeText(null);
    }
  }, [selectedCategory, selectedDifficulty, language, customTexts, getFilteredTexts]);

  // Reset when settings or active text changes
  useEffect(() => {
    reset();
  }, [mode, timeDuration, wordCount, effectiveLevel, activePracticeText]);

  // Timer
  useEffect(() => {
    if (!started || finished) return;

    intervalRef.current = setInterval(() => {
      elapsedRef.current += 1;
      const currentCorrect = typed.split('').filter((c, i) => c === text[i]).length;
      const currentWpm = calcWPM(currentCorrect, elapsedRef.current);
      setWpmHistory((h) => [...h, { t: elapsedRef.current, wpm: currentWpm }]);

      if (mode === 'time') {
        setTimeLeft((t) => {
          if (t <= 1) {
            clearInterval(intervalRef.current!);
            setFinished(true);
            return 0;
          }
          return t - 1;
        });
      }
    }, 1000);

    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [started, finished, mode, text]);

  // Words mode completion
  useEffect(() => {
    if (isComplete && !finished) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setFinished(true);
    }
  }, [isComplete, finished]);

  // Save on finish
  useEffect(() => {
    if (!finished || !started) return;
    const analysis = analyzeWeakKeys(typed, text);
    if (user) {
      api.saveStats({
        wpm, accuracy, errors,
        mode: 'test',
        duration: mode === 'time' ? timeDuration : elapsedRef.current,
        weakKeys: Object.entries(analysis).map(([key, v]) => ({ key, ...v })),
      }).then(() => {
        api.getStats().then((d) => {
          const stats = (d as { stats: { wpm: number }[] }).stats || [];
          const promoted = checkAndPromote(stats.slice(-10).map((s) => s.wpm));
          if (promoted) setPromotedTo(promoted);
        }).catch(() => {});
      }).catch(console.error);
    }
  }, [finished, started, wpm, accuracy, errors, mode, timeDuration, text, typed, user, checkAndPromote]);

  // Pause timer when switching tabs
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      } else {
        if (started && !finished && intervalRef.current === null) {
          intervalRef.current = setInterval(() => {
            elapsedRef.current += 1;
            const currentCorrect = typed.split('').filter((c, i) => c === text[i]).length;
            const currentWpm = calcWPM(currentCorrect, elapsedRef.current);
            setWpmHistory((h) => [...h, { t: elapsedRef.current, wpm: currentWpm }]);
            if (mode === 'time') {
              setTimeLeft((t) => {
                if (t <= 1) {
                  clearInterval(intervalRef.current!);
                  intervalRef.current = null;
                  setFinished(true);
                  return 0;
                }
                return t - 1;
              });
            }
          }, 1000);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [started, finished, mode, typed, text]);

  // Tab to restart
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Tab') { e.preventDefault(); reset(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [activePracticeText]);

  const handleType = useCallback((t: string) => {
    if (finished) return;
    if (!started) setStarted(true);
    setTyped(t);
  }, [started, finished]);

  const reset = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    elapsedRef.current = 0;
    setTimeLeft(timeDuration);
    if (activePracticeText) {
      setText(activePracticeText.content);
    } else {
      setText(generateText());
    }
    setTyped('');
    setStarted(false);
    setFinished(false);
    setWpmHistory([]);
  };

  const handleLanguageChange = async (lang: string) => {
    setLanguage(lang);
    if (user) {
      try {
        await api.saveLanguage({ language: lang });
      } catch (err) {
        console.error('Failed to save language preference:', err);
      }
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) {
      setErrorMsg('Please fill in all fields.');
      return;
    }
    if (newContent.length > 5000) {
      setErrorMsg('Text content exceeds 5,000 characters limit.');
      return;
    }
    setIsSaving(true);
    setErrorMsg('');
    try {
      const res = await api.createCustomText({
        title: newTitle,
        content: newContent,
        difficulty: newDifficulty,
        language: newLanguage,
      });
      setCustomTexts((prev) => [res as any, ...prev]);
      setActivePracticeText(res as any);
      setShowUploadModal(false);
      setNewTitle('');
      setNewContent('');
      setNewDifficulty('Easy');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save text.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteCustomText = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this custom text?')) return;
    try {
      await api.deleteCustomText(id);
      setCustomTexts((prev) => prev.filter((t) => t._id !== id));
      if (activePracticeText && (activePracticeText as any)._id === id) {
        setActivePracticeText(null);
      }
    } catch (err) {
      console.error('Failed to delete custom text:', err);
    }
  };

  const LevelIcon = level ? LEVEL_ICONS[level] : null;
  const levelColor = level ? LEVEL_COLORS[level] : '';

  const filteredTexts = getFilteredTexts();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 pt-24 pb-12">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-4xl"
      >
        {!finished ? (
          <>
            {/* ─── CONTENT SELECTION HUB ─── */}
            <AnimatePresence>
              {!started && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  className="mb-8 overflow-hidden"
                >
                  <div className="glass-card p-6 mb-2">
                    {/* Top row: Category Selection & Language Dropdown */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--color-border)] pb-5 mb-5">
                      <div>
                        <h2 className="text-xl font-bold tracking-tight text-[var(--color-text)] mb-1">
                          Practice Hub
                        </h2>
                        <p className="text-xs text-[var(--color-text-secondary)]">
                          Choose curated texts or upload your own to test your typing skills.
                        </p>
                      </div>

                      {/* Language Switcher */}
                      <div className="flex items-center gap-2">
                        <Globe size={14} className="text-[var(--color-text-secondary)]" />
                        <span className="text-xs font-semibold text-[var(--color-text-secondary)]">Language:</span>
                        <select
                          value={language}
                          onChange={(e) => handleLanguageChange(e.target.value)}
                          className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg px-3 py-1.5 text-xs text-[var(--color-text)] font-semibold cursor-pointer hover:border-[var(--color-border-hover)] transition-colors focus:ring-1 focus:ring-[var(--color-accent)]"
                        >
                          {LANGUAGES.map((l) => (
                            <option key={l.code} value={l.code}>
                              {l.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Category tabs */}
                    <div className="flex flex-wrap gap-2 mb-6">
                      {CATEGORIES.map((cat) => {
                        const Icon = cat.icon;
                        const isSelected = selectedCategory === cat.id;
                        return (
                          <button
                            key={cat.id}
                            onClick={() => setSelectedCategory(cat.id)}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer"
                            style={{
                              borderColor: isSelected ? 'var(--color-accent)' : 'var(--color-border)',
                              background: isSelected ? 'var(--color-accent-muted)' : 'var(--color-surface)',
                              color: isSelected ? 'var(--color-text)' : 'var(--color-text-secondary)',
                            }}
                          >
                            <Icon size={14} />
                            {cat.label}
                          </button>
                        );
                      })}
                    </div>

                    {/* Dashboard Layout: Left = List of texts, Right = Active Preview & Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                      {/* Left: Texts List & Difficulty Filter */}
                      <div className="md:col-span-5 flex flex-col">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-xs uppercase font-bold tracking-widest text-[var(--color-text-secondary)]">
                            Select Text
                          </span>

                          {/* Difficulty Filter */}
                          <div className="flex gap-1 bg-[var(--color-surface)] p-0.5 rounded-lg border border-[var(--color-border)]">
                            {['All', 'Easy', 'Medium', 'Hard'].map((diff) => (
                              <button
                                key={diff}
                                onClick={() => setSelectedDifficulty(diff)}
                                className={`px-2 py-1 rounded text-[10px] font-bold cursor-pointer transition-colors ${
                                  selectedDifficulty === diff
                                    ? 'bg-[var(--color-accent-muted)] text-[var(--color-accent)] font-extrabold'
                                    : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text)]'
                                }`}
                              >
                                {diff}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* List items */}
                        <div className="max-h-[260px] overflow-y-auto pr-1 flex flex-col gap-2 scrollbar-thin">
                          {selectedCategory === 'Custom' && (
                            <button
                              onClick={() => {
                                if (!user) {
                                  alert('Please sign in or register to create and store custom texts.');
                                  return;
                                }
                                setShowUploadModal(true);
                              }}
                              className="flex items-center justify-center gap-2 p-3 rounded-xl border border-dashed border-[var(--color-accent)]/30 bg-[var(--color-accent-muted)]/10 text-[var(--color-accent)] text-xs font-semibold hover:bg-[var(--color-accent-muted)]/20 transition-all cursor-pointer"
                            >
                              <Plus size={14} />
                              Add Custom Text
                            </button>
                          )}

                          {filteredTexts.length > 0 ? (
                            filteredTexts.map((item) => {
                              const itemId = item.id || item._id;
                              const isSelected =
                                activePracticeText &&
                                ((item.id && activePracticeText.id === item.id) ||
                                  (item._id && (activePracticeText as any)._id === item._id));

                              const diffColors: Record<string, string> = {
                                Easy: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
                                Medium: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
                                Hard: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
                              };

                              return (
                                <div
                                  key={itemId}
                                  onClick={() => setActivePracticeText(item)}
                                  className={`flex items-start justify-between p-3 rounded-xl border transition-all cursor-pointer text-left ${
                                    isSelected
                                      ? 'border-[var(--color-accent)] bg-[var(--color-accent-muted)]/10 shadow-sm'
                                      : 'border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-border-hover)]'
                                  }`}
                                >
                                  <div className="flex flex-col gap-1 w-full mr-2">
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs font-bold text-[var(--color-text)] truncate max-w-[120px]">
                                        {item.title}
                                      </span>
                                      <span className={`text-[9px] px-1.5 py-0.5 rounded border font-semibold ${diffColors[item.difficulty]}`}>
                                        {item.difficulty}
                                      </span>
                                    </div>
                                    <p className="text-[10px] text-[var(--color-text-secondary)] line-clamp-1">
                                      {item.content}
                                    </p>
                                  </div>

                                  <div className="flex items-center gap-1.5">
                                    <span className="text-[10px] text-[var(--color-text-secondary)] font-mono whitespace-nowrap">
                                      {item.wordCount} words
                                    </span>
                                    {selectedCategory === 'Custom' && (
                                      <button
                                        onClick={(e) => handleDeleteCustomText(itemId, e)}
                                        className="p-1 rounded-md text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                                        title="Delete text"
                                      >
                                        <Trash2 size={12} />
                                      </button>
                                    )}
                                  </div>
                                </div>
                              );
                            })
                          ) : (
                            <div className="p-6 text-center text-xs text-[var(--color-text-secondary)] border border-[var(--color-border)] rounded-xl bg-[var(--color-surface)]">
                              No texts available. Change filters or add new content.
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right: Active Preview & Statistics */}
                      <div className="md:col-span-7 flex flex-col justify-between">
                        {activePracticeText ? (
                          <div className="flex flex-col h-full justify-between">
                            <div>
                              <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-2 mb-3">
                                <span className="text-xs uppercase font-bold tracking-widest text-[var(--color-text-secondary)]">
                                  Text Details
                                </span>
                                <span className="text-xs font-semibold text-[var(--color-accent)]">
                                  {activePracticeText.category}
                                </span>
                              </div>

                              <div className="flex items-center justify-between mb-4">
                                <h3 className="text-sm font-extrabold text-[var(--color-text)]">
                                  {activePracticeText.title}
                                </h3>
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] text-[var(--color-text-secondary)] px-2 py-0.5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-md">
                                    {activePracticeText.language}
                                  </span>
                                  <span
                                    className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                                      activePracticeText.difficulty === 'Easy'
                                        ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                                        : activePracticeText.difficulty === 'Medium'
                                        ? 'text-amber-400 bg-amber-500/10 border-amber-500/20'
                                        : 'text-rose-400 bg-rose-500/10 border-rose-500/20'
                                    }`}
                                  >
                                    {activePracticeText.difficulty}
                                  </span>
                                </div>
                              </div>

                              {/* Stats grid */}
                              <div className="grid grid-cols-5 gap-2 mb-4">
                                <div className="p-2 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-center">
                                  <div className="text-[10px] text-[var(--color-text-secondary)] uppercase tracking-wider mb-0.5">Words</div>
                                  <div className="text-xs font-bold font-mono">{activePracticeText.wordCount}</div>
                                </div>
                                <div className="p-2 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-center">
                                  <div className="text-[10px] text-[var(--color-text-secondary)] uppercase tracking-wider mb-0.5">Chars</div>
                                  <div className="text-xs font-bold font-mono">{activePracticeText.content.length}</div>
                                </div>
                                <div className="p-2 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-center">
                                  <div className="text-[10px] text-[var(--color-text-secondary)] uppercase tracking-wider mb-0.5">Avg Len</div>
                                  <div className="text-xs font-bold font-mono">{activePracticeText.avgWordLength}</div>
                                </div>
                                <div className="p-2 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-center">
                                  <div className="text-[10px] text-[var(--color-text-secondary)] uppercase tracking-wider mb-0.5">Special</div>
                                  <div className="text-xs font-bold font-mono">{activePracticeText.specialCharCount}</div>
                                </div>
                                <div className="p-2 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-center">
                                  <div className="text-[10px] text-[var(--color-text-secondary)] uppercase tracking-wider mb-0.5">Est. Time</div>
                                  <div className="text-xs font-bold font-mono text-[var(--color-accent)]">
                                    {Math.max(15, Math.round((activePracticeText.wordCount / 60) * 60))}s
                                  </div>
                                </div>
                              </div>

                              {/* Content Preview */}
                              <div className="relative p-4 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] font-mono text-xs text-[var(--color-text-secondary)] leading-relaxed h-[84px] overflow-hidden select-none">
                                <div className="line-clamp-3">
                                  {activePracticeText.content}
                                </div>
                                <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-[var(--color-surface)] to-transparent pointer-events-none" />
                              </div>
                            </div>

                            <p className="text-[11px] text-[var(--color-text-secondary)] font-medium mt-3 italic opacity-60 text-center">
                              * Focus the input box below and start typing to begin the test!
                            </p>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center h-full border border-dashed border-[var(--color-border)] rounded-xl p-8 text-center bg-[var(--color-surface)]/50">
                            <AlertTriangle size={24} className="text-[var(--color-text-secondary)] mb-2" />
                            <p className="text-xs text-[var(--color-text-secondary)]">
                              No text selected. Select a text on the left to review stats and start practicing.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Toolbar */}
            <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
              {/* Mode toggle */}
              <div className="flex rounded-xl p-1 bg-[var(--color-surface)] border border-[var(--color-border)]">
                {(['time', 'words'] as TestMode[]).map((m) => (
                  <button
                    key={m}
                    onClick={() => setMode(m)}
                    className="relative px-4 py-2 text-[12px] font-semibold tracking-widest capitalize rounded-lg transition-all cursor-pointer"
                    style={{
                      background: mode === m ? 'var(--color-accent)' : 'transparent',
                      color: mode === m ? '#fff' : 'var(--color-text-secondary)',
                    }}
                  >
                    <span className="flex items-center gap-1.5">
                      {m === 'time' ? <Clock size={13} /> : <Hash size={13} />}
                      {m}
                    </span>
                  </button>
                ))}
              </div>

              {/* Options */}
              <div className="flex rounded-xl p-1 bg-[var(--color-surface)] border border-[var(--color-border)] gap-1">
                {/* For words mode, if a curated/custom text is selected, we disable the word count selection since the text length is predefined */}
                {mode === 'words' && activePracticeText ? (
                  <div className="px-3 py-2 rounded-lg text-[12px] font-bold text-[var(--color-accent)] bg-[var(--color-accent-muted)]">
                    Entire Text ({activePracticeText.wordCount} words)
                  </div>
                ) : (
                  (mode === 'time' ? TIME_OPTIONS : WORD_OPTIONS).map((opt) => {
                    const isActive = mode === 'time' ? opt === timeDuration : opt === wordCount;
                    return (
                      <button
                        key={opt}
                        onClick={() => (mode === 'time' ? setTimeDuration(opt) : setWordCount(opt))}
                        className="px-3 py-2 rounded-lg text-[12px] font-bold transition-all cursor-pointer"
                        style={{
                          color: isActive ? 'var(--color-accent)' : 'var(--color-text-secondary)',
                          background: isActive ? 'var(--color-accent-muted)' : 'transparent',
                        }}
                      >
                        {opt}
                      </button>
                    );
                  })
                )}
              </div>

              {/* Level badge */}
              {LevelIcon && level && (
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)]">
                  <LevelIcon size={14} style={{ color: levelColor }} />
                  <span className="text-[12px] font-semibold tracking-widest uppercase text-[var(--color-text-secondary)]">
                    {LEVEL_THRESHOLDS[level].label}
                  </span>
                </div>
              )}

              {/* Font size */}
              <div className="flex items-center h-9 px-3 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)]">
                <FontSizeControl size={fontSize} increase={increase} decrease={decrease} />
              </div>
            </div>

            {/* Live stats */}
            <div className="flex justify-center items-center gap-8 mb-10">
              <StatInline label="WPM" value={started ? wpm : 0} active={started} color="var(--color-accent)" />
              <div className="w-px h-6 bg-[var(--color-border)]" />
              <StatInline
                label="ACC"
                value={started ? `${accuracy}%` : '0%'}
                active={started}
                color={started ? (accuracy >= 90 ? 'var(--color-success)' : 'var(--color-warning)') : 'var(--color-text-secondary)'}
              />
              {mode === 'time' && (
                <>
                  <div className="w-px h-6 bg-[var(--color-border)]" />
                  <StatInline
                    label="TIME"
                    value={timeLeft}
                    active={true}
                    color={timeLeft <= 5 ? 'var(--color-error)' : 'var(--color-text)'}
                  />
                </>
              )}
            </div>

            {/* Typing area */}
            <TypingArea text={text} typed={typed} onType={handleType} active={!finished} fontSize={fontSize} />

            {/* Controls */}
            <div className="flex items-center justify-center gap-4 mt-8">
              <button
                onClick={reset}
                className="flex items-center gap-2 text-[13px] text-[var(--color-text-secondary)] opacity-40 hover:opacity-70 transition-opacity cursor-pointer"
              >
                <RotateCcw size={13} />
                <span>tab — restart</span>
              </button>
              <div className="w-px h-4 bg-[var(--color-border)]" />
              <button
                onClick={() => setShowKeyboard(!showKeyboard)}
                className="flex items-center gap-2 text-[13px] transition-opacity cursor-pointer"
                style={{
                  color: showKeyboard ? 'var(--color-accent)' : 'var(--color-text-secondary)',
                  opacity: showKeyboard ? 1 : 0.4,
                }}
              >
                <KeyboardIcon size={13} />
                <span>{showKeyboard ? 'Hide' : 'Show'} Keyboard</span>
              </button>
            </div>

            {/* Collapsible Keyboard */}
            <AnimatePresence>
              {showKeyboard && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  className="overflow-hidden mt-6"
                >
                  <LiveKeyboard active={started} />
                </motion.div>
              )}
            </AnimatePresence>
          </>
        ) : (
          /* Result Screen */
          <ResultScreen
            wpm={wpm}
            accuracy={accuracy}
            errors={errors}
            elapsed={mode === 'time' ? timeDuration : elapsedRef.current}
            correct={correctChars}
            wpmHistory={wpmHistory}
            mode={mode}
            onRetry={reset}
          />
        )}
      </motion.div>

      {promotedTo && <LevelUpToast newLevel={promotedTo} onClose={() => setPromotedTo(null)} />}

      {/* ─── UPLOAD CUSTOM TEXT MODAL ─── */}
      <AnimatePresence>
        {showUploadModal && (
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowUploadModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="glass relative w-full max-w-lg p-6 rounded-2xl border border-[var(--color-border)] shadow-2xl z-10 flex flex-col"
            >
              <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3 mb-4">
                <h3 className="text-base font-bold text-[var(--color-text)] flex items-center gap-2">
                  <Plus size={16} className="text-[var(--color-accent)]" />
                  Add Custom Text
                </h3>
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="p-1 rounded-md text-[var(--color-text-secondary)] hover:bg-[var(--color-surface)] transition-colors cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              {errorMsg && (
                <div className="mb-4 p-3 rounded-xl border border-rose-500/20 bg-rose-500/10 text-xs text-rose-400 flex items-center gap-2">
                  <AlertTriangle size={14} />
                  {errorMsg}
                </div>
              )}

              <form onSubmit={handleUploadSubmit} className="flex flex-col gap-4">
                {/* Title */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase font-bold tracking-wider text-[var(--color-text-secondary)]">
                    Text Title
                  </label>
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. React Hook Tutorial, Famous Quote"
                    className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl px-4 py-2.5 text-xs text-[var(--color-text)]"
                    maxLength={100}
                    required
                  />
                </div>

                {/* Content */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] uppercase font-bold tracking-wider text-[var(--color-text-secondary)]">
                      Text Content
                    </label>
                    <span className="text-[9px] text-[var(--color-text-secondary)]">
                      {newContent.length} / 5,000 chars
                    </span>
                  </div>
                  <textarea
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                    placeholder="Paste or type your custom content here..."
                    className="w-full min-h-[140px] bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl px-4 py-3 text-xs text-[var(--color-text)] font-mono resize-none leading-relaxed"
                    maxLength={5000}
                    required
                  />
                </div>

                {/* Difficulty & Language row */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase font-bold tracking-wider text-[var(--color-text-secondary)]">
                      Difficulty
                    </label>
                    <select
                      value={newDifficulty}
                      onChange={(e) => setNewDifficulty(e.target.value as any)}
                      className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl px-4 py-2.5 text-xs text-[var(--color-text)] cursor-pointer"
                    >
                      <option value="Easy">Easy</option>
                      <option value="Medium">Medium</option>
                      <option value="Hard">Hard</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase font-bold tracking-wider text-[var(--color-text-secondary)]">
                      Language
                    </label>
                    <select
                      value={newLanguage}
                      onChange={(e) => setNewLanguage(e.target.value)}
                      className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl px-4 py-2.5 text-xs text-[var(--color-text)] cursor-pointer"
                    >
                      {LANGUAGES.map((l) => (
                        <option key={l.code} value={l.code}>
                          {l.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-2 border-t border-[var(--color-border)] pt-4 mt-2">
                  <button
                    type="button"
                    onClick={() => setShowUploadModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold border border-[var(--color-border)] text-[var(--color-text)] hover:bg-white/[0.04] transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)] transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
                  >
                    {isSaving ? (
                      <>
                        <Loader size={12} className="animate-spin" />
                        Saving...
                      </>
                    ) : (
                      'Save Custom Text'
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StatInline({ label, value, active, color }: { label: string; value: string | number; active: boolean; color: string }) {
  return (
    <div className="flex items-baseline gap-2">
      <span
        className="text-2xl md:text-3xl font-bold tabular-nums tracking-tight transition-colors duration-300"
        style={{ color: active ? color : 'var(--color-text-secondary)', opacity: active ? 1 : 0.4 }}
      >
        {value}
      </span>
      <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-[var(--color-text-secondary)]">
        {label}
      </span>
    </div>
  );
}

// ── Result Screen ──────────────────────────────────────────────────────────────
function ResultScreen({
  wpm, accuracy, errors, elapsed, correct, wpmHistory, mode, onRetry,
}: {
  wpm: number; accuracy: number; errors: number; elapsed: number;
  correct: number; wpmHistory: { t: number; wpm: number }[];
  mode: string; onRetry: () => void;
}) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        onRetry();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onRetry]);

  const statItems = [
    { label: 'WPM', value: wpm, color: 'var(--color-accent)', icon: Gauge, big: true },
    { label: 'Accuracy', value: `${accuracy}%`, color: accuracy >= 90 ? 'var(--color-success)' : 'var(--color-warning)', icon: Target, big: true },
    { label: 'Correct', value: correct, color: 'var(--color-success)', icon: CheckCircle, big: false },
    { label: 'Errors', value: errors, color: errors === 0 ? 'var(--color-success)' : 'var(--color-error)', icon: AlertTriangle, big: false },
    { label: 'Time', value: `${elapsed}s`, color: 'var(--color-text)', icon: Clock, big: false },
    { label: 'Mode', value: mode, color: 'var(--color-text-secondary)', icon: Gauge, big: false },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
        {statItems.map((s) => (
          <div
            key={s.label}
            className="p-5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] transition-colors hover:bg-[var(--color-card)]"
          >
            <div className="flex items-center gap-2 mb-3">
              <s.icon size={14} style={{ color: s.color }} strokeWidth={1.8} />
              <span className="text-[11px] uppercase tracking-widest text-[var(--color-text-secondary)] font-semibold">{s.label}</span>
            </div>
            <div className={`font-bold ${s.big ? 'text-4xl' : 'text-2xl'}`} style={{ color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* WPM over time chart */}
      {wpmHistory.length > 2 && (
        <div className="mb-8 p-5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]">
          <p className="text-[12px] mb-4 uppercase tracking-widest text-[var(--color-text-secondary)] font-semibold">WPM over time</p>
          <ResponsiveContainer width="100%" height={140}>
            <LineChart data={wpmHistory}>
              <XAxis dataKey="t" stroke="rgba(255,255,255,0.1)" tick={{ fontSize: 10, fill: 'var(--color-text-secondary)' }} tickFormatter={(v) => `${v}s`} />
              <YAxis stroke="rgba(255,255,255,0.1)" tick={{ fontSize: 10, fill: 'var(--color-text-secondary)' }} />
              <Tooltip
                contentStyle={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 12, fontSize: 12, color: 'var(--color-text)' }}
                formatter={(v) => [`${v} wpm`]}
                labelFormatter={(l) => `${l}s`}
              />
              <Line type="monotone" dataKey="wpm" stroke="var(--color-accent)" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="flex justify-center gap-3">
        <button
          onClick={onRetry}
          className="group flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-[14px] bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)] transition-colors shadow-sm cursor-pointer"
        >
          <RotateCcw size={14} />
          Try Again
          <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>
      <p className="text-center text-[13px] mt-3 text-[var(--color-text-secondary)] opacity-50">tab — restart</p>
    </motion.div>
  );
}

