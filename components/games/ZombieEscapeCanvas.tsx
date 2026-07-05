'use client';
import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Skull,
  Volume2,
  VolumeX,
  RotateCcw,
  Shield,
  Heart,
  Zap,
  Flame,
  Award,
  Gamepad2,
  Crosshair,
  Sparkles,
  Trophy
} from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

// ─── Web Audio API Sound Synthesizer ─────────────────────────────────────────
class ZombieAudioSynth {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;

  constructor() {}

  private init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public playPistol() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(400, now);
    osc.frequency.exponentialRampToValueAtTime(10, now + 0.08);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.08);
  }

  public playShotgun() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const bufferSize = this.ctx.sampleRate * 0.25;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(300, now);
    filter.frequency.linearRampToValueAtTime(100, now + 0.25);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    noise.start(now);
    noise.stop(now + 0.25);
  }

  public playLaser() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1200, now);
    osc.frequency.exponentialRampToValueAtTime(300, now + 0.15);

    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.15);
  }

  public playExplosion() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const bufferSize = this.ctx.sampleRate * 0.4;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(200, now);
    filter.frequency.linearRampToValueAtTime(30, now + 0.4);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    noise.start(now);
    noise.stop(now + 0.4);
  }

  public playZombieGroan() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(80, now);
    osc.frequency.linearRampToValueAtTime(60, now + 0.3);

    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(85, now);
    osc2.frequency.linearRampToValueAtTime(65, now + 0.3);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

    osc.connect(gain);
    osc2.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc2.start(now);
    osc.stop(now + 0.3);
    osc2.stop(now + 0.3);
  }

  public playHurt() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.linearRampToValueAtTime(50, now + 0.15);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.15);
  }

  public playUpgrade() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(300, now);
    osc.frequency.setValueAtTime(450, now + 0.08);
    osc.frequency.setValueAtTime(600, now + 0.16);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.25);
  }
}

// ─── Word Repositories by Difficulty ──────────────────────────────────────────
const WORDS = {
  easy: ['run', 'fast', 'flee', 'dash', 'rush', 'kill', 'aim', 'shot', 'gun', 'ammo', 'fire', 'gate', 'lock', 'fury', 'safe', 'wall'],
  normal: ['zombie', 'scared', 'shadow', 'horror', 'escape', 'pistol', 'bullet', 'trigger', 'shield', 'weapon', 'danger', 'attack', 'groan', 'undead', 'rotter'],
  hard: ['apocalypse', 'barricade', 'shotgun', 'assault', 'ammunition', 'gargantuan', 'contamination', 'piercing', 'abomination', 'annihilation', 'survivor', 'explosive'],
  nightmare: ['biohazard', 'desolation', 'extermination', 'cataclysm', 'quarantine', 'devastation', 'neurotoxin', 'juggernaut', 'reanimation', 'decimation']
};

interface Enemy {
  id: number;
  word: string;
  typed: string;
  x: number;
  y: number;
  speed: number;
  health: number;
  maxHealth: number;
  type: 'normal' | 'runner' | 'tank' | 'boss';
  width: number;
  height: number;
  color: string;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  alpha: number;
  life: number;
}

