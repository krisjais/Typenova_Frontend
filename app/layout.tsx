import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { LevelProvider } from '@/context/LevelContext';
import Navbar from '@/components/Navbar';
import LevelGate from '@/components/LevelGate';

export const metadata: Metadata = {
  title: 'TypeNova — Typing Practice',
  description: 'Improve your typing speed and accuracy with TypeNova',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <AuthProvider>
          <ThemeProvider>
            <LevelProvider>
              <Navbar />
              <LevelGate />
              <main className="min-h-screen pt-16">{children}</main>
            </LevelProvider>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
