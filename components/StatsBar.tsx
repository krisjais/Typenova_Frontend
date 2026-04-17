interface Props {
  wpm: number;
  accuracy: number;
  errors: number;
  timeLeft?: number;
  elapsed?: number;
}

export default function StatsBar({ wpm, accuracy, errors, timeLeft, elapsed }: Props) {
  return (
    <div className="flex flex-wrap gap-6 justify-center text-center">
      <Stat label="WPM" value={wpm} color="var(--color-accent)" />
      <Stat label="Accuracy" value={`${accuracy}%`} color={accuracy >= 90 ? '#22c55e' : accuracy >= 70 ? '#f59e0b' : '#ef4444'} />
      <Stat label="Errors" value={errors} color={errors === 0 ? '#22c55e' : '#ef4444'} />
      {timeLeft !== undefined && <Stat label="Time Left" value={`${timeLeft}s`} color="var(--color-text)" />}
      {elapsed !== undefined && <Stat label="Elapsed" value={`${elapsed}s`} color="var(--color-text)" />}
    </div>
  );
}

function Stat({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-3xl font-bold" style={{ color }}>{value}</span>
      <span className="text-xs opacity-50 mt-1 uppercase tracking-widest">{label}</span>
    </div>
  );
}
