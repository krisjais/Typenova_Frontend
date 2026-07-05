'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import {
  Gauge,
  Target,
  Clock,
  Calendar,
  User,
  Share2,
  Copy,
  Check,
  ArrowRight,
  Loader,
  ChevronLeft
} from 'lucide-react';
import Link from 'next/link';

interface SharedResult {
  username: string;
  wpm: number;
  accuracy: number;
  errors: number;
  mode: string;
  category: string;
  difficulty: string;
  language: string;
  duration: number;
  date: string;
}

export default function SharePage() {
  const { id } = useParams() as { id: string };
  const [result, setResult] = useState<SharedResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (id) {
      api.getSharedResult(id)
        .then((res: any) => setResult(res))
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [id]);

  const copyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center gap-3 text-[var(--color-text-secondary)]">
          <Loader size={18} className="animate-spin text-[var(--color-accent)]" />
          Fetching Typing Scorecard...
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 px-4 text-center">
        <h2 className="text-xl font-bold text-rose-400">Scorecard Not Found</h2>
        <p className="text-sm text-[var(--color-text-secondary)]">The shared link is invalid or the test result has been deleted.</p>
        <Link
          href="/test"
          className="mt-2 px-5 py-2.5 rounded-xl bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)] transition-colors text-xs font-bold"
        >
          Take a Typing Test
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 py-16">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <div className="mb-6">
          <Link
            href="/test"
            className="inline-flex items-center gap-1 text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors"
          >
            <ChevronLeft size={14} />
            Back to Practice
          </Link>
        </div>

        {/* Scorecard Card */}
        <div className="glass-card overflow-hidden shadow-2xl relative">
          <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-secondary)]" />

          <div className="p-6 md:p-8">
            {/* User Header */}
            <div className="flex items-center gap-3 border-b border-[var(--color-border)] pb-5 mb-6">
              <div className="w-10 h-10 rounded-xl bg-[var(--color-accent-muted)] flex items-center justify-center font-bold text-sm text-[var(--color-accent)] border border-[var(--color-accent)]/20 uppercase">
                {result.username.charAt(0)}
              </div>
              <div>
                <h1 className="text-sm font-extrabold text-[var(--color-text)] uppercase tracking-wider">
                  TypeNova Scorecard
                </h1>
                <p className="text-xs text-[var(--color-text-secondary)]">
                  Achieved by <span className="text-[var(--color-text)] font-semibold">@{result.username}</span>
                </p>
              </div>
            </div>

            {/* Large Stats */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-center">
                <div className="flex items-center justify-center gap-1.5 text-[10px] text-[var(--color-text-secondary)] uppercase font-semibold tracking-wider mb-2">
                  <Gauge size={12} className="text-[var(--color-accent)]" />
                  Speed
                </div>
                <div className="text-4xl font-extrabold text-[var(--color-accent)] font-orbitron tracking-tight">
                  {result.wpm}
                </div>
                <div className="text-[9px] uppercase font-bold text-[var(--color-text-secondary)] mt-1">WPM</div>
              </div>

              <div className="p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-center">
                <div className="flex items-center justify-center gap-1.5 text-[10px] text-[var(--color-text-secondary)] uppercase font-semibold tracking-wider mb-2">
                  <Target size={12} className="text-[var(--color-success)]" />
                  Accuracy
                </div>
                <div className="text-4xl font-extrabold text-[var(--color-success)] font-orbitron tracking-tight">
                  {result.accuracy}%
                </div>
                <div className="text-[9px] uppercase font-bold text-[var(--color-text-secondary)] mt-1">
                  {result.errors} errors
                </div>
              </div>
            </div>

            {/* Detailed Stats */}
            <div className="space-y-3 border-t border-b border-[var(--color-border)] py-4 mb-6 text-xs text-[var(--color-text-secondary)]">
              <div className="flex justify-between">
                <span>Category</span>
                <span className="font-bold text-[var(--color-text)]">{result.category}</span>
              </div>
              <div className="flex justify-between">
                <span>Difficulty</span>
                <span className="font-bold text-[var(--color-text)]">{result.difficulty}</span>
              </div>
              <div className="flex justify-between">
                <span>Language</span>
                <span className="font-bold text-[var(--color-text)]">{result.language}</span>
              </div>
              <div className="flex justify-between">
                <span>Duration</span>
                <span className="font-bold text-[var(--color-text)]">{result.duration} seconds</span>
              </div>
              <div className="flex justify-between">
                <span>Date Achieved</span>
                <span className="font-bold text-[var(--color-text)]">
                  {new Date(result.date).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                </span>
              </div>
            </div>

            {/* Sharing buttons */}
            <div className="flex gap-2">
              <button
                onClick={copyLink}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold border border-[var(--color-border)] hover:bg-white/[0.04] transition-colors cursor-pointer text-[var(--color-text)]"
              >
                {copied ? (
                  <>
                    <Check size={14} className="text-[var(--color-success)]" />
                    Link Copied!
                  </>
                ) : (
                  <>
                    <Copy size={14} />
                    Copy Result Link
                  </>
                )}
              </button>
              <Link
                href="/signup"
                className="flex-1 flex items-center justify-center gap-1 py-3 rounded-xl text-xs font-bold bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)] transition-colors shadow-sm"
              >
                Try To Beat It
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
