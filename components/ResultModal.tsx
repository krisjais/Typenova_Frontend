'use client';

interface Props {
  wpm: number;
  accuracy: number;
  errors: number;
  duration: number;
  onRetry: () => void;
  onClose: () => void;
}

export default function ResultModal({ wpm, accuracy, errors, duration, onRetry, onClose }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm fade-in">
      <div
        className="rounded-2xl p-8 w-full max-w-sm text-center shadow-2xl"
        style={{ background: 'var(--color-bg)', border: '1px solid rgba(255,255,255,0.1)' }}
      >
        <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--color-accent)' }}>
          Results
        </h2>

        <div className="grid grid-cols-2 gap-4 mb-8">
          {[
            { label: 'WPM', value: wpm, color: 'var(--color-accent)' },
            { label: 'Accuracy', value: `${accuracy}%`, color: accuracy >= 90 ? '#22c55e' : '#f59e0b' },
            { label: 'Errors', value: errors, color: errors === 0 ? '#22c55e' : '#ef4444' },
            { label: 'Time', value: `${duration}s`, color: 'var(--color-text)' },
          ].map((s) => (
            <div key={s.label} className="p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)' }}>
              <div className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</div>
              <div className="text-xs opacity-50 mt-1 uppercase tracking-widest">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="flex gap-3">
          <button
            onClick={onRetry}
            className="flex-1 py-2 rounded-lg font-semibold text-sm transition hover:opacity-90"
            style={{ background: 'var(--color-accent)', color: '#fff' }}
          >
            Try Again
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-2 rounded-lg font-semibold text-sm border transition hover:border-white/50"
            style={{ borderColor: 'rgba(255,255,255,0.2)', color: 'var(--color-text)' }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
