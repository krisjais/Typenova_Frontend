'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Gamepad2,
  Zap,
  Skull,
  Rocket,
  Swords,
  Brain,
  Clock,
  Star,
  Lock,
  Play,
} from 'lucide-react';

const NovaRacerIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="M12 2v20M2 12h20M12 12l-6.5-6.5M12 12l6.5-6.5" />
  </svg>
);

// Professional geometric vector icons replacing the cartoonish ones
const TypeRacerIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M13 17l5-5-5-5M6 17l5-5-5-5" />
  </svg>
);

const ZombieEscapeIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="3" />
    <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
  </svg>
);

const MeteorDefenseIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const NinjaSlashIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2L15 9L22 12L15 15 L12 22 L9 15 L2 12 L9 9 Z" fill="currentColor" fillOpacity="0.08" />
  </svg>
);

const MemoryTypeIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5M2 7v10M12 12v10M22 7v10" />
  </svg>
);

const GAMES = [
  {
    title: 'Nova Racer',
    description: 'Enter a high-speed racing arena powered by your typing. Charge nitro, dodge rain fields, and outrun rivals.',
    icon: NovaRacerIcon,
    color: '#7C5CFF',
    difficulty: 'Adaptive',
    difficultyColor: '#F59E0B',
    duration: 'Endless',
    xp: 220,
    comingSoon: false,
    href: '/games/nova-racer',
  },
  {
    title: 'Type Racer',
    description: 'Race against time typing passages as fast as you can. Build speed and rhythm.',
    icon: TypeRacerIcon,
    color: '#4DA3FF',
    difficulty: 'Easy',
    difficultyColor: '#22C55E',
    duration: '3 min',
    xp: 50,
    comingSoon: true,
  },
  {
    title: 'Zombie Escape',
    description: 'Type words to fend off approaching zombies. Miss a word and they get closer.',
    icon: ZombieEscapeIcon,
    color: '#EF4444',
    difficulty: 'Medium',
    difficultyColor: '#F59E0B',
    duration: '5 min',
    xp: 100,
    comingSoon: true,
  },
  {
    title: 'Meteor Defense',
    description: 'Destroy incoming meteors by typing their labels before they reach your base.',
    icon: MeteorDefenseIcon,
    color: '#4DA3FF',
    difficulty: 'Hard',
    difficultyColor: '#EF4444',
    duration: '5 min',
    xp: 150,
    comingSoon: true,
  },
  {
    title: 'Ninja Slash',
    description: 'Slice through words with lightning-fast typing. Chain combos for bonus points.',
    icon: NinjaSlashIcon,
    color: '#22C55E',
    difficulty: 'Medium',
    difficultyColor: '#F59E0B',
    duration: '3 min',
    xp: 75,
    comingSoon: true,
  },
  {
    title: 'Memory Type',
    description: 'Read a phrase, then type it from memory. Tests both recall and typing accuracy.',
    icon: MemoryTypeIcon,
    color: '#A855F7',
    difficulty: 'Easy',
    difficultyColor: '#22C55E',
    duration: '4 min',
    xp: 60,
    comingSoon: true,
  },
];

export default function GamesPage() {
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
            <Gamepad2 size={20} className="text-[var(--color-accent)]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[var(--color-text)]">Games</h1>
            <p className="text-sm text-[var(--color-text-secondary)]">Fun challenges to sharpen your typing skills</p>
          </div>
        </div>

        {/* Games Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {GAMES.map((game, i) => (
            <motion.div
              key={game.title}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06, duration: 0.4 }}
              className="group relative overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] hover:bg-[var(--color-card)] hover:border-[var(--color-border-hover)] transition-all duration-300 cursor-default"
            >
              {/* Content */}
              <div className="relative p-6">
                {/* Icon */}
                <div
                  className="flex items-center justify-center w-12 h-12 rounded-xl mb-4 transition-transform duration-200 group-hover:scale-110"
                  style={{
                    background: `${game.color}12`,
                    color: game.color,
                  }}
                >
                  <game.icon />
                </div>

                {/* Title */}
                <h3 className="text-[16px] font-semibold text-[var(--color-text)] mb-2">
                  {game.title}
                </h3>

                {/* Description */}
                <p className="text-[13px] text-[var(--color-text-secondary)] leading-relaxed mb-5">
                  {game.description}
                </p>

                {/* Meta */}
                <div className="flex items-center gap-3 mb-4">
                  <span
                    className="px-2.5 py-1 rounded-lg text-[11px] font-semibold uppercase tracking-wider"
                    style={{
                      background: `${game.difficultyColor}12`,
                      color: game.difficultyColor,
                      border: `1px solid ${game.difficultyColor}25`,
                    }}
                  >
                    {game.difficulty}
                  </span>
                  <span className="flex items-center gap-1 text-[12px] text-[var(--color-text-secondary)]">
                    <Clock size={12} />
                    {game.duration}
                  </span>
                  <span className="flex items-center gap-1 text-[12px] text-[var(--color-accent)]">
                    <Star size={12} />
                    {game.xp} XP
                  </span>
                </div>

                {/* Play / Coming Soon Button */}
                {game.comingSoon ? (
                  <button
                    disabled
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold border border-[var(--color-border)] text-[var(--color-text-secondary)] opacity-60 cursor-not-allowed"
                  >
                    <Lock size={13} />
                    Coming Soon
                  </button>
                ) : (
                  <Link
                    href={game.href || '#'}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)] transition-colors shadow-sm shadow-[var(--color-accent)]/20"
                  >
                    <Play size={13} fill="currentColor" />
                    Play Now
                  </Link>
                )}
              </div>

              {/* Subtle glow on hover */}
              <div
                className="absolute -top-20 -right-20 w-40 h-40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-[60px] pointer-events-none"
                style={{ background: game.color }}
              />
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
