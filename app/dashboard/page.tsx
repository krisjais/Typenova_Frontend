'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useLevel } from '@/context/LevelContext';
import { api } from '@/lib/api';
import { Level, LEVEL_THRESHOLDS } from '@/utils/typing';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar,
} from 'recharts';
import Link from 'next/link';
import { Sprout, Zap, Flame } from 'lucide-react';
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
    return <div className="flex items-center justify-center min-h-[60vh] opacity-50">Loading...</div>;
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <p className="opacity-60">Sign in to view your dashboard</p>
        <Link href="/login" className="px-6 py-2 rounded-lg text-sm font-semibold" style={{ background: 'var(--color-accent)', color: '#fff' }}>
          Login
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

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 fade-in">
      <h1 className="text-2xl font-bold mb-8" style={{ color: 'var(--color-accent)' }}>
        Dashboard — {user.username}
      </h1>

      {/* Level indicator */}
      {level && (
        <div className="flex items-center justify-between mb-6 p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="flex items-center gap-4">
            {(() => {
              const icons = {
                beginner: { Icon: Sprout, color: '#34d399' },
                intermediate: { Icon: Zap, color: '#fbbf24' },
                pro: { Icon: Flame, color: '#f87171' },
              };
              const { Icon, color } = icons[level] || icons.beginner;
              return (
                <span 
                  className="flex shrink-0 items-center justify-center p-2.5 rounded-xl border shadow-sm"
                  style={{ 
                    backgroundColor: `${color}15`, 
                    color: color,
                    borderColor: `${color}50`,
                    boxShadow: `0 0 15px ${color}20`
                  }}
                >
                  <Icon size={24} strokeWidth={2.5} />
                </span>
              );
            })()}
            <div>
              <p className="font-semibold text-lg tracking-wide">{LEVEL_THRESHOLDS[level].label}</p>
              <p className="text-xs opacity-50">
                {level !== 'pro'
                  ? `Promote at ${LEVEL_THRESHOLDS[level].promote} WPM avg`
                  : 'Maximum level reached'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowLevelModal(true)}
            className="text-xs px-3 py-1.5 rounded-lg border border-white/20 hover:border-white/50 transition"
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
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
        {[
          { label: 'Best WPM', value: data?.bestWpm || 0, color: 'var(--color-accent)' },
          { label: 'Avg WPM', value: avgWpm, color: 'var(--color-text)' },
          { label: 'Avg Accuracy', value: `${avgAcc}%`, color: '#22c55e' },
          { label: 'Streak', value: `${data?.streak || 0} 🔥`, color: '#f59e0b' },
        ].map((c) => (
          <div key={c.label} className="p-4 rounded-xl text-center" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="text-3xl font-bold" style={{ color: c.color }}>{c.value}</div>
            <div className="text-xs opacity-50 mt-1 uppercase tracking-widest">{c.label}</div>
          </div>
        ))}
      </div>

      {chartData.length > 0 ? (
        <>
          {/* WPM Chart */}
          <div className="mb-8 p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <h2 className="text-sm font-semibold mb-4 opacity-70 uppercase tracking-widest">WPM History</h2>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" tick={{ fontSize: 11 }} />
                <YAxis stroke="rgba(255,255,255,0.3)" tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }}
                  labelStyle={{ color: 'rgba(255,255,255,0.5)' }}
                />
                <Line type="monotone" dataKey="wpm" stroke="var(--color-accent)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Accuracy Chart */}
          <div className="mb-8 p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <h2 className="text-sm font-semibold mb-4 opacity-70 uppercase tracking-widest">Accuracy History</h2>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 100]} stroke="rgba(255,255,255,0.3)" tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }}
                />
                <Line type="monotone" dataKey="accuracy" stroke="#22c55e" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </>
      ) : (
        <div className="mb-8 p-8 rounded-xl text-center opacity-40" style={{ border: '1px dashed rgba(255,255,255,0.15)' }}>
          No data yet. Complete a test or practice session to see your stats.
        </div>
      )}

      {/* Weak Keys */}
      {topWeakKeys.length > 0 && (
        <div className="p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <h2 className="text-sm font-semibold mb-4 opacity-70 uppercase tracking-widest">Weak Keys</h2>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={topWeakKeys}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="key" stroke="rgba(255,255,255,0.3)" tick={{ fontSize: 13, fontFamily: 'monospace' }} />
              <YAxis stroke="rgba(255,255,255,0.3)" tick={{ fontSize: 11 }} unit="%" />
              <Tooltip
                contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }}
                formatter={(v) => [`${v}%`, 'Error Rate']}
              />
              <Bar dataKey="rate" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