export default function ZombieEscapeCanvas() {
  const { user } = useAuth();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const synthRef = useRef<ZombieAudioSynth | null>(null);

  // Sound Synth Toggle
  const [audioEnabled, setAudioEnabled] = useState(true);

  // Core Game State
  const [gameStatus, setGameStatus] = useState<'menu' | 'playing' | 'wave_clear' | 'game_over' | 'victory'>('menu');
  const [difficulty, setDifficulty] = useState<'easy' | 'normal' | 'hard' | 'nightmare'>('normal');
  const [wave, setWave] = useState(1);
  const [health, setHealth] = useState(100);
  const [shield, setShield] = useState(25);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [xpEarned, setXpEarned] = useState(0);

  // Weapons State
  const [selectedWeapon, setSelectedWeapon] = useState<'pistol' | 'shotgun' | 'rifle' | 'laser' | 'rocket'>('pistol');
  const [unlockedWeapons, setUnlockedWeapons] = useState<string[]>(['pistol']);

  // Dynamic typing tracker
  const [activeInput, setActiveInput] = useState('');
  
  // Game Loop Refs
  const enemiesRef = useRef<Enemy[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const animationFrameId = useRef<number | null>(null);
  const totalKeystrokes = useRef(0);
  const correctKeystrokes = useRef(0);
  const startTime = useRef<number | null>(null);
  const enemyIdCounter = useRef(0);
  const screenShake = useRef(0);
  const flashActive = useRef(false);

  // Initialize synth
  useEffect(() => {
    synthRef.current = new ZombieAudioSynth();
  }, []);

  useEffect(() => {
    if (synthRef.current) {
      synthRef.current.enabled = audioEnabled;
    }
  }, [audioEnabled]);

  // Sound helpers
  const triggerGroan = useCallback(() => {
    if (synthRef.current && Math.random() < 0.1) {
      synthRef.current.playZombieGroan();
    }
  }, []);

  const spawnZombiesForWave = (waveNum: number, diff: string) => {
    enemiesRef.current = [];
    enemyIdCounter.current = 0;

    let baseCount = 5 + waveNum * 3;
    let speedMult = 1 + (waveNum * 0.1);
    if (diff === 'easy') speedMult *= 0.7;
    if (diff === 'hard') speedMult *= 1.3;
    if (diff === 'nightmare') speedMult *= 1.6;

    const wordPool = WORDS[diff as keyof typeof WORDS] || WORDS.normal;

    for (let i = 0; i < baseCount; i++) {
      const typeRand = Math.random();
      let type: 'normal' | 'runner' | 'tank' = 'normal';
      let hp = 1;
      let speed = 0.6 * speedMult;
      let width = 30;
      let height = 50;
      let color = '#22c55e'; // Green

      if (typeRand < 0.25) {
        type = 'runner';
        hp = 1;
        speed = 1.2 * speedMult;
        color = '#eab308'; // Yellow
        width = 25;
        height = 45;
      } else if (typeRand > 0.85) {
        type = 'tank';
        hp = 3;
        speed = 0.3 * speedMult;
        color = '#ef4444'; // Red
        width = 40;
        height = 65;
      }

      const word = wordPool[Math.floor(Math.random() * wordPool.length)];

      enemiesRef.current.push({
        id: enemyIdCounter.current++,
        word,
        typed: '',
        x: 850 + i * (120 + Math.random() * 80), // Spawn staggered from the right
        y: 100 + Math.random() * 240, // Vertical distribution on road
        speed,
        health: hp,
        maxHealth: hp,
        type,
        width,
        height,
        color
      });
    }

    // Spawn BOSS zombie on final wave (wave 5 or 10)
    if (waveNum === 5 || waveNum === 10) {
      const bossWordPool = WORDS.nightmare;
      const bossWord = bossWordPool[Math.floor(Math.random() * bossWordPool.length)];
      enemiesRef.current.push({
        id: enemyIdCounter.current++,
        word: bossWord,
        typed: '',
        x: 950 + baseCount * 100,
        y: 200,
        speed: 0.2 * speedMult,
        health: 10,
        maxHealth: 10,
        type: 'boss',
        width: 70,
        height: 100,
        color: '#a855f7' // Purple
      });
    }
  };

  const startWave = (waveNum: number) => {
    setWave(waveNum);
    setGameStatus('playing');
    setActiveInput('');
    spawnZombiesForWave(waveNum, difficulty);
    if (waveNum === 1) {
      setScore(0);
      setCombo(0);
      setMaxCombo(0);
      setHealth(100);
      setShield(25);
      setUnlockedWeapons(['pistol']);
      setSelectedWeapon('pistol');
      totalKeystrokes.current = 0;
      correctKeystrokes.current = 0;
      startTime.current = Date.now();
    }
    if (synthRef.current) {
      synthRef.current.playUpgrade();
    }
  };

  // Keyboard Handler
  useEffect(() => {
    if (gameStatus !== 'playing') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key.length !== 1 && e.key !== 'Backspace') return;
      e.preventDefault();

      totalKeystrokes.current += 1;
      
      // Filter list of active matching enemies
      const currentInput = e.key === 'Backspace' ? activeInput.slice(0, -1) : activeInput + e.key;
      
      // Check if currentInput matches prefix of any enemy
      const matches = enemiesRef.current.filter(enemy => 
        enemy.x < 850 && // screen boundary filter
        enemy.word.startsWith(currentInput)
      );

      if (matches.length > 0) {
        // Valid keystroke
        correctKeystrokes.current += 1;
        setActiveInput(currentInput);
        setCombo(prev => {
          const next = prev + 1;
          if (next > maxCombo) setMaxCombo(next);
          return next;
        });

        // Trigger Weapon Firing on Full Word match
        const exactMatch = matches.find(enemy => enemy.word === currentInput);
        if (exactMatch) {
          fireWeapon(exactMatch);
          setActiveInput('');
        }
      } else {
        // Wrong letter
        setCombo(0);
        // Visual flash feedback
        flashActive.current = true;
        setTimeout(() => flashActive.current = false, 50);
        if (synthRef.current) {
          synthRef.current.playHurt();
        }
      }

      // Compute live WPM and Accuracy
      const timeElapsed = startTime.current ? (Date.now() - startTime.current) / 60000 : 0.01;
      const calculatedWpm = Math.round((correctKeystrokes.current / 5) / Math.max(0.01, timeElapsed));
      const calculatedAcc = Math.round((correctKeystrokes.current / totalKeystrokes.current) * 100);
      setWpm(calculatedWpm);
      setAccuracy(calculatedAcc);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [gameStatus, activeInput, maxCombo]);

  const fireWeapon = (target: Enemy) => {
    // 1. Weapon damage properties
    let dmg = 1;
    let shake = 5;

    // Apply combo multipliers
    const comboDmgMultiplier = combo > 20 ? 3 : combo > 10 ? 2 : 1.5;

    if (selectedWeapon === 'pistol') {
      synthRef.current?.playPistol();
      dmg = 1;
      shake = 3;
    } else if (selectedWeapon === 'shotgun') {
      synthRef.current?.playShotgun();
      dmg = 2;
      shake = 8;
    } else if (selectedWeapon === 'rifle') {
      synthRef.current?.playPistol(); // rapid fire sound
      dmg = 1.5;
      shake = 4;
    } else if (selectedWeapon === 'laser') {
      synthRef.current?.playLaser();
      dmg = 3;
      shake = 6;
    } else if (selectedWeapon === 'rocket') {
      synthRef.current?.playExplosion();
      dmg = 5;
      shake = 15;
    }

    screenShake.current = shake;
    
    // Apply damage to target zombie
    target.health -= dmg * comboDmgMultiplier;

    // Laser Piercing mechanic: hit other enemies on the same horizontal path
    if (selectedWeapon === 'laser') {
      enemiesRef.current.forEach(e => {
        if (e.id !== target.id && Math.abs(e.y - target.y) < 25) {
          e.health -= 1.5;
        }
      });
    }

    // Rocket explosion mechanic: damage nearby enemies
    if (selectedWeapon === 'rocket') {
      enemiesRef.current.forEach(e => {
        if (e.id !== target.id) {
          const dist = Math.hypot(e.x - target.x, e.y - target.y);
          if (dist < 100) {
            e.health -= 3;
          }
        }
      });
      // Spawn explosion particles
      for (let i = 0; i < 25; i++) {
        particlesRef.current.push({
          x: target.x,
          y: target.y,
          vx: (Math.random() - 0.5) * 6,
          vy: (Math.random() - 0.5) * 6,
          color: '#f97316',
          size: 4 + Math.random() * 4,
          alpha: 1,
          life: 30 + Math.random() * 20
        });
      }
    }

    // Spawn normal bullet impact particles
    for (let i = 0; i < 8; i++) {
      particlesRef.current.push({
        x: target.x,
        y: target.y,
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.5) * 4,
        color: '#ef4444', // Blood splash
        size: 2 + Math.random() * 3,
        alpha: 1,
        life: 20 + Math.random() * 15
      });
    }

    // If zombie dies, remove from array
    if (target.health <= 0) {
      setScore(prev => prev + (target.type === 'boss' ? 500 : target.type === 'tank' ? 200 : 100));
      enemiesRef.current = enemiesRef.current.filter(e => e.id !== target.id);
    }
  };

  // Weapon unlocking based on wave progression
  useEffect(() => {
    if (wave >= 2 && !unlockedWeapons.includes('shotgun')) {
      setUnlockedWeapons(prev => [...prev, 'shotgun']);
      synthRef.current?.playUpgrade();
    }
    if (wave >= 3 && !unlockedWeapons.includes('rifle')) {
      setUnlockedWeapons(prev => [...prev, 'rifle']);
    }
    if (wave >= 4 && !unlockedWeapons.includes('laser')) {
      setUnlockedWeapons(prev => [...prev, 'laser']);
    }
    if (wave >= 5 && !unlockedWeapons.includes('rocket')) {
      setUnlockedWeapons(prev => [...prev, 'rocket']);
    }
  }, [wave, unlockedWeapons]);

  // Main Canvas Render Loop
  useEffect(() => {
    if (gameStatus !== 'playing') {
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const gameLoop = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // ─── Camera shake ───
      ctx.save();
      if (screenShake.current > 0) {
        const dx = (Math.random() - 0.5) * screenShake.current;
        const dy = (Math.random() - 0.5) * screenShake.current;
        ctx.translate(dx, dy);
        screenShake.current *= 0.9;
        if (screenShake.current < 0.1) screenShake.current = 0;
      }

      // ─── Render Atmospheric Dark Corridor Background ───
      ctx.fillStyle = '#0a0a0c';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Floor tiles lines
      ctx.strokeStyle = '#1e1b4b';
      ctx.lineWidth = 1;
      for (let y = 100; y < 350; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Left door / Safe Wall
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(0, 0, 70, canvas.height);
      ctx.fillStyle = '#f43f5e'; // Safe Gate warning lines
      ctx.fillRect(65, 0, 5, canvas.height);

      // ─── Render Player character (turret/survivor) ───
      ctx.fillStyle = '#38bdf8'; // Blue player capsule
      ctx.beginPath();
      ctx.roundRect(15, 170, 30, 60, 10);
      ctx.fill();

      // Gun muzzle direction
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(35, 190, 20, 8);

      // Draw active shield circle
      if (shield > 0) {
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(30, 200, 45, 0, Math.PI * 2);
        ctx.stroke();
      }

      // ─── Update & Render Enemies ───
      enemiesRef.current.forEach(enemy => {
        // Move towards left base
        enemy.x -= enemy.speed;

        // Render zombie sprite as stylized polygon
        ctx.fillStyle = enemy.color;
        ctx.beginPath();
        ctx.roundRect(enemy.x, enemy.y, enemy.width, enemy.height, 8);
        ctx.fill();

        // Render head/eyes
        ctx.fillStyle = '#09090b';
        ctx.beginPath();
        ctx.arc(enemy.x + 8, enemy.y + 12, 3, 0, Math.PI * 2);
        ctx.arc(enemy.x + 20, enemy.y + 12, 3, 0, Math.PI * 2);
        ctx.fill();

        // Health Bar above zombie
        ctx.fillStyle = '#3f3f46';
        ctx.fillRect(enemy.x, enemy.y - 12, enemy.width, 4);
        ctx.fillStyle = '#ef4444';
        const hpPercent = Math.max(0, enemy.health / enemy.maxHealth);
        ctx.fillRect(enemy.x, enemy.y - 12, enemy.width * hpPercent, 4);

        // Word Card Rendering
        ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
        ctx.strokeStyle = activeInput && enemy.word.startsWith(activeInput) ? '#38bdf8' : '#3f3f46';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(enemy.x - 15, enemy.y - 38, enemy.width + 30, 20, 5);
        ctx.fill();
        ctx.stroke();

        // Word Text Highlight letters typed
        ctx.font = 'bold 11px monospace';
        ctx.textAlign = 'center';
        
        const textY = enemy.y - 24;
        const textX = enemy.x + enemy.width / 2;
        const typedPart = activeInput && enemy.word.startsWith(activeInput) ? activeInput : '';
        const remainingPart = enemy.word.slice(typedPart.length);

        const textWidth = ctx.measureText(enemy.word).width;
        let startX = textX - textWidth / 2;

        ctx.fillStyle = '#38bdf8'; // Typed prefix matches blue
        ctx.textAlign = 'left';
        ctx.fillText(typedPart, startX, textY);
        
        ctx.fillStyle = '#e2e8f0'; // Remaining letters white
        const typedWidth = ctx.measureText(typedPart).width;
        ctx.fillText(remainingPart, startX + typedWidth, textY);

        // Check if zombie reached defensive perimeter
        if (enemy.x <= 70) {
          triggerHurt();
          enemy.x = 900; // Reset zombie position stagger back
        }

        // Random groaned sounds
        triggerGroan();
      });

      // ─── Update & Render Particles ───
      particlesRef.current.forEach((p, idx) => {
        p.x += p.vx;
        p.y += p.vy;
        p.life--;
        p.alpha = p.life / 50;

        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;
      });
      // Filter dead particles
      particlesRef.current = particlesRef.current.filter(p => p.life > 0);

      // Check wave win conditions
      if (enemiesRef.current.length === 0) {
        if (wave === 5 || wave === 10) {
          // Final wave cleared - Victory!
          handleVictory();
        } else {
          // Clear wave
          setGameStatus('wave_clear');
        }
      }

      // Red damage indicator flash
      if (flashActive.current) {
        ctx.fillStyle = 'rgba(239, 68, 68, 0.15)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      ctx.restore();
      animationFrameId.current = requestAnimationFrame(gameLoop);
    };

    animationFrameId.current = requestAnimationFrame(gameLoop);

    return () => {
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
    };
  }, [gameStatus, activeInput, wave, score, shield, health, selectedWeapon]);

  const triggerHurt = () => {
    // If shield active, damage shield first
    if (synthRef.current) {
      synthRef.current.playHurt();
    }
    screenShake.current = 10;

    if (shield > 0) {
      setShield(prev => Math.max(0, prev - 10));
    } else {
      setHealth(prev => {
        const next = Math.max(0, prev - 15);
        if (next === 0) {
          handleGameOver();
        }
        return next;
      });
    }
  };

  const handleGameOver = () => {
    setGameStatus('game_over');
  };

  const handleVictory = async () => {
    setGameStatus('victory');
    // Calculate and award XP
    const earnedXp = Math.round(score * 0.15 + (accuracy * 2));
    setXpEarned(earnedXp);

    // Save stats locally on DB
    try {
      await api.saveStats({
        wpm,
        accuracy,
        errors: totalKeystrokes.current - correctKeystrokes.current,
        mode: 'practice',
        duration: startTime.current ? Math.round((Date.now() - startTime.current) / 1000) : 60,
        category: 'Zombie Escape',
        difficulty: difficulty.toUpperCase()
      });
    } catch (err) {
      console.error('Failed to save zombie escape stats:', err);
    }
  };

  return (
    <div className="w-full flex flex-col gap-6">
      {/* HUD Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-rose-400 font-bold text-xs">
            <Heart size={14} className="fill-current" />
            <span>HP: {health}%</span>
          </div>

          <div className="flex items-center gap-1.5 text-sky-400 font-bold text-xs">
            <Shield size={14} />
            <span>Shield: {shield}%</span>
          </div>

          <div className="text-xs text-[var(--color-text-secondary)] font-mono">
            Score: <strong className="text-[var(--color-text)]">{score}</strong>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono">
          <div>Wave: <strong className="text-[var(--color-accent)]">{wave}/5</strong></div>
          <div className="hidden sm:block">WPM: <strong>{wpm}</strong></div>
          <div className="hidden sm:block">Acc: <strong>{accuracy}%</strong></div>
          
          {combo > 0 && (
            <div className="flex items-center gap-1 text-[var(--color-warning)] font-extrabold animate-pulse">
              <Flame size={12} />
              Combo: {combo}
            </div>
          )}

          {/* Sound toggle */}
          <button
            onClick={() => setAudioEnabled(!audioEnabled)}
            className="p-1.5 rounded-lg border border-[var(--color-border)] hover:bg-white/[0.04] text-[var(--color-text-secondary)] cursor-pointer"
          >
            {audioEnabled ? <Volume2 size={12} /> : <VolumeX size={12} />}
          </button>
        </div>
      </div>

      {/* Main View Container */}
      <div className="relative border border-[var(--color-border)] rounded-2xl overflow-hidden bg-[#070709] min-h-[380px] flex items-center justify-center">
        <AnimatePresence mode="wait">
          {/* MENU VIEW */}
          {gameStatus === 'menu' && (
            <motion.div
              key="menu"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="text-center p-8 flex flex-col items-center max-w-sm"
            >
              <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mb-4 text-rose-400">
                <Skull size={24} />
              </div>

              <h2 className="text-xl font-black uppercase tracking-wider text-[var(--color-text)] mb-2">Zombie Escape</h2>
              <p className="text-xs text-[var(--color-text-secondary)] mb-6">Type approaching words to damage wave hordes before they breach the base.</p>

              {/* Difficulty selects */}
              <div className="w-full flex gap-1 p-1 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] mb-6">
                {['easy', 'normal', 'hard', 'nightmare'].map(d => (
                  <button
                    key={d}
                    onClick={() => setDifficulty(d as any)}
                    className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg uppercase transition-all cursor-pointer ${
                      difficulty === d
                        ? 'bg-rose-500/20 text-rose-400'
                        : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text)]'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>

              <button
                onClick={() => startWave(1)}
                className="w-full py-3.5 rounded-xl bg-rose-500 text-white font-extrabold text-xs uppercase hover:bg-rose-600 transition-colors shadow-md shadow-rose-500/10 cursor-pointer"
              >
                Start Survival
              </button>
            </motion.div>
          )}

          {/* PLAYING VIEW (CANVAS) */}
          {gameStatus === 'playing' && (
            <motion.div
              key="playing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full"
            >
              <canvas
                ref={canvasRef}
                width={850}
                height={350}
                className="w-full block bg-black select-none"
              />

              {/* Weapons bar bottom overlay */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 p-1.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]/90 backdrop-blur-md">
                {[
                  { id: 'pistol', label: 'Pistol', icon: Crosshair },
                  { id: 'shotgun', label: 'Shotgun', icon: Zap },
                  { id: 'rifle', label: 'Rifle', icon: Flame },
                  { id: 'laser', label: 'Laser', icon: Sparkles },
                  { id: 'rocket', label: 'Rocket', icon: Award }
                ].map(w => {
                  const unlocked = unlockedWeapons.includes(w.id);
                  const active = selectedWeapon === w.id;

                  return (
                    <button
                      key={w.id}
                      disabled={!unlocked}
                      onClick={() => setSelectedWeapon(w.id as any)}
                      className={`px-3 py-2 rounded-lg text-[10px] font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer ${
                        active
                          ? 'bg-[var(--color-accent)] text-white'
                          : unlocked
                          ? 'text-[var(--color-text-secondary)] hover:bg-white/[0.04]'
                          : 'opacity-30 cursor-not-allowed'
                      }`}
                    >
                      <w.icon size={11} />
                      {w.label}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* WAVE CLEAR VIEW */}
          {gameStatus === 'wave_clear' && (
            <motion.div
              key="wave_clear"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="text-center p-6 flex flex-col items-center max-w-sm"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-4 text-emerald-400">
                <Skull size={20} />
              </div>

              <h2 className="text-lg font-black uppercase tracking-wider text-[var(--color-text)] mb-1">Wave {wave} Cleared!</h2>
              <p className="text-xs text-[var(--color-text-secondary)] mb-6">Repairing shields. Get ready for the next wave.</p>

              <button
                onClick={() => {
                  setShield(prev => Math.min(100, prev + 25));
                  startWave(wave + 1);
                }}
                className="px-6 py-2.5 rounded-xl bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)] transition-colors text-xs font-bold uppercase cursor-pointer"
              >
                Start Wave {wave + 1}
              </button>
            </motion.div>
          )}

          {/* GAME OVER VIEW */}
          {gameStatus === 'game_over' && (
            <motion.div
              key="game_over"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="text-center p-8 flex flex-col items-center max-w-sm"
            >
              <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mb-4 text-rose-500">
                <Skull size={24} />
              </div>

              <h2 className="text-lg font-black uppercase tracking-wider text-rose-500 mb-1">You Were Overrun</h2>
              <p className="text-xs text-[var(--color-text-secondary)] mb-6">Survived to Wave {wave} with a score of {score}.</p>

              <div className="flex gap-2 w-full">
                <button
                  onClick={() => setGameStatus('menu')}
                  className="flex-1 py-2.5 rounded-xl border border-[var(--color-border)] text-xs text-[var(--color-text)] font-bold hover:bg-white/[0.04] cursor-pointer"
                >
                  Main Menu
                </button>
                <button
                  onClick={() => startWave(1)}
                  className="flex-1 py-2.5 rounded-xl bg-rose-500 text-white font-bold text-xs hover:bg-rose-600 cursor-pointer"
                >
                  Try Again
                </button>
              </div>
            </motion.div>
          )}

          {/* VICTORY VIEW */}
          {gameStatus === 'victory' && (
            <motion.div
              key="victory"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="text-center p-8 flex flex-col items-center max-w-sm"
            >
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-4 text-amber-500">
                <Trophy size={24} />
              </div>

              <h2 className="text-lg font-black uppercase tracking-wider text-[var(--color-warning)] mb-1">Survivor Victory!</h2>
              <p className="text-xs text-[var(--color-text-secondary)] mb-6">You defeated all waves and saved the compound!</p>

              {/* Stats Box */}
              <div className="w-full p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-xs text-left mb-6 space-y-2 font-mono">
                <div className="flex justify-between">
                  <span>Difficulty:</span>
                  <span className="font-bold uppercase text-[var(--color-text)]">{difficulty}</span>
                </div>
                <div className="flex justify-between">
                  <span>Score:</span>
                  <span className="font-bold text-[var(--color-text)]">{score}</span>
                </div>
                <div className="flex justify-between">
                  <span>Max Combo:</span>
                  <span className="font-bold text-[var(--color-warning)]">{maxCombo}</span>
                </div>
                <div className="flex justify-between">
                  <span>WPM:</span>
                  <span className="font-bold text-[var(--color-accent)]">{wpm}</span>
                </div>
                <div className="flex justify-between">
                  <span>Accuracy:</span>
                  <span className="font-bold text-[var(--color-success)]">{accuracy}%</span>
                </div>
                <div className="flex justify-between border-t border-[var(--color-border)] pt-2 text-[var(--color-accent)] font-bold">
                  <span>XP Earned:</span>
                  <span>+{xpEarned} XP</span>
                </div>
              </div>

              <button
                onClick={() => setGameStatus('menu')}
                className="w-full py-3 rounded-xl bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)] transition-colors text-xs font-bold uppercase cursor-pointer"
              >
                Return to Lobby
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
