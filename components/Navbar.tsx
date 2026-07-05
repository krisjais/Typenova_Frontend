'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import {
  Keyboard,
  Gauge,
  BarChart3,
  Trophy,
  Gamepad2,
  Palette,
  LogOut,
  User,
  Menu,
  X,
  Users,
} from 'lucide-react';
import ThemePicker from './ThemePicker';
import Logo from './Logo';

const NAV_LINKS = [
  { href: '/practice', label: 'Practice', icon: Keyboard },
  { href: '/test', label: 'Test', icon: Gauge },
  { href: '/games', label: 'Games', icon: Gamepad2 },
  { href: '/friends', label: 'Social', icon: Users },
  { href: '/dashboard', label: 'Dashboard', icon: BarChart3 },
  { href: '/leaderboard', label: 'Board', icon: Trophy },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [showTheme, setShowTheme] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const themeRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const { scrollY } = useScroll();
  const navPadding = useTransform(scrollY, [0, 80], [12, 6]);
  const navScale = useTransform(scrollY, [0, 80], [1, 0.98]);

  // Close theme picker on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        themeRef.current && !themeRef.current.contains(event.target as Node) &&
        buttonRef.current && !buttonRef.current.contains(event.target as Node)
      ) {
        setShowTheme(false);
      }
    };
    if (showTheme) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showTheme]);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Don't show navbar on landing page
  const isLanding = pathname === '/';

  return (
    <>
      <motion.nav
        style={{ padding: navPadding, scale: navScale }}
        className={`fixed top-0 left-0 right-0 z-50 flex justify-center px-4 pt-3 ${isLanding ? 'pt-4' : ''}`}
      >
        <div className="w-full max-w-5xl">
          <div className="flex items-center justify-between px-4 md:px-6 py-2.5 rounded-2xl glass shadow-lg shadow-black/20">
            {/* Logo */}
            <Link href="/" className="group select-none shrink-0">
              <Logo layout="horizontal" size={26} />
            </Link>

            {/* Desktop Nav Links */}
            <div className="hidden md:flex items-center gap-1 relative">
              {NAV_LINKS.map(({ href, label, icon: Icon }) => {
                const isActive = pathname === href;
                return (
                  <Link
                    key={href}
                    href={href}
                    className="relative px-3.5 py-2 rounded-xl flex items-center gap-2 text-[13px] font-medium transition-colors duration-200"
                    style={{
                      color: isActive ? 'var(--color-text)' : 'var(--color-text-secondary)',
                    }}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="nav-active"
                        className="absolute inset-0 rounded-xl"
                        style={{ background: 'var(--color-accent-muted)' }}
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}
                    <span className="relative z-10 flex items-center gap-2">
                      <Icon size={15} strokeWidth={isActive ? 2.2 : 1.8} />
                      {label}
                    </span>
                  </Link>
                );
              })}
            </div>

            {/* Right Side */}
            <div className="flex items-center gap-2">
              {/* Theme Button */}
              <button
                ref={buttonRef}
                onClick={() => setShowTheme(!showTheme)}
                className="relative flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200 hover:bg-white/[0.06]"
                style={{
                  background: showTheme ? 'var(--color-accent-muted)' : 'transparent',
                  color: showTheme ? 'var(--color-accent)' : 'var(--color-text-secondary)',
                }}
                title="Theme"
              >
                <Palette size={16} strokeWidth={1.8} />
              </button>

              {/* Auth Buttons */}
              {user ? (
                <div className="hidden md:flex items-center gap-2">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.04]">
                    <User size={13} className="text-[var(--color-text-secondary)]" />
                    <span className="text-[13px] font-medium text-[var(--color-text-secondary)]">
                      {user.username}
                    </span>
                  </div>
                  <button
                    onClick={logout}
                    className="flex items-center justify-center w-8 h-8 rounded-lg transition-colors hover:bg-white/[0.06] text-[var(--color-text-secondary)] hover:text-[var(--color-text)]"
                    title="Logout"
                  >
                    <LogOut size={15} strokeWidth={1.8} />
                  </button>
                </div>
              ) : (
                <div className="hidden md:flex items-center gap-2">
                  <Link
                    href="/login"
                    className="px-3.5 py-1.5 rounded-lg text-[13px] font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors"
                  >
                    Log in
                  </Link>
                  <Link
                    href="/signup"
                    className="px-4 py-1.5 rounded-lg text-[13px] font-semibold bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)] transition-colors shadow-sm shadow-[var(--color-accent)]/20"
                  >
                    Sign Up
                  </Link>
                </div>
              )}

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden flex items-center justify-center w-8 h-8 rounded-lg hover:bg-white/[0.06] text-[var(--color-text-secondary)]"
              >
                {mobileOpen ? <X size={18} /> : <Menu size={18} />}
              </button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Theme Picker Dropdown */}
      <AnimatePresence>
        {showTheme && (
          <motion.div
            ref={themeRef}
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="fixed top-[72px] right-4 md:right-[calc(50%-280px)] z-50"
          >
            <ThemePicker onClose={() => setShowTheme(false)} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="fixed top-[68px] left-4 right-4 z-50 p-2 rounded-2xl glass shadow-xl shadow-black/30 md:hidden"
          >
            <div className="flex flex-col gap-1">
              {NAV_LINKS.map(({ href, label, icon: Icon }) => {
                const isActive = pathname === href;
                return (
                  <Link
                    key={href}
                    href={href}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-[14px] font-medium transition-colors"
                    style={{
                      background: isActive ? 'var(--color-accent-muted)' : 'transparent',
                      color: isActive ? 'var(--color-text)' : 'var(--color-text-secondary)',
                    }}
                  >
                    <Icon size={18} strokeWidth={isActive ? 2.2 : 1.8} />
                    {label}
                  </Link>
                );
              })}

              <div className="h-px bg-[var(--color-border)] my-1" />

              {user ? (
                <>
                  <div className="flex items-center gap-3 px-4 py-3 text-[14px] text-[var(--color-text-secondary)]">
                    <User size={18} strokeWidth={1.8} />
                    {user.username}
                  </div>
                  <button
                    onClick={logout}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-[14px] text-[var(--color-text-secondary)] hover:bg-white/[0.04] transition-colors"
                  >
                    <LogOut size={18} strokeWidth={1.8} />
                    Log out
                  </button>
                </>
              ) : (
                <div className="flex gap-2 p-2">
                  <Link
                    href="/login"
                    className="flex-1 py-2.5 rounded-xl text-center text-[14px] font-medium text-[var(--color-text-secondary)] border border-[var(--color-border)]"
                  >
                    Log in
                  </Link>
                  <Link
                    href="/signup"
                    className="flex-1 py-2.5 rounded-xl text-center text-[14px] font-semibold bg-[var(--color-accent)] text-white"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
