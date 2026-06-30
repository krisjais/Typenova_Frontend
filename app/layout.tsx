import type { Metadata } from 'next';
import { Geist, Orbitron, Space_Grotesk } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { LevelProvider } from '@/context/LevelContext';
import Navbar from '@/components/Navbar';
import LevelGate from '@/components/LevelGate';

const geist = Geist({
  subsets: ['latin'],
  variable: '--font-geist',
  display: 'swap',
});

const orbitron = Orbitron({
  subsets: ['latin'],
  variable: '--font-orbitron',
  display: 'swap',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'TypeNova — Master Your Typing',
  description:
    'Practice smarter with AI insights, typing games, achievements, analytics, and real-time progress tracking. The premium typing platform for professionals.',
  keywords: ['typing', 'typing practice', 'wpm', 'typing speed', 'typing test', 'keyboard practice'],
  openGraph: {
    title: 'TypeNova — Master Your Typing',
    description:
      'Practice smarter with AI insights, typing games, achievements, analytics, and real-time progress tracking.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geist.variable} ${orbitron.variable} ${spaceGrotesk.variable} dark`} suppressHydrationWarning>
      <head>
        <meta name="google-site-verification" content="qY__Hd123YeY4-NH_CLjf2GK5s0rq7_HN9fJXJo9EFI" />
        <meta name="theme-color" content="#09090B" />
      </head>
      <body className="antialiased">
        <AuthProvider>
          <ThemeProvider>
            <LevelProvider>
              <Navbar />
              <LevelGate />
              <main className="min-h-screen">{children}</main>
            </LevelProvider>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
