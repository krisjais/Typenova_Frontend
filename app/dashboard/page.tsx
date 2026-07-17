'use client';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { useLevel } from '@/context/LevelContext';
import { api } from '@/lib/api';
import { Level, LEVEL_THRESHOLDS } from '@/utils/typing';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar,
} from 'recharts';
import Link from 'next/link';
import {
  Sprout,
  Zap,
  Flame,
  BarChart3,
  Target,
  Percent,
  TrendingUp,
  Award,
  ArrowRight,
  Trophy,
  Users,
  Share2,
  Copy,
  Check,
  UserPlus,
  Clock,
  Sparkles
} from 'lucide-react';
import LevelSelectModal from '@/components/LevelSelectModal';

interface Stat {
  _id?: string;
  wpm: number;
  accuracy: number;
  errors: number;
  mode: string;
  date: string;
}

interface WeakKey {
  key: string;
  errorCount: number;
  totalCount: number;
}

interface StatsData {
  stats: Stat[];
  weakKeys: WeakKey[];
  bestWpm: number;
  streak: number;
  achievements?: { name: string; unlockedAt: string }[];
  raceWins?: number;
  raceLosses?: number;
}

const LEVEL_ICONS = { beginner: Sprout, intermediate: Zap, pro: Flame };
const LEVEL_COLORS = { beginner: '#34d399', intermediate: '#fbbf24', pro: '#f87171' };

