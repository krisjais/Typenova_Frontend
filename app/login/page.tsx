'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, ArrowRight, Mail, Lock } from 'lucide-react';
import Logo from '@/components/Logo';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
      router.push('/practice');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-4 pt-20">
      {/* Background glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-[var(--color-accent)] opacity-[0.03] blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-sm relative"
      >
        {/* Logo */}
        <Logo layout="vertical" size={32} className="mb-8" />

        <h1 className="text-xl font-bold mb-1 text-center text-[var(--color-text)]">Welcome back</h1>
        <p className="text-center text-xs text-[var(--color-text-secondary)] mb-6">Sign in to your TypeNova account</p>

        <div className="p-6 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-xl text-sm text-[var(--color-error)] bg-[var(--color-error)]/8 border border-[var(--color-error)]/15">
                {error}
              </div>
            )}

            <div className="relative">
              <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)]" />
              <input
                type="email"
                placeholder="Email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                className="w-full pl-10 pr-4 py-3 rounded-xl text-sm bg-[var(--color-card)] border border-[var(--color-border)] text-[var(--color-text)] placeholder:text-[var(--color-text-secondary)] transition-all"
              />
            </div>

            <div className="relative">
              <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)]" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                className="w-full pl-10 pr-11 py-3 rounded-xl text-sm bg-[var(--color-card)] border border-[var(--color-border)] text-[var(--color-text)] placeholder:text-[var(--color-text-secondary)] transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="group w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-[14px] bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)] transition-colors disabled:opacity-50 shadow-sm shadow-[var(--color-accent)]/20"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-[var(--color-text-secondary)] mt-6">
          No account?{' '}
          <Link href="/signup" className="text-[var(--color-accent)] hover:underline font-medium">
            Sign up
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
