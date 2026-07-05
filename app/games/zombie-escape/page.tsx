'use client';
import ZombieEscapeCanvas from '@/components/games/ZombieEscapeCanvas';
import { Skull, ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function ZombieEscapePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 md:px-8 pt-24 pb-16 min-h-screen flex flex-col justify-center">
      <div className="mb-6">
        <Link
          href="/games"
          className="inline-flex items-center gap-1 text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors"
        >
          <ChevronLeft size={14} />
          Back to Games
        </Link>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
            <Skull size={20} />
          </div>
          <div>
            <h1 className="text-xl font-black uppercase tracking-wider text-[var(--color-text)]">Zombie Escape</h1>
            <p className="text-xs text-[var(--color-text-secondary)]">Type to survive the horde</p>
          </div>
        </div>

        <ZombieEscapeCanvas />
      </motion.div>
    </div>
  );
}
