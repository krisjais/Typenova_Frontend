'use client';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { Trophy, Medal, Flame, Crown, Users, Clock, Calendar, KeyboardIcon, FileText, BookMarked, Sparkles, X, ArrowRight } from 'lucide-react';

interface Leader {
  _id: string;
  username: string;
  bestWpm: number;
  streak: number;
  accuracy: number;
  totalTests: number;
}

const RANK_STYLES = [
  { bg: 'bg-gradient-to-r from-[#FFD700]/10 to-transparent', border: 'border-[#FFD700]/20', color: '#FFD700', icon: Crown },
  { bg: 'bg-gradient-to-r from-[#C0C0C0]/10 to-transparent', border: 'border-[#C0C0C0]/20', color: '#C0C0C0', icon: Medal },
  { bg: 'bg-gradient-to-r from-[#CD7F32]/10 to-transparent', border: 'border-[#CD7F32]/20', color: '#CD7F32', icon: Medal },
];

const CATEGORIES = [
  { id: 'All', label: 'All Categories' },
  { id: 'English', label: 'Prose' },
  { id: 'Code Snippets', label: 'Code' },
  { id: 'Quotes', label: 'Quotes' },
  { id: 'Technical Documentation', label: 'Tech Docs' },
  { id: 'Poetry', label: 'Poetry' },
];