const ACHIEVEMENT_LIST = [
  { name: 'First Blood', desc: 'Win your first multiplayer race', icon: Trophy, color: 'text-amber-400 border-amber-500/20 bg-amber-500/5' },
  { name: 'Speed Demon', desc: 'Reach 100+ WPM in a typing test', icon: Zap, color: 'text-purple-400 border-purple-500/20 bg-purple-500/5' },
  { name: 'Perfect Form', desc: 'Achieve 99%+ accuracy in a test', icon: Target, color: 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5' },
  { name: 'Consistent', desc: 'Complete 100 typing tests', icon: Award, color: 'text-sky-400 border-sky-500/20 bg-sky-500/5' },
  { name: 'Speedster Streak', desc: 'Maintain a 5-day practice streak', icon: Flame, color: 'text-rose-400 border-rose-500/20 bg-rose-500/5' },
];

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const { level, setLevel } = useLevel();
  const [data, setData] = useState<StatsData | null>(null);
  const [feed, setFeed] = useState<any[]>([]);
  const [fetching, setFetching] = useState(false);
  const [showLevelModal, setShowLevelModal] = useState(false);
  const [shareCopiedId, setShareCopiedId] = useState<string | null>(null);

  const fetchDashboardData = () => {
    if (!user) return;
    setFetching(true);
    Promise.all([
      api.getStats(),
      api.getActivityFeed()
    ])
      .then(([statsRes, feedRes]) => {
        setData(statsRes as StatsData);
        setFeed(feedRes as any[]);
      })
      .catch(console.error)
      .finally(() => setFetching(false));
  };

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const copyShareLink = (statId: string) => {
    if (typeof window !== 'undefined') {
      const shareUrl = `${window.location.origin}/share/${statId}`;
      navigator.clipboard.writeText(shareUrl);
      setShareCopiedId(statId);
      setTimeout(() => setShareCopiedId(null), 2000);
    }
  };

  if (loading || fetching) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center gap-3 text-[var(--color-text-secondary)]">
          <div className="w-5 h-5 border-2 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin" />
          Loading...
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-6 px-4">
        <div className="w-16 h-16 rounded-2xl bg-[var(--color-accent-muted)] flex items-center justify-center">
          <BarChart3 size={28} className="text-[var(--color-accent)]" />
        </div>
        <div className="text-center">
          <h2 className="text-xl font-semibold text-[var(--color-text)] mb-2">Sign in to view your dashboard</h2>
          <p className="text-[var(--color-text-secondary)] text-sm">Track your progress, analyze weak keys, and improve faster.</p>
        </div>
        <Link
          href="/login"
          className="group inline-flex items-center gap-2 px-6 py-3 rounded-xl text-[14px] font-semibold bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)] transition-colors"
        >
          Log In
          <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    );
  }

  const chartData = (data?.stats || []).slice(-20).map((s, i) => ({
    name: i + 1,
    wpm: s.wpm,
    accuracy: s.accuracy,
    date: new Date(s.date).toLocaleDateString(),
  }));

  const topWeakKeys = (data?.weakKeys || [])
    .filter((k) => k.totalCount > 0)
    .map((k) => ({ key: k.key, rate: Math.round((k.errorCount / k.totalCount) * 100) }))
    .sort((a, b) => b.rate - a.rate)
    .slice(0, 10);

  const testList = (data?.stats || []).filter(s => s.mode === 'test');
  const avgWpm = testList.length
    ? Math.round(testList.reduce((s, r) => s + r.wpm, 0) / testList.length)
    : 0;
  const avgAcc = testList.length
    ? Math.round(testList.reduce((s, r) => s + r.accuracy, 0) / testList.length)
    : 0;

  const LevelIcon = level ? LEVEL_ICONS[level] : null;
  const levelColor = level ? LEVEL_COLORS[level] : '';

  // Compute stats for achievements progress
  const testCount = testList.length;
  const raceWins = data?.raceWins || 0;
  const maxAcc = testList.length ? Math.max(...testList.map(s => s.accuracy)) : 0;
  const unlockedAchievementNames = data?.achievements ? data.achievements.map(a => a.name) : [];

  const getAchievementProgress = (achName: string) => {
    switch (achName) {
      case 'First Blood':
        return { current: raceWins, target: 1, percent: raceWins >= 1 ? 100 : 0 };
      case 'Speed Demon':
        return { current: data?.bestWpm || 0, target: 100, percent: Math.min(100, Math.round(((data?.bestWpm || 0) / 100) * 100)) };
      case 'Perfect Form':
        return { current: maxAcc, target: 99, percent: Math.min(100, Math.round((maxAcc / 99) * 100)) };
      case 'Consistent':
        return { current: testCount, target: 100, percent: Math.min(100, Math.round((testCount / 100) * 100)) };
      case 'Speedster Streak':
        return { current: data?.streak || 0, target: 5, percent: Math.min(100, Math.round(((data?.streak || 0) / 5) * 100)) };
      default:
        return { current: 0, target: 1, percent: 0 };
    }
  };

  const getRelativeTime = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    return d.toLocaleDateString();
  };

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-8 pt-24 pb-16">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 rounded-xl bg-[var(--color-accent-muted)] flex items-center justify-center">
            <BarChart3 size={20} className="text-[var(--color-accent)]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[var(--color-text)]">Dashboard</h1>
            <p className="text-sm text-[var(--color-text-secondary)]">{user.username}&apos;s profile & stats</p>
          </div>
        </div>

        {/* Level indicator */}
        {level && LevelIcon && (
          <div className="flex items-center justify-between mb-8 p-5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]">
            <div className="flex items-center gap-4">
              <span
                className="flex shrink-0 items-center justify-center w-11 h-11 rounded-xl border"
                style={{
                  backgroundColor: `${levelColor}12`,
                  color: levelColor,
                  borderColor: `${levelColor}30`,
                }}
              >
                <LevelIcon size={22} strokeWidth={2.2} />
              </span>
              <div>
                <p className="font-semibold text-lg text-[var(--color-text)]">{LEVEL_THRESHOLDS[level].label}</p>
                <p className="text-[13px] text-[var(--color-text-secondary)]">
                  {level !== 'pro'
                    ? `Promote at ${LEVEL_THRESHOLDS[level].promote} WPM avg`
                    : 'Maximum level reached'}
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowLevelModal(true)}
              className="text-[13px] px-4 py-2 rounded-xl border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:border-[var(--color-border-hover)] transition-colors cursor-pointer"
            >
              Change Level
            </button>
          </div>
        )}

        {showLevelModal && (
          <LevelSelectModal
            onSelect={(l: Level) => { setLevel(l); api.setLevel({ level: l }).catch(() => {}); setShowLevelModal(false); }}
            onClose={() => setShowLevelModal(false)}
          />
        )}

        {/* Profile / Career Status Card */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Career Column */}
          <div className="p-6 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3 mb-4">
                <span className="text-xs uppercase font-extrabold tracking-widest text-[var(--color-text-secondary)]">Career Summary</span>
                <Sparkles size={14} className="text-[var(--color-accent)]" />
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-[var(--color-text-secondary)]">Typing Level</span>
                  <span className="text-xs font-bold uppercase px-2 py-0.5 rounded bg-[var(--color-accent-muted)] border border-[var(--color-accent)]/10 text-[var(--color-text)]">
                    {level || 'beginner'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-[var(--color-text-secondary)]">Career Experience</span>
                  <span className="text-xs font-bold text-[var(--color-text)] font-mono">
                    {data?.xp || 0} XP
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-[var(--color-text-secondary)]">Streak Days</span>
                  <span className="text-xs font-bold text-[var(--color-warning)] flex items-center gap-1">
                    <Flame size={12} fill="currentColor" /> {data?.streak || 0} days
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-[var(--color-text-secondary)]">Achievements</span>
                  <span className="text-xs font-bold text-[var(--color-success)]">
                    {unlockedAchievementNames.length} / 5 unlocked
                  </span>
                </div>
              </div>
            </div>
            
            <div className="mt-6 border-t border-[var(--color-border)] pt-4">
              <div className="flex justify-between text-[10px] text-[var(--color-text-secondary)] mb-1.5 font-bold uppercase">
                <span>Level Progress</span>
                <span>{(data?.xp || 0) % 1000} / 1000 XP</span>
              </div>
              <div className="w-full bg-[var(--color-card)] h-1.5 rounded-full overflow-hidden border border-[var(--color-border)]">
                <div
                  className="bg-[var(--color-accent)] h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (((data?.xp || 0) % 1000) / 1000) * 100)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Competitive (Official) Card */}
          <div className="p-6 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]">
            <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3 mb-4">
              <span className="text-xs uppercase font-extrabold tracking-widest text-[var(--color-text-secondary)]">Competitive Stats</span>
              <Award size={14} className="text-[var(--color-accent)]" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] uppercase font-bold text-[var(--color-text-secondary)]">Best WPM</p>
                <p className="text-2xl font-black text-[var(--color-accent)] font-orbitron">{(data as any)?.summary?.official?.bestWpm || data?.bestWpm || 0}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-[var(--color-text-secondary)]">Global Rank</p>
                <p className="text-2xl font-black text-[var(--color-text)] font-orbitron">#{(data as any)?.summary?.official?.rank || '-'}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-[var(--color-text-secondary)]">Avg Accuracy</p>
                <p className="text-2xl font-black text-emerald-400 font-orbitron">{(data as any)?.summary?.official?.accuracy || 0}%</p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-[var(--color-text-secondary)]">Official Sessions</p>
                <p className="text-2xl font-black text-[var(--color-text-secondary)] font-orbitron">{(data as any)?.summary?.official?.sessions || 0}</p>
              </div>
            </div>
          </div>

          {/* Practice Card */}
          <div className="p-6 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]">
            <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3 mb-4">
              <span className="text-xs uppercase font-extrabold tracking-widest text-[var(--color-text-secondary)]">Practice Stats</span>
              <Clock size={14} className="text-zinc-500" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] uppercase font-bold text-[var(--color-text-secondary)]">Hours Practiced</p>
                <p className="text-2xl font-black text-[var(--color-text)] font-orbitron">
                  {(((data as any)?.summary?.practice?.totalTime || 0) / 3600).toFixed(1)}h
                </p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-[var(--color-text-secondary)]">Words Typed</p>
                <p className="text-2xl font-black text-[var(--color-text)] font-orbitron">{(data as any)?.summary?.practice?.totalWords || 0}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-[var(--color-text-secondary)]">Chars Typed</p>
                <p className="text-2xl font-black text-[var(--color-text)] font-orbitron">{(data as any)?.summary?.practice?.totalChars || 0}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-[var(--color-text-secondary)]">Imported Practice</p>
                <p className="text-2xl font-black text-[var(--color-text-secondary)] font-orbitron">{(data as any)?.summary?.practice?.sessions || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Games Stats Card */}
        <div className="p-6 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] mb-8">
          <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3 mb-4">
            <span className="text-xs uppercase font-extrabold tracking-widest text-[var(--color-text-secondary)]">Game Standings</span>
            <Trophy size={14} className="text-[var(--color-warning)]" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-[var(--color-card)] border border-[var(--color-border)]">
              <span className="text-[10px] uppercase font-bold text-[var(--color-text-secondary)]">Zombie Escapes</span>
              <p className="text-xl font-bold mt-1 text-[var(--color-text)] font-orbitron">
                { (data?.stats || []).filter(s => s.subtype === 'zombie-escape').length }
              </p>
            </div>
            <div className="p-4 rounded-xl bg-[var(--color-card)] border border-[var(--color-border)]">
              <span className="text-[10px] uppercase font-bold text-[var(--color-text-secondary)]">Nova Racer Wins</span>
              <p className="text-xl font-bold mt-1 text-[var(--color-accent)] font-orbitron">
                { data?.raceWins || 0 }
              </p>
            </div>
            <div className="p-4 rounded-xl bg-[var(--color-card)] border border-[var(--color-border)]">
              <span className="text-[10px] uppercase font-bold text-[var(--color-text-secondary)]">Type Racer WPM</span>
              <p className="text-xl font-bold mt-1 text-emerald-400 font-orbitron">
                { (() => {
                  const trStats = (data?.stats || []).filter(s => s.subtype === 'type-racer');
                  return trStats.length ? Math.max(...trStats.map(s => s.wpm)) : 0;
                })() }
              </p>
            </div>
            <div className="p-4 rounded-xl bg-[var(--color-card)] border border-[var(--color-border)]">
              <span className="text-[10px] uppercase font-bold text-[var(--color-text-secondary)]">Rocket Rush</span>
              <p className="text-xs font-semibold mt-2.5 text-[var(--color-text-secondary)] italic">
                Coming Soon
              </p>
            </div>
          </div>
        </div>

        {chartData.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* WPM Chart */}
            <div className="p-5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]">
              <h2 className="text-[12px] font-semibold mb-5 uppercase tracking-widest text-[var(--color-text-secondary)]">WPM History</h2>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="name" stroke="rgba(255,255,255,0.15)" tick={{ fontSize: 11, fill: 'var(--color-text-secondary)' }} />
                  <YAxis stroke="rgba(255,255,255,0.15)" tick={{ fontSize: 11, fill: 'var(--color-text-secondary)' }} />
                  <Tooltip
                    contentStyle={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 12, fontSize: 12, color: 'var(--color-text)' }}
                    labelStyle={{ color: 'var(--color-text-secondary)' }}
                  />
                  <Line type="monotone" dataKey="wpm" stroke="var(--color-accent)" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Accuracy Chart */}
            <div className="p-5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]">
              <h2 className="text-[12px] font-semibold mb-5 uppercase tracking-widest text-[var(--color-text-secondary)]">Accuracy History</h2>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="name" stroke="rgba(255,255,255,0.15)" tick={{ fontSize: 11, fill: 'var(--color-text-secondary)' }} />
                  <YAxis domain={[0, 100]} stroke="rgba(255,255,255,0.15)" tick={{ fontSize: 11, fill: 'var(--color-text-secondary)' }} />
                  <Tooltip
                    contentStyle={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 12, fontSize: 12, color: 'var(--color-text)' }}
                  />
                  <Line type="monotone" dataKey="accuracy" stroke="var(--color-success)" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        ) : (
          <div className="mb-8 p-12 rounded-2xl text-center border border-dashed border-[var(--color-border)] bg-[var(--color-surface)]">
            <BarChart3 size={32} className="text-[var(--color-text-secondary)] mx-auto mb-3 opacity-30" />
            <p className="text-[var(--color-text-secondary)]">No data yet. Complete a test or practice session to see your stats.</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-8">
          {/* Weak Keys */}
          <div className="md:col-span-5">
            {topWeakKeys.length > 0 ? (
              <div className="p-5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] h-full">
                <h2 className="text-[12px] font-semibold mb-5 uppercase tracking-widest text-[var(--color-text-secondary)]">Weak Keys</h2>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={topWeakKeys}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                    <XAxis dataKey="key" stroke="rgba(255,255,255,0.15)" tick={{ fontSize: 13, fontFamily: 'var(--font-geist, monospace)', fill: 'var(--color-text-secondary)' }} />
                    <YAxis stroke="rgba(255,255,255,0.15)" tick={{ fontSize: 11, fill: 'var(--color-text-secondary)' }} unit="%" />
                    <Tooltip
                      contentStyle={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 12, fontSize: 12, color: 'var(--color-text)' }}
                      formatter={(v) => [`${v}%`, 'Error Rate']}
                    />
                    <Bar dataKey="rate" fill="var(--color-error)" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="p-6 rounded-2xl border border-dashed border-[var(--color-border)] bg-[var(--color-surface)] text-center text-xs text-[var(--color-text-secondary)] flex items-center justify-center h-full">
                Weak key analysis will appear here.
              </div>
            )}
          </div>

          {/* Achievements progress / info */}
          <div className="md:col-span-7">
            <div className="p-5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] h-full">
              <h2 className="text-[12px] font-semibold mb-4 uppercase tracking-widest text-[var(--color-text-secondary)]">Achievements</h2>
              <div className="space-y-4">
                {ACHIEVEMENT_LIST.map((ach) => {
                  const unlocked = unlockedAchievementNames.includes(ach.name);
                  const progress = getAchievementProgress(ach.name);
                  const Icon = ach.icon;

                  return (
                    <div
                      key={ach.name}
                      className={`p-3 rounded-xl border flex flex-col gap-2 transition-all ${
                        unlocked
                          ? 'border-[var(--color-accent)]/20 bg-[var(--color-accent-muted)]/5'
                          : 'border-[var(--color-border)] bg-[var(--color-surface)]/50 opacity-60'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg border border-[var(--color-border)] ${ach.color}`}>
                          <Icon size={16} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-[var(--color-text)] truncate">{ach.name}</span>
                            {unlocked ? (
                              <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                                Unlocked
                              </span>
                            ) : (
                              <span className="text-[9px] font-mono text-[var(--color-text-secondary)]">
                                {progress.current} / {progress.target}
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-[var(--color-text-secondary)] mt-0.5">{ach.desc}</p>
                        </div>
                      </div>

                      {/* Locked Progress bar */}
                      {!unlocked && (
                        <div className="w-full bg-[var(--color-border)] h-1 rounded-full overflow-hidden">
                          <div
                            className="bg-[var(--color-accent)] h-full rounded-full transition-all duration-300"
                            style={{ width: `${progress.percent}%` }}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Social Feed (Timeline) */}
        <div className="p-6 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]">
          <div className="flex items-center gap-2 mb-6 border-b border-[var(--color-border)] pb-4">
            <Users size={16} className="text-[var(--color-accent)]" />
            <h2 className="text-sm font-bold uppercase tracking-wider">Social Activity Feed</h2>
          </div>

          {feed.length > 0 ? (
            <div className="relative border-l border-zinc-800 ml-3 pl-6 space-y-6">
              {feed.map((act) => {
                const isOwn = act.user === user.id;
                
                // Set appropriate icon
                let actColor = 'text-sky-400 border-sky-500/20 bg-sky-500/10';
                let icon = <Clock size={12} />;

                if (act.type === 'test_completed') {
                  icon = <BarChart3 size={12} />;
                  actColor = 'text-sky-400 border-sky-500/20 bg-sky-500/10';
                } else if (act.type === 'achievement_unlocked') {
                  icon = <Sparkles size={12} />;
                  actColor = 'text-amber-400 border-amber-500/20 bg-amber-500/10';
                } else if (act.type === 'race_won') {
                  icon = <Trophy size={12} />;
                  actColor = 'text-purple-400 border-purple-500/20 bg-purple-500/10';
                } else if (act.type === 'friend_added') {
                  icon = <UserPlus size={12} />;
                  actColor = 'text-emerald-400 border-emerald-500/20 bg-emerald-500/10';
                }

                const isCopied = shareCopiedId === act.details?.statId;

                return (
                  <div key={act._id} className="relative">
                    {/* Circle timeline dot with icon */}
                    <span className={`absolute -left-[37px] top-0.5 w-6 h-6 rounded-lg flex items-center justify-center border ${actColor} shadow-sm z-10`}>
                      {icon}
                    </span>

                    <div className="flex flex-col gap-1 text-xs">
                      <div className="flex flex-wrap items-center gap-x-1.5 text-[var(--color-text)]">
                        <span className="font-extrabold text-[var(--color-text)]">
                          {isOwn ? 'You' : `@${act.username}`}
                        </span>

                        {/* Event text descriptions */}
                        {act.type === 'test_completed' && (
                          <span className="text-[var(--color-text-secondary)]">
                            completed a test at{' '}
                            <span className="font-bold text-[var(--color-accent)]">{act.details?.wpm} WPM</span> with{' '}
                            <span className="font-bold text-[var(--color-success)]">{act.details?.accuracy}%</span> accuracy
                          </span>
                        )}

                        {act.type === 'achievement_unlocked' && (
                          <span className="text-[var(--color-text-secondary)]">
                            unlocked the{' '}
                            <span className="font-bold text-[var(--color-warning)]">{act.details?.achievementName}</span>{' '}
                            achievement!
                          </span>
                        )}

                        {act.type === 'race_won' && (
                          <span className="text-[var(--color-text-secondary)]">
                            won a multiplayer typing race at{' '}
                            <span className="font-bold text-[var(--color-accent)]">{act.details?.wpm} WPM</span>!
                          </span>
                        )}

                        {act.type === 'friend_added' && (
                          <span className="text-[var(--color-text-secondary)]">
                            connected with{' '}
                            <span className="font-bold">
                              {act.details?.friendId === user.id ? 'You' : `@${act.details?.friendName}`}
                            </span>{' '}
                            as friends
                          </span>
                        )}
                      </div>

                      {/* Timeline bottom row with elapsed time and share button */}
                      <div className="flex items-center gap-3 text-[10px] text-[var(--color-text-secondary)] mt-1 opacity-70">
                        <span>{getRelativeTime(act.createdAt)}</span>

                        {/* Allow sharing for test completed */}
                        {act.type === 'test_completed' && act.details?.statId && (
                          <button
                            onClick={() => copyShareLink(act.details.statId)}
                            className="flex items-center gap-1 hover:text-[var(--color-accent)] transition-colors cursor-pointer text-[var(--color-text-secondary)]"
                          >
                            {isCopied ? (
                              <>
                                <Check size={10} className="text-[var(--color-success)]" />
                                Link Copied!
                              </>
                            ) : (
                              <>
                                <Copy size={10} />
                                Share Scorecard
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-12 text-center text-xs text-[var(--color-text-secondary)] border border-dashed border-[var(--color-border)] bg-[var(--color-surface)]/30 rounded-xl">
              No feed activities. Add friends to populate your timeline!
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
