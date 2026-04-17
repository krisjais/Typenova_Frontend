'use client';
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { api } from '@/lib/api';
import { Level, checkPromotion } from '@/utils/typing';
import { useAuth } from './AuthContext';

interface LevelContextType {
  level: Level | null;
  setLevel: (l: Level) => void;
  checkAndPromote: (recentWpms: number[]) => Level | null;
  needsLevelSelect: boolean;
}

const LevelContext = createContext<LevelContextType>({} as LevelContextType);

export function LevelProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [level, setLevelState] = useState<Level | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!user) { setLoaded(true); return; }
    // Try fetching from API
    api.getLevel()
      .then((d) => {
        const l = (d as { level: Level | null }).level;
        setLevelState(l);
      })
      .catch(() => {
        // fallback to localStorage
        const saved = localStorage.getItem('level') as Level | null;
        setLevelState(saved);
      })
      .finally(() => setLoaded(true));
  }, [user]);

  const setLevel = (l: Level) => {
    setLevelState(l);
    localStorage.setItem('level', l);
  };

  const checkAndPromote = (recentWpms: number[]): Level | null => {
    if (!level) return null;
    const promoted = checkPromotion(level, recentWpms);
    if (promoted) {
      setLevel(promoted);
      api.setLevel({ level: promoted }).catch(() => {});
      return promoted;
    }
    return null;
  };

  // Show modal only when user is logged in, loaded, and has no level set
  const needsLevelSelect = !!user && loaded && level === null;

  return (
    <LevelContext.Provider value={{ level, setLevel, checkAndPromote, needsLevelSelect }}>
      {children}
    </LevelContext.Provider>
  );
}

export const useLevel = () => useContext(LevelContext);
