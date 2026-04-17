'use client';
import { useLevel } from '@/context/LevelContext';
import LevelSelectModal from './LevelSelectModal';
import { Level } from '@/utils/typing';

export default function LevelGate() {
  const { needsLevelSelect, setLevel } = useLevel();

  if (!needsLevelSelect) return null;

  const handleSelect = (level: Level) => {
    setLevel(level);
  };

  return <LevelSelectModal onSelect={handleSelect} />;
}
