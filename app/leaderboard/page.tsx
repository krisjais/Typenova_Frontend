'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

interface Leader {
  _id: string;
  username: string;
  bestWpm: number;
  streak: number;
}

export default function LeaderboardPage() {
  const [leaders, setLeaders] = useState<Leader[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getLeaderboard()
      .then((d) => setLeaders(d as Leader[]))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const medals = ['🥇', '🥈', '🥉'];

  return (
    <div className="max-w-2xl mx-auto px-4 py-12 fade-in">
      <h1 className="text-2xl font-bold mb-8" style={{ color: 'var(--color-accent)' }}>Leaderboard</h1>

      {loading ? (
        <div className="opacity-50 text-center py-12">Loading...</div>
      ) : leaders.length === 0 ? (
        <div className="opacity-40 text-center py-12">No entries yet. Be the first!</div>
      ) : (
        <div className="space-y-2">
          {leaders.map((l, i) => (
            <div
              key={l._id}
              className="flex items-center justify-between px-5 py-4 rounded-xl transition hover:scale-[1.01]"
              style={{
                background: i < 3 ? 'rgba(99,102,241,0.08)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${i < 3 ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.06)'}`,
              }}
            >
              <div className="flex items-center gap-4">
                <span className="text-xl w-8 text-center">{medals[i] || `#${i + 1}`}</span>
                <span className="font-semibold">{l.username}</span>
                {l.streak > 0 && <span className="text-xs opacity-50">{l.streak} 🔥</span>}
              </div>
              <span className="text-xl font-bold" style={{ color: 'var(--color-accent)' }}>
                {l.bestWpm} <span className="text-xs opacity-50 font-normal">WPM</span>
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
