'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { api } from '@/lib/api';
import { Trophy, Medal, Flame, Crown, Award, Users } from 'lucide-react';

interface Leader {
  _id: string;
  username: string;
  bestWpm: number;
  streak: number;
}

const RANK_STYLES = [
  { bg: 'bg-gradient-to-r from-[#FFD700]/10 to-transparent', border: 'border-[#FFD700]/20', color: '#FFD700', icon: Crown },
  { bg: 'bg-gradient-to-r from-[#C0C0C0]/10 to-transparent', border: 'border-[#C0C0C0]/20', color: '#C0C0C0', icon: Medal },
  { bg: 'bg-gradient-to-r from-[#CD7F32]/10 to-transparent', border: 'border-[#CD7F32]/20', color: '#CD7F32', icon: Medal },
];

export default function LeaderboardPage() {
  const [leaders, setLeaders] = useState<Leader[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getLeaderboard()
      .then((d) => setLeaders(d as Leader[]))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-8 pt-24 pb-16">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 rounded-xl bg-[var(--color-accent-muted)] flex items-center justify-center">
            <Trophy size={20} className="text-[var(--color-accent)]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[var(--color-text)]">Leaderboard</h1>
            <p className="text-sm text-[var(--color-text-secondary)]">Top typists worldwide</p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex items-center gap-3 text-[var(--color-text-secondary)]">
              <div className="w-5 h-5 border-2 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin" />
              Loading...
            </div>
          </div>
        ) : leaders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Users size={32} className="text-[var(--color-text-secondary)] opacity-30" />
            <p className="text-[var(--color-text-secondary)]">No entries yet. Be the first!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {leaders.map((l, i) => {
              const rankStyle = RANK_STYLES[i];
              const isTop3 = i < 3;
              const RankIcon = rankStyle?.icon;

              return (
                <motion.div
                  key={l._id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04, duration: 0.3 }}
                  className={`flex items-center justify-between px-5 py-4 rounded-2xl border transition-colors hover:bg-[var(--color-card)] ${
                    isTop3
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
                        <span className="text-[14px] font-semibold text-[var(--color-text-secondary)]">
                          #{i + 1}
                        </span>
                      )}
                    </div>

                    {/* Avatar */}
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-[13px] font-bold"
                      style={{
                        background: isTop3 ? `${rankStyle.color}15` : 'var(--color-card)',
                        color: isTop3 ? rankStyle.color : 'var(--color-text-secondary)',
                        border: `1px solid ${isTop3 ? `${rankStyle.color}30` : 'var(--color-border)'}`,
                      }}
                    >
                      {l.username.charAt(0).toUpperCase()}
                    </div>

                    {/* Name + streak */}
                    <div>
                      <span className="font-semibold text-[15px] text-[var(--color-text)]">{l.username}</span>
                      {l.streak > 0 && (
                        <div className="flex items-center gap-1 mt-0.5">
                          <Flame size={11} className="text-[var(--color-warning)]" />
                          <span className="text-[11px] text-[var(--color-text-secondary)]">{l.streak} day streak</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* WPM */}
                  <div className="text-right">
                    <span
                      className="text-xl font-bold"
                      style={{ color: isTop3 ? rankStyle.color : 'var(--color-accent)' }}
                    >
                      {l.bestWpm}
                    </span>
                    <span className="text-[11px] ml-1.5 text-[var(--color-text-secondary)] font-medium uppercase tracking-wider">
                      WPM
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>
    </div>
  );
}
