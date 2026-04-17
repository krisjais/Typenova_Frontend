import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] px-4 fade-in">
      <h1 className="text-6xl font-bold mb-3 tracking-tight" style={{ color: 'var(--color-accent)' }}>
        TypeNova
      </h1>
      <p className="text-sm mb-12" style={{ color: 'var(--color-sub)' }}>
        a minimalist typing experience
      </p>

      <div className="flex gap-3 flex-wrap justify-center">
        <Link
          href="/test"
          className="px-6 py-2.5 rounded-lg text-sm font-semibold transition hover:opacity-90"
          style={{ background: 'var(--color-accent)', color: '#fff' }}
        >
          start typing
        </Link>
        <Link
          href="/practice"
          className="px-6 py-2.5 rounded-lg text-sm transition hover:opacity-80"
          style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--color-text)' }}
        >
          practice mode
        </Link>
        <Link
          href="/dashboard"
          className="px-6 py-2.5 rounded-lg text-sm transition hover:opacity-80"
          style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--color-text)' }}
        >
          dashboard
        </Link>
      </div>

      <div className="mt-20 flex gap-12 text-center" style={{ color: 'var(--color-sub)' }}>
        {[
          { label: 'time', desc: '15 · 30 · 60 · 120s' },
          { label: 'words', desc: '10 · 25 · 50 · 100' },
          { label: 'levels', desc: '🌱 ⚡ 🔥' },
        ].map((f) => (
          <div key={f.label}>
            <p className="text-xs uppercase tracking-widest mb-1 opacity-40">{f.label}</p>
            <p className="text-sm">{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
