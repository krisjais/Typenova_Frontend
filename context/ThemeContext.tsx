'use client';
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { api } from '@/lib/api';
import { useAuth } from './AuthContext';

export interface ThemeConfig {
  background: string;
  text: string;
  accent: string;
  mode: 'dark' | 'light';
}

const DEFAULT_THEME: ThemeConfig = {
  background: '#09090B',
  text: '#FAFAFA',
  accent: '#7C5CFF',
  mode: 'dark',
};

interface ThemeContextType {
  theme: ThemeConfig;
  setTheme: (t: ThemeConfig) => void;
  saveTheme: (t: ThemeConfig) => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType>({} as ThemeContextType);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [theme, setThemeState] = useState<ThemeConfig>(DEFAULT_THEME);

  // Load theme from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('theme');
    if (saved) setThemeState(JSON.parse(saved));
  }, []);

  // Apply CSS variables whenever theme changes
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--color-bg', theme.background);
    root.style.setProperty('--color-text', theme.text);
    root.style.setProperty('--color-accent', theme.accent);
  }, [theme]);

  const setTheme = (t: ThemeConfig) => {
    setThemeState(t);
    localStorage.setItem('theme', JSON.stringify(t));
  };

  const saveTheme = async (t: ThemeConfig) => {
    setTheme(t);
    if (user) await api.saveTheme(t);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, saveTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
