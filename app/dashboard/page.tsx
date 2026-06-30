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
import { Sprout, Zap, Flame, BarChart3, Target, Percent, TrendingUp, Award, ArrowRight } from 'lucide-react';
import LevelSelectModal from '@/components/LevelSelectModal';

interface Stat {
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
}

const LEVEL_ICONS = { beginner: Sprout, intermediate: Zap, pro: Flame };
const LEVEL_COLORS = { beginner: '#34d399', intermediate: '#fbbf24', pro: '#f87171' };

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const { level, setLevel } = useLevel();
  const [data, setData] = useState<StatsData | null>(null);
  const [fetching, setFetching] = useState(false);
  const [showLevelModal, setShowLevelModal] = useState(false);

  useEffect(() => {
    if (user) {
      setFetching(true);
      api.getStats()
        .then((d) => setData(d as StatsData))
        .catch(console.error)
        .finally(() => setFetching(false));
    }
  }, [user]);

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

  const avgWpm = data?.stats?.length
    ? Math.round(data.stats.reduce((s, r) => s + r.wpm, 0) / data.stats.length)
    : 0;
  const avgAcc = data?.stats?.length
    ? Math.round(data.stats.reduce((s, r) => s + r.accuracy, 0) / data.stats.length)
    : 0;

  const LevelIcon = level ? LEVEL_ICONS[level] : null;
  const levelColor = level ? LEVEL_COLORS[level] : '';

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
            <p className="text-sm text-[var(--color-text-secondary)]">{user.username}&apos;s typing analytics</p>
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
              className="text-[13px] px-4 py-2 rounded-xl border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:border-[var(--color-border-hover)] transition-colors"
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

        {/* Summary cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
          {[
            { label: 'Best WPM', value: data?.bestWpm || 0, icon: Award, color: 'var(--color-accent)' },
            { label: 'Avg WPM', value: avgWpm, icon: TrendingUp, color: 'var(--color-text)' },
            { label: 'Avg Accuracy', value: `${avgAcc}%`, icon: Target, color: 'var(--color-success)' },
            { label: 'Streak', value: data?.streak || 0, icon: Flame, color: 'var(--color-warning)' },
          ].map((c, i) => (
            <motion.div
              key={c.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.4 }}
              className="p-5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] hover:bg-[var(--color-card)] transition-colors"
            >
              <div className="flex items-center gap-2 mb-3">
                <c.icon size={14} style={{ color: c.color }} strokeWidth={1.8} />
                <span className="text-[11px] uppercase tracking-widest text-[var(--color-text-secondary)] font-semibold">{c.label}</span>
              </div>
              <div className="text-3xl font-bold" style={{ color: c.color }}>{c.value}</div>
            </motion.div>
          ))}
        </div>

        {chartData.length > 0 ? (
          <>
            {/* WPM Chart */}
            <div className="mb-6 p-5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]">
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
            <div className="mb-6 p-5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]">
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
          </>
        ) : (
          <div className="mb-8 p-12 rounded-2xl text-center border border-dashed border-[var(--color-border)] bg-[var(--color-surface)]">
            <BarChart3 size={32} className="text-[var(--color-text-secondary)] mx-auto mb-3 opacity-30" />
            <p className="text-[var(--color-text-secondary)]">No data yet. Complete a test or practice session to see your stats.</p>
          </div>
        )}

        {/* Weak Keys */}
        {topWeakKeys.length > 0 && (
          <div className="p-5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]">
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
        )}
      </motion.div>
    </div>
  );
}