export default function LeaderboardPage() {
  const { user } = useAuth();
  const [leaders, setLeaders] = useState<Leader[]>([]);
  const [personalRank, setPersonalRank] = useState<number>(-1);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [timeFilter, setTimeFilter] = useState<string>('all');
  const [friendsOnly, setFriendsOnly] = useState<boolean>(false);
  const [leaderboardType, setLeaderboardType] = useState<string>('global');
  const [showBanner, setShowBanner] = useState<boolean>(false);
  const [showLearnMore, setShowLearnMore] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const dismissed = localStorage.getItem('typenova-season1-banner-dismissed');
      if (!dismissed) {
        setShowBanner(true);
      }
    }
  }, []);

  const dismissBanner = () => {
    localStorage.setItem('typenova-season1-banner-dismissed', 'true');
    setShowBanner(false);
  };

  useEffect(() => {
    setLoading(true);
    api.getLeaderboard({
      category: categoryFilter === 'All' ? undefined : categoryFilter,
      timeFilter,
      friendsOnly: friendsOnly && user ? true : undefined,
      leaderboardType
    })
      .then((d: any) => {
        setLeaders(d.leaderboard || []);
        setPersonalRank(d.personalRank ?? -1);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [categoryFilter, timeFilter, friendsOnly, leaderboardType, user]);

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-8 pt-24 pb-16">
      {/* Season 1 Banner */}
      <AnimatePresence>
        {showBanner && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-8 overflow-hidden"
          >
            <div className="relative p-6 rounded-2xl border border-[var(--color-accent)]/20 bg-gradient-to-br from-[var(--color-accent-muted)]/15 via-[var(--color-accent-muted)]/5 to-transparent flex flex-col md:flex-row md:items-center justify-between gap-5 shadow-sm">
              {/* Dismiss Button */}
              <button
                onClick={dismissBanner}
                className="absolute top-4 right-4 text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors cursor-pointer border-none bg-transparent"
              >
                <X size={16} />
              </button>

              <div className="flex-1 max-w-xl">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles size={16} className="text-[var(--color-accent)]" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-[var(--color-accent)]">Game Update</span>
                </div>
                <h2 className="text-lg font-black text-[var(--color-text)] flex items-center gap-2">
                  🛡 Season 1 Begins
                </h2>
                <p className="text-xs text-[var(--color-text-secondary)] mt-1.5 leading-relaxed">
                  Welcome to Verified Competition! TypeNova now uses secure server-side verification and anti-cheat protection. To ensure fair competition, all competitive rankings have been reset. Complete an Official Test to earn your first verified ranking.
                </p>
                <button
                  onClick={() => setShowLearnMore(true)}
                  className="text-[10px] font-extrabold uppercase text-[var(--color-accent)] hover:underline mt-2.5 flex items-center gap-1 cursor-pointer border-none bg-transparent"
                >
                  Learn More <ArrowRight size={10} />
                </button>
              </div>

              <div className="shrink-0 flex items-center">
                <Link
                  href="/test"
                  className="flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-bold bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)] shadow-sm hover:shadow transition-all cursor-pointer"
                >
                  Start Official Test <ArrowRight size={12} />
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--color-accent-muted)] flex items-center justify-center">
              <Trophy size={20} className="text-[var(--color-accent)]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[var(--color-text)]">Leaderboards</h1>
              <p className="text-sm text-[var(--color-text-secondary)] mt-0.5">
                Only official tests qualify. Custom imported texts are excluded to maintain fair rankings.
              </p>
            </div>
          </div>

          {/* Time & Friends Filter Controls */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Friends Only Switch */}
            {user && (
              <button
                onClick={() => setFriendsOnly(!friendsOnly)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                  friendsOnly
                    ? 'bg-[var(--color-accent-muted)] border-[var(--color-accent)] text-[var(--color-text)]'
                    : 'bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-text)]'
                }`}
              >
                <Users size={12} />
                Friends Only
              </button>
            )}

            {/* Time Filter Dropdown/Selector */}
            <div className="flex rounded-lg p-0.5 bg-[var(--color-surface)] border border-[var(--color-border)]">
              {[
                { id: 'all', label: 'All-Time' },
                { id: 'monthly', label: 'Monthly' },
                { id: 'weekly', label: 'Weekly' },
                { id: 'daily', label: 'Daily' },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTimeFilter(t.id)}
                  className={`px-3 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
                    timeFilter === t.id
                      ? 'bg-white/[0.04] text-[var(--color-text)]'
                      : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text)]'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Leaderboard Type Tabs */}
        <div className="flex flex-wrap gap-1.5 mb-4 border-b border-[var(--color-border)] pb-3">
          {[
            { id: 'global', label: 'Global (Competitive)' },
            { id: 'practice', label: 'Guided Practice' },
            { id: 'type-racer', label: 'Type Racer' },
            { id: 'zombie-escape', label: 'Zombie Escape' },
            { id: 'nova-racer', label: 'Nova Racer' },
            { id: 'legacy', label: 'Legacy Leaderboard' }
          ].map((type) => (
            <button
              key={type.id}
              onClick={() => setLeaderboardType(type.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                leaderboardType === type.id
                  ? 'border-[var(--color-accent)] bg-[var(--color-accent-muted)]/20 text-[var(--color-text)] font-extrabold shadow-sm'
                  : 'border-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text)]'
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap gap-1.5 mb-8 border-b border-[var(--color-border)] pb-4">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategoryFilter(cat.id)}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                categoryFilter === cat.id
                  ? 'border-[var(--color-accent)]/20 bg-[var(--color-accent-muted)] text-[var(--color-accent)] font-extrabold'
                  : 'border-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text)]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Legacy Leaderboard Notice */}
        {leaderboardType === 'legacy' && (
          <div className="mb-6 p-5 rounded-2xl border border-zinc-800 bg-zinc-950/20 text-xs text-[var(--color-text-secondary)] flex gap-3.5 items-start">
            <Clock size={18} className="text-[var(--color-accent)] shrink-0 mt-0.5" />
            <div>
              <h3 className="font-extrabold text-[var(--color-text)] mb-1">Archived Legacy Rankings</h3>
              <p className="leading-relaxed">
                This leaderboard is archived. Scores shown here were recorded before the secure anti-cheat system. These rankings are no longer used for active competition.
              </p>
            </div>
          </div>
        )}

        {/* Personal Rank Notification */}
        {user && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2.5 p-4 rounded-xl border border-[var(--color-accent)]/20 bg-[var(--color-accent-muted)]/10 text-xs font-semibold text-[var(--color-accent)] mb-6"
          >
            <Sparkles size={14} />
            <span>
              Your personal rank is:{' '}
              {personalRank > 0 ? (
                <span className="font-extrabold text-base font-orbitron">#{personalRank}</span>
              ) : (
                <span className="font-extrabold text-base font-orbitron">Not Ranked</span>
              )}{' '}
              {friendsOnly ? 'among your friends' : 'worldwide'} in this filter!
            </span>
          </motion.div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex items-center gap-3 text-[var(--color-text-secondary)]">
              <div className="w-5 h-5 border-2 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin" />
              Loading Leaderboard...
            </div>
          </div>
        ) : leaders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Users size={32} className="text-[var(--color-text-secondary)] opacity-30" />
            <p className="text-xs text-[var(--color-text-secondary)]">No records found for this combination of filters.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {/* Table Header labels */}
            <div className="flex items-center justify-between px-5 text-[10px] uppercase font-bold tracking-widest text-[var(--color-text-secondary)] mb-2">
              <div className="flex items-center gap-4">
                <div className="w-8 text-center">Rank</div>
                <div>User</div>
              </div>
              <div className="flex items-center gap-12 text-right">
                <div className="w-16 hidden sm:block">Tests</div>
                <div className="w-16 hidden sm:block">Avg Acc</div>
                <div className="w-16">WPM</div>
              </div>
            </div>

            {leaders.map((l, i) => {
              const rankStyle = RANK_STYLES[i];
              const isTop3 = i < 3;
              const RankIcon = rankStyle?.icon;
              const isCurrentUser = user && l._id === user.id;

              return (
                <motion.div
                  key={l._id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03, duration: 0.3 }}
                  className={`flex items-center justify-between px-5 py-4 rounded-2xl border transition-colors hover:bg-[var(--color-card)] ${
                    isCurrentUser
                      ? 'border-[var(--color-accent)] bg-[var(--color-accent-muted)]/10 shadow-sm'
                      : isTop3
                      ? `${rankStyle.bg} ${rankStyle.border}`
                      : 'border-[var(--color-border)] bg-[var(--color-surface)]'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    {/* Rank */}
                    <div className="w-8 flex justify-center">
                      {isTop3 && RankIcon ? (
                        <RankIcon size={20} style={{ color: rankStyle.color }} strokeWidth={2} />
                      ) : (
                        <span className="text-[13px] font-bold text-[var(--color-text-secondary)] font-mono">
                          #{i + 1}
                        </span>
                      )}
                    </div>

                    {/* Avatar */}
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-[12px] font-bold uppercase"
                      style={{
                        background: isTop3 ? `${rankStyle.color}15` : 'var(--color-card)',
                        color: isTop3 ? rankStyle.color : 'var(--color-text-secondary)',
                        border: `1px solid ${isTop3 ? `${rankStyle.color}30` : 'var(--color-border)'}`,
                      }}
                    >
                      {l.username.charAt(0)}
                    </div>

                    {/* Name + streak */}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[14px] text-[var(--color-text)]">
                          {l.username}
                        </span>
                        {isCurrentUser && (
                          <span className="text-[9px] font-bold uppercase tracking-wider text-[var(--color-accent)] px-1.5 py-0.5 bg-[var(--color-accent-muted)] border border-[var(--color-accent)]/10 rounded-md">
                            You
                          </span>
                        )}
                      </div>
                      {l.streak > 0 && (
                        <div className="flex items-center gap-1 mt-0.5">
                          <Flame size={10} className="text-[var(--color-warning)]" />
                          <span className="text-[10px] text-[var(--color-text-secondary)] font-semibold">{l.streak} day streak</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* WPM & Stats */}
                  <div className="flex items-center gap-12 text-right">
                    <div className="w-16 hidden sm:block text-xs font-semibold font-mono text-[var(--color-text-secondary)]">
                      {l.totalTests || 0}
                    </div>
                    <div className="w-16 hidden sm:block text-xs font-semibold font-mono text-[var(--color-text-secondary)]">
                      {l.accuracy || 100}%
                    </div>
                    <div className="w-16 flex items-baseline justify-end gap-1">
                      <span
                        className="text-xl font-bold font-orbitron"
                        style={{ color: isTop3 ? rankStyle.color : 'var(--color-accent)' }}
                      >
                        {l.bestWpm}
                      </span>
                      <span className="text-[9px] text-[var(--color-text-secondary)] font-bold uppercase">
                        wpm
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>

      {/* Learn More Modal */}
      <AnimatePresence>
        {showLearnMore && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-md p-6 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-2xl relative"
            >
              <button
                onClick={() => setShowLearnMore(false)}
                className="absolute top-4 right-4 text-[var(--color-text-secondary)] hover:text-[var(--color-text)] border-none bg-transparent cursor-pointer"
              >
                <X size={16} />
              </button>
              
              <div className="flex items-center gap-2.5 mb-5 border-b border-[var(--color-border)] pb-3">
                <Sparkles size={18} className="text-[var(--color-accent)]" />
                <h3 className="text-md font-extrabold text-[var(--color-text)]">Season 1 & Verification</h3>
              </div>

              <div className="space-y-4 text-xs text-[var(--color-text-secondary)] leading-relaxed">
                <div>
                  <h4 className="font-extrabold text-[var(--color-text)] mb-1">Why were rankings reset?</h4>
                  <p>
                    Before the update, competitive scores were validated client-side, which permitted text modifications and speed manipulation. All previous rankings were archived to legacy status to guarantee a fair start for Season 1.
                  </p>
                </div>

                <div>
                  <h4 className="font-extrabold text-[var(--color-text)] mb-1">How does server verification work?</h4>
                  <p>
                    When starting a test, the server generates a token and hashes the text. Upon completion, the backend verifies the keystroke metrics, duration, and content matches against the original hash before saving.
                  </p>
                </div>

                <div>
                  <h4 className="font-extrabold text-[var(--color-text)] mb-1">Why don&apos;t custom texts qualify?</h4>
                  <p>
                    Custom texts are imported by users and cannot be standardized. They remain available for personal practice but do not contribute to competitive rankings or global leaderboards.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowLearnMore(false)}
                className="mt-6 w-full py-3 rounded-xl border border-[var(--color-border)] hover:bg-[var(--color-card)] text-xs font-bold text-[var(--color-text)] transition-colors cursor-pointer bg-transparent"
              >
                Close
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
