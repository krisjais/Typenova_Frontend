'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useState } from 'react';
import ThemePicker from './ThemePicker';

const NAV_LINKS = [
  { href: '/practice', label: 'practice' },
  { href: '/test', label: 'test' },
  { href: '/dashboard', label: 'dashboard' },
  { href: '/leaderboard', label: 'leaderboard' },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const { theme } = useTheme();
  const pathname = usePathname();
  const [showTheme, setShowTheme] = useState(false);

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 h-14"
      style={{ background: theme.background + 'cc', backdropFilter: 'blur(16px)' }}
    >
      <Link href="/" className="text-lg font-bold tracking-tight" style={{ color: 'var(--color-accent)' }}>
        TypeNova
      </Link>

      <div className="flex items-center gap-1 text-xs">
        {NAV_LINKS.map(({ href, label }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className="relative px-3 py-1.5 rounded-lg transition-all duration-200"
              style={{
                color: isActive ? 'var(--color-accent)' : 'var(--color-sub)',
                background: isActive ? 'rgba(99,102,241,0.12)' : 'transparent',
                fontWeight: isActive ? 600 : 400,
              }}
            >
              {label}
              {/* Active underline bar */}
              {isActive && (
                <span
                  className="absolute bottom-0 left-1/2 -translate-x-1/2 rounded-full"
                  style={{
                    width: '60%',
                    height: 2,
                    background: 'var(--color-accent)',
                    boxShadow: '0 0 6px var(--color-accent)',
                  }}
                />
              )}
            </Link>
          );
        })}

        {/* Divider */}
        <span className="mx-2 opacity-10 select-none">|</span>

        {/* Theme button */}
        <button
          onClick={() => setShowTheme(!showTheme)}
          className="group relative flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200 hover:scale-110"
          style={{
            background: showTheme ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.06)',
            border: `1px solid ${showTheme ? 'rgba(99,102,241,0.5)' : 'rgba(255,255,255,0.1)'}`,
          }}
          title="Theme"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
            <defs>
              <linearGradient id="themeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#6366f1" />
                <stop offset="50%" stopColor="#a855f7" />
                <stop offset="100%" stopColor="#ec4899" />
              </linearGradient>
            </defs>
            <path
              d="M12 2C6.48 2 2 6.48 2 12c0 5.52 4.48 10 10 10 1.1 0 2-.9 2-2 0-.53-.2-1.01-.52-1.38-.31-.36-.49-.83-.49-1.32 0-1.1.9-2 2-2h2.36c3.1 0 5.65-2.55 5.65-5.65C23 6.1 18.03 2 12 2z"
              fill="url(#themeGrad)"
              opacity="0.9"
            />
            <circle cx="6.5" cy="11.5" r="1.5" fill="#fff" opacity="0.9" />
            <circle cx="9.5" cy="7.5" r="1.5" fill="#fff" opacity="0.9" />
            <circle cx="14.5" cy="7.5" r="1.5" fill="#fff" opacity="0.9" />
            <circle cx="17.5" cy="11.5" r="1.5" fill="#fff" opacity="0.9" />
          </svg>
          {showTheme && (
            <span
              className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full"
              style={{ background: 'var(--color-accent)' }}
            />
          )}
        </button>

        {/* Divider */}
        <span className="mx-2 opacity-10 select-none">|</span>

        {user ? (
          <div className="flex items-center gap-3">
            <span className="opacity-40 text-xs">{user.username}</span>
            <button
              onClick={logout}
              className="px-3 py-1.5 rounded-lg text-xs transition-all duration-200 hover:text-white"
              style={{ color: 'var(--color-sub)' }}
            >
              logout
            </button>
          </div>
        ) : (
          <div className="flex gap-2">
            <Link
              href="/login"
              className="px-3 py-1.5 rounded-lg text-xs transition-all duration-200 hover:text-white"
              style={{ color: 'var(--color-sub)' }}
            >
              login
            </Link>
            <Link
              href="/signup"
              className="px-3 py-1.5 rounded-lg text-xs font-semibold transition hover:opacity-90"
              style={{ background: 'var(--color-accent)', color: '#fff' }}
            >
              sign up
            </Link>
          </div>
        )}
      </div>

      {showTheme && (
        <div className="absolute top-14 right-4">
          <ThemePicker onClose={() => setShowTheme(false)} />
        </div>
      )}
    </nav>
  );
}
