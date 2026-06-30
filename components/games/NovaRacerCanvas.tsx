'use client';
import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  Volume2,
  VolumeX,
  RotateCcw,
  Compass,
  Heart,
  ShoppingBag,
  Settings as SettingsIcon,
  Zap,
  Radio,
  Cpu,
  Flame,
  Award,
  Sliders,
  ChevronRight,
  User,
  Flag,
  Globe,
  Trophy,
} from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

// ─── Web Audio API Sound Synthesizer ─────────────────────────────────────────
class AudioSynth {
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

  public playLaser() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(200, now + 0.1);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.linearRampToValueAtTime(0.01, now + 0.1);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.1);
  }

  public playExplosion() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const bufferSize = this.ctx.sampleRate * 0.35;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(450, now);
    filter.frequency.linearRampToValueAtTime(50, now + 0.35);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    noise.start(now);
    noise.stop(now + 0.35);
  }

  public playBoost() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(90, now);
    osc.frequency.exponentialRampToValueAtTime(600, now + 0.4);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.linearRampToValueAtTime(0.01, now + 0.4);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.4);
  }

  public playScreech() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(350, now);
    osc.frequency.linearRampToValueAtTime(320, now + 0.25);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.linearRampToValueAtTime(0.01, now + 0.25);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.25);
  }

  public playError() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.setValueAtTime(90, now + 0.08);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.linearRampToValueAtTime(0.01, now + 0.15);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.15);
  }

  public playVictory() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const notes = [261.63, 329.63, 392.00, 523.25];
    notes.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);
      gain.gain.setValueAtTime(0.12, now + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.005, now + idx * 0.08 + 0.3);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);

      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.3);
    });
  }

  public playGameOver() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const notes = [392.00, 349.23, 311.13, 220.00];
    notes.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.12);
      gain.gain.setValueAtTime(0.15, now + idx * 0.12);
      gain.gain.exponentialRampToValueAtTime(0.005, now + idx * 0.12 + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);

      osc.start(now + idx * 0.12);
      osc.stop(now + idx * 0.12 + 0.35);
    });
  }
}

const audio = new AudioSynth();

// ─── Word Pools ─────────────────────────────────────────────────────────────
const WORD_POOL = [
  'accelerate', 'supercharger', 'adrenaline', 'overdrive', 'combustion', 'telemetry',
  'trackfield', 'championship', 'formula', 'aerodynamics', 'velocity', 'momentum',
  'precision', 'performance', 'nitro', 'spoiler', 'exhaust', 'suspension', 'friction',
  'headlight', 'checkpoint', 'transmission', 'hypercar', 'tuner', 'drift', 'carbon'
];

export interface CustomCarConfig {
  paint: string; // Hex color
  spoiler: string; // 'none' | 'aero' | 'drag' | 'cyber'
  rims: string; // 'spoke' | 'tri-y' | 'aero'
  licensePlate: string;
  windowTint?: string;
}

interface Opponent {
  id: number;
  name: string;
  avatar: string;
  country: string;
  level: number;
  carColor: string;
  wpm: number;
  progress: number; // 0 to 1000 meters
  carX: number;
  lane: number;
}

export default function NovaRacerCanvas() {
  const { user } = useAuth();
  const triggerLaserSound = () => audio.playLaser();
  const triggerExplosionSound = () => audio.playExplosion();
  const triggerBoostSound = () => audio.playBoost();
  const triggerScreechSound = () => audio.playScreech();
  const triggerErrorSound = () => audio.playError();

  // Game States
  const [gameState, setGameState] = useState<'MENU' | 'CUSTOMIZATION' | 'SETTINGS' | 'MATCHMAKING' | 'COUNTDOWN' | 'PLAYING' | 'FINISHED'>('MENU');
  
  // Customization wallets
  const [coins, setCoins] = useState<number>(0);
  const [xp, setXp] = useState<number>(0);
  
  // Garage Equipped Setup
  const [equippedCar, setEquippedCar] = useState<CustomCarConfig>({
    paint: '#7C5CFF',
    spoiler: 'none',
    rims: 'spoke',
    licensePlate: 'NOVA-1',
  });

  // Settings
  const [soundOn, setSoundOn] = useState<boolean>(true);
  const [weatherMode, setWeatherMode] = useState<'sunny' | 'night' | 'sunset' | 'rain'>('sunny');
  const [difficulty, setDifficulty] = useState<'normal' | 'hard'>('normal');

  // Gameplay Live Metrics
  const [position, setPosition] = useState(8);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [combo, setCombo] = useState(0);
  const [nitroCharge, setNitroCharge] = useState(0);
  const [score, setScore] = useState(0);
  const [distance, setDistance] = useState(0);
  const [countdownVal, setCountdownVal] = useState<number | string>('3');

  // Matchmaking Grid Opponents
  const [opponents, setOpponents] = useState<Opponent[]>([]);

  // Typing Console states
  const [targetWord, setTargetWord] = useState('');
  const [typedBuffer, setTypedBuffer] = useState('');

  // Refs
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const loopRef = useRef<number | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Automatically refocus typing capture if focus is lost during live racing
  useEffect(() => {
    if (gameState === 'PLAYING') {
      inputRef.current?.focus();
    }
  }, [gameState]);

  useEffect(() => {
    const handleGlobalClick = () => {
      if (gameState === 'PLAYING') {
        inputRef.current?.focus();
      }
    };
    const handleGlobalKeyDown = () => {
      if (gameState === 'PLAYING' && document.activeElement !== inputRef.current) {
        inputRef.current?.focus();
      }
    };
    window.addEventListener('click', handleGlobalClick);
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => {
      window.removeEventListener('click', handleGlobalClick);
      window.removeEventListener('keydown', handleGlobalKeyDown);
    };
  }, [gameState]);

  // Stats ref
  const statsRef = useRef({
    distance: 0,
    wpm: 0,
    accuracy: 100,
    combo: 0,
    nitro: 0,
    nitroActive: false,
    nitroTimer: 0,
    speed: 0,
    targetSpeed: 0,
    score: 0,
    totalKeystrokes: 0,
    correctKeystrokes: 0,
    wordsCompleted: 0,
    stalled: false,
    stallTimer: 0,
    finishDistance: 1000,
    startTime: 0,
    lastTime: 0,
  });

  // Load Hangar Save State
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const savedCoins = localStorage.getItem('nova-coins');
    const savedXp = localStorage.getItem('nova-xp');
    const savedEquipped = localStorage.getItem('nova-equipped-car');

    if (savedCoins) setCoins(Number(savedCoins));
    if (savedXp) setXp(Number(savedXp));
    if (savedEquipped) setEquippedCar(JSON.parse(savedEquipped));
  }, []);

  const saveProfileData = (newCoins: number, newXp: number, newCar?: CustomCarConfig) => {
    setCoins(newCoins);
    setXp(newXp);
    localStorage.setItem('nova-coins', String(newCoins));
    localStorage.setItem('nova-xp', String(newXp));
    if (newCar) {
      setEquippedCar(newCar);
      localStorage.setItem('nova-equipped-car', JSON.stringify(newCar));
    }
  };

  const handleMuteToggle = () => {
    audio.enabled = !soundOn;
    setSoundOn(!soundOn);
  };

  // ─── Matchmaking Simulation ───────────
  const startMatchmaking = () => {
    setGameState('MATCHMAKING');
    
    // Setup simulated opponents
    const names = ['TurboType', 'VelocityMax', 'GearShift', 'HyperWPM', 'DriftKing', 'CarbonCruiser', 'ApexRacer'];
    const flags = ['US', 'DE', 'JP', 'GB', 'FR', 'CA', 'BR'];
    const colors = ['#EF4444', '#3B82F6', '#10B981', '#F59E0B', '#A855F7', '#EC4899', '#06B6D4'];

    const simulatedList: Opponent[] = names.map((name, idx) => ({
      id: idx + 1,
      name,
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${name}`,
      country: flags[idx],
      level: Math.floor(Math.random() * 45) + 5,
      carColor: colors[idx],
      wpm: Math.floor(Math.random() * 40) + 45,
      progress: 0,
      carX: 80,
      lane: idx + 1,
    }));
    setOpponents(simulatedList);

    // Simulate match connection fill delay (2.5s)
    setTimeout(() => {
      setCountdownVal(3);
      setGameState('COUNTDOWN');
      let count = 3;
      const countTimer = setInterval(() => {
        count -= 1;
        if (count === 0) {
          setCountdownVal('GO!');
        } else if (count < 0) {
          clearInterval(countTimer);
          setGameState('PLAYING');
        } else {
          setCountdownVal(count);
        }
      }, 1000);
    }, 2500);
  };

  // ─── Render Canvas Highway & Cars ──────────────────────────────────────────
  useEffect(() => {
    if (gameState !== 'PLAYING') {
      if (loopRef.current) cancelAnimationFrame(loopRef.current);
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      if (containerRef.current) {
        canvas.width = containerRef.current.clientWidth - 4;
        canvas.height = 400;
      }
    };
    resize();
    window.addEventListener('resize', resize);

    const stats = statsRef.current;
    stats.distance = 0;
    stats.speed = 0;
    stats.targetSpeed = 0;
    stats.score = 0;
    stats.wpm = 0;
    stats.accuracy = 100;
    stats.combo = 0;
    stats.nitro = 0;
    stats.nitroActive = false;
    stats.nitroTimer = 0;
    stats.totalKeystrokes = 0;
    stats.correctKeystrokes = 0;
    stats.wordsCompleted = 0;
    stats.stalled = false;
    stats.stallTimer = 0;
    stats.startTime = Date.now();
    stats.lastTime = Date.now();

    // Spawning target word
    setTargetWord(WORD_POOL[Math.floor(Math.random() * WORD_POOL.length)]);

    // Dynamic Parallax layers
    let roadScroll = 0;
    let bgScrollCity = 0;
    let bgScrollMountains = 0;

    let particles: { x: number; y: number; vx: number; vy: number; size: number; color: string; alpha: number; life: number; maxLife: number }[] = [];
    let rainDrops: { x: number; y: number; speed: number; len: number }[] = [];
    if (weatherMode === 'rain') {
      for (let r = 0; r < 50; r++) {
        rainDrops.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          speed: Math.random() * 8 + 12,
          len: Math.random() * 15 + 10,
        });
      }
    }

    const drawSportsCar = (c: CanvasRenderingContext2D, x: number, y: number, color: string, isPlayer: boolean, tireRotate: number) => {
      c.save();
      c.translate(x, y);

      // Tilts/Vibration effects when running
      const speedFactor = isPlayer ? stats.speed : 6;
      const shakeY = (Math.sin(Date.now() * 0.08) * 0.5) * (speedFactor > 1 ? 1 : 0.2);
      c.translate(0, shakeY);

      // Chassis shadow
      c.fillStyle = 'rgba(0,0,0,0.4)';
      c.beginPath();
      c.ellipse(0, 8, 38, 6, 0, 0, Math.PI * 2);
      c.fill();

      // Cyber Concept / Electric sports car body vectors
      c.fillStyle = color;
      c.strokeStyle = 'rgba(255,255,255,0.12)';
      c.lineWidth = 1.2;

      c.beginPath();
      c.moveTo(-32, 2);
      c.lineTo(-28, -6);
      c.lineTo(-12, -8);
      c.lineTo(4, -8);
      c.lineTo(16, -2);
      c.lineTo(34, 1);
      c.lineTo(36, 6);
      c.lineTo(-32, 6);
      c.closePath();
      c.fill();
      c.stroke();

      // Glass Cabin Windshield
      c.fillStyle = isPlayer ? equippedCar.windowTint || 'rgba(0,182,212,0.45)' : 'rgba(0,182,212,0.3)';
      c.beginPath();
      c.moveTo(-10, -8);
      c.lineTo(3, -8);
      c.lineTo(12, -2);
      c.lineTo(-12, -2);
      c.closePath();
      c.fill();

      // Spoiler details
      const spoilerType = isPlayer ? equippedCar.spoiler : 'aero';
      if (spoilerType !== 'none') {
        c.fillStyle = '#111113';
        c.fillRect(-31, -11, 4, 6);
        c.fillStyle = color;
        c.fillRect(-34, -13, 9, 3);
      }

      // Wheels
      const drawWheel = (wx: number, wy: number) => {
        c.save();
        c.translate(wx, wy);
        c.rotate(tireRotate);

        c.fillStyle = '#09090B';
        c.beginPath();
        c.arc(0, 0, 8, 0, Math.PI * 2);
        c.fill();

        // Rim spokes
        c.strokeStyle = '#D4D4D8';
        c.lineWidth = 1.5;
        c.beginPath();
        c.moveTo(-6, 0); c.lineTo(6, 0);
        c.moveTo(0, -6); c.lineTo(0, 6);
        c.stroke();
        c.restore();
      };

      drawWheel(-18, 6);
      drawWheel(18, 6);

      // Light glow effects
      c.fillStyle = '#E11D48'; // Brake light
      c.fillRect(-33, 1, 3, 3);

      c.fillStyle = '#F59E0B'; // Front head light
      c.fillRect(33, 1, 3, 3);

      // Exhaust nitro flames
      if (isPlayer && stats.nitroActive) {
        const flameLength = 12 + Math.random() * 8;
        const flameGrad = c.createLinearGradient(-33, 4, -33 - flameLength, 4);
        flameGrad.addColorStop(0, '#FFFFFF');
        flameGrad.addColorStop(0.3, '#3B82F6');
        flameGrad.addColorStop(1, 'transparent');

        c.fillStyle = flameGrad;
        c.beginPath();
        c.moveTo(-33, 2);
        c.lineTo(-33 - flameLength, 4);
        c.lineTo(-33, 6);
        c.closePath();
        c.fill();
      }

      c.restore();
    };

    // ─── Physics Frame Update Loop ───────────────────────────────────────────
    let tireRotate = 0;
    const gameLoop = () => {
      const now = Date.now();
      const dt = (now - stats.lastTime) / 1000;
      stats.lastTime = now;

      // Update player parameters
      if (stats.stalled) {
        stats.stallTimer -= dt;
        stats.targetSpeed = 0.5;
        if (stats.stallTimer <= 0) stats.stalled = false;
      } else {
        const base = stats.wpm * 0.12;
        stats.targetSpeed = Math.min(12, 1.8 + base);
      }

      if (stats.nitroActive) {
        stats.nitroTimer -= dt;
        stats.targetSpeed = 22.0;
        if (stats.nitroTimer <= 0) stats.nitroActive = false;
      }

      // Linear speed interpolation
      stats.speed += (stats.targetSpeed - stats.speed) * 0.08;
      stats.distance += stats.speed * dt * 15;
      setDistance(Math.floor(stats.distance));

      // Re-charge nitro status slightly
      if (stats.speed > 8) {
        stats.nitro = Math.min(100, stats.nitro + dt * 4.5);
      } else {
        stats.nitro = Math.max(0, stats.nitro - dt * 0.5);
      }
      setNitroCharge(Math.round(stats.nitro));

      // Exhaust particles spawning
      if (stats.speed > 1) {
        particles.push({
          x: 120, // Exhaust origin relative to player vehicle location
          y: 200 + 10 * 0, // Player is always centered on lane 0
          vx: -5 - stats.speed * 0.5,
          vy: Math.random() * 2 - 1,
          size: Math.random() * 2 + 1,
          color: stats.nitroActive ? '#3B82F6' : 'rgba(255,255,255,0.25)',
          alpha: 0.8,
          life: 0.4,
          maxLife: 0.4,
        });
      }

      // Rotate wheels based on current cruiser speed
      tireRotate += stats.speed * dt * 3.5;

      // Scroll background layers
      roadScroll = (roadScroll - stats.speed * dt * 150) % canvas.width;
      bgScrollCity = (bgScrollCity - stats.speed * dt * 25) % canvas.width;
      bgScrollMountains = (bgScrollMountains - stats.speed * dt * 8) % canvas.width;

      // Render Parallax Weather Background
      if (weatherMode === 'night') {
        ctx.fillStyle = '#050508';
      } else if (weatherMode === 'sunset') {
        ctx.fillStyle = '#1E1B4B';
      } else {
        ctx.fillStyle = '#09090B';
      }
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Render mountains
      ctx.fillStyle = '#18181B';
      ctx.beginPath();
      ctx.moveTo(bgScrollMountains, 150);
      ctx.lineTo(bgScrollMountains + 120, 80);
      ctx.lineTo(bgScrollMountains + 240, 150);
      ctx.moveTo(bgScrollMountains + 200, 150);
      ctx.lineTo(bgScrollMountains + 320, 90);
      ctx.lineTo(bgScrollMountains + 440, 150);
      ctx.fill();

      // Render City Skylines
      ctx.fillStyle = 'rgba(39, 39, 42, 0.4)';
      ctx.fillRect(bgScrollCity + 50, 100, 60, 150);
      ctx.fillRect(bgScrollCity + 140, 70, 75, 180);
      ctx.fillRect(bgScrollCity + 260, 110, 50, 140);
      ctx.fillRect(bgScrollCity + 350, 90, 80, 160);

      // Render Highway Roads lanes
      ctx.fillStyle = '#1E1B4B';
      ctx.fillRect(0, 240, canvas.width, 160);

      // Lane dividers dashes
      ctx.strokeStyle = '#FAFAFA';
      ctx.lineWidth = 2;
      ctx.setLineDash([25, 40]);
      ctx.beginPath();
      ctx.moveTo(roadScroll, 280); ctx.lineTo(roadScroll + canvas.width, 280);
      ctx.moveTo(roadScroll, 320); ctx.lineTo(roadScroll + canvas.width, 320);
      ctx.moveTo(roadScroll, 360); ctx.lineTo(roadScroll + canvas.width, 360);
      ctx.stroke();
      ctx.setLineDash([]); // Reset dash

      // Render simulated opponents
      const currentList: Opponent[] = [];
      opponentsRef.current.forEach((op, index) => {
        // AI progressive increments
        op.progress += op.wpm * dt * 0.7;
        const deltaDist = op.progress - stats.distance;
        
        // Map screen X relative to player (player car is always kept stationary at X=160)
        op.carX = 160 + deltaDist * 0.9;

        // Keep lane offsets
        const yOffset = 255 + op.lane * 15;
        drawSportsCar(ctx, op.carX, yOffset, op.carColor, false, tireRotate);
        currentList.push(op);
      });

      // Render Player Vehicle (stays stationary at X=160, lane 0)
      drawSportsCar(ctx, 160, 255, equippedCar.paint, true, tireRotate);

      // Render laser particles
      particles.forEach((p, idx) => {
        p.x += p.vx;
        p.y += p.vy;
        p.life -= dt;
        p.alpha = Math.max(0, p.life / p.maxLife);

        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        if (p.life <= 0) particles.splice(idx, 1);
      });

      // Render rain drops
      if (weatherMode === 'rain') {
        ctx.strokeStyle = 'rgba(156, 163, 175, 0.28)';
        ctx.lineWidth = 1.2;
        rainDrops.forEach((drop) => {
          drop.y += drop.speed;
          drop.x -= 2; // Diagonal angle
          if (drop.y > canvas.height) {
            drop.y = -20;
            drop.x = Math.random() * canvas.width;
          }
          ctx.beginPath();
          ctx.moveTo(drop.x, drop.y);
          ctx.lineTo(drop.x - 1, drop.y + drop.len);
          ctx.stroke();
        });
      }

      // Check finish line sector (1000m)
      if (stats.distance >= stats.finishDistance) {
        handleRaceFinished();
      }

      // Live ranking check
      // Sort player + opponents by progress distance
      const rankings = [{ name: 'You', dist: stats.distance }, ...currentList.map((o) => ({ name: o.name, dist: o.progress }))];
      rankings.sort((a, b) => b.dist - a.dist);
      const playerRankIndex = rankings.findIndex((r) => r.name === 'You');
      setPosition(playerRankIndex + 1);

      loopRef.current = requestAnimationFrame(gameLoop);
    };

    loopRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (loopRef.current) cancelAnimationFrame(loopRef.current);
      window.removeEventListener('resize', resize);
    };
  }, [gameState, equippedCar, weatherMode, difficulty]);

  const opponentsRef = useRef<Opponent[]>([]);
  useEffect(() => {
    opponentsRef.current = opponents;
  }, [opponents]);

  // ─── Keyboard Input Triggers ───────────────────────────────────────────────
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (gameState !== 'PLAYING') return;

      const char = e.key;
      const stats = statsRef.current;

      // Handle Backspace to correct typing errors in buffer
      if (char === 'Backspace') {
        e.preventDefault();
        setTypedBuffer(typedBuffer.slice(0, -1));
        return;
      }

      // Ignore all system/modifier keys (Shift, Control, Alt, CapsLock, Arrows, etc.)
      if (char.length !== 1) return;

      stats.totalKeystrokes += 1;

      // Handle Space to fire active Nitro boost
      if (char === ' ' && stats.nitro >= 99 && !stats.nitroActive) {
        triggerBoostSound();
        stats.nitroActive = true;
        stats.nitroTimer = 5.0;
        stats.nitro = 0;
        setNitroCharge(0);
        e.preventDefault();
        return;
      }

      const nextCharExpected = targetWord[typedBuffer.length];
      if (char === nextCharExpected) {
        const updated = typedBuffer + char;
        setTypedBuffer(updated);
        stats.correctKeystrokes += 1;
        stats.wpm += 4.5;
        stats.combo += 1;
        setCombo(stats.combo);
        triggerLaserSound();

        // Complete active target word
        if (updated === targetWord) {
          stats.wordsCompleted += 1;
          stats.score += targetWord.length * 15;
          setScore(stats.score);
          setTypedBuffer('');
          setTargetWord(WORD_POOL[Math.floor(Math.random() * WORD_POOL.length)]);
        }
      } else {
        // Typos stall speed / reset combo
        stats.combo = 0;
        setCombo(0);
        triggerErrorSound();
        setTypedBuffer('');

        // Apply temporary stall multiplier
        stats.stalled = true;
        stats.stallTimer = 1.0;
      }

      const acc = Math.round((stats.correctKeystrokes / stats.totalKeystrokes) * 100) || 100;
      setAccuracy(acc);
    },
    [gameState, targetWord, typedBuffer]
  );

  const handleRaceFinished = () => {
    if (loopRef.current) cancelAnimationFrame(loopRef.current);
    audio.playVictory();
    setGameState('FINISHED');

    const stats = statsRef.current;
    const finalWpm = Math.round(stats.wordsCompleted * 8.5);
    const coinsEarned = Math.floor(stats.distance / 10) + Math.floor(stats.score / 50);
    const xpEarned = Math.floor(stats.distance / 7.5);

    const newCoins = coins + coinsEarned;
    const newXp = xp + xpEarned;
    saveProfileData(newCoins, newXp);

    if (user) {
      api.saveStats({
        wpm: finalWpm,
        accuracy: accuracy,
        errors: stats.totalKeystrokes - stats.correctKeystrokes,
        mode: 'nova-racer',
        duration: Math.round((Date.now() - stats.startTime) / 1000),
        weakKeys: [],
      }).catch(console.error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 pt-20 pb-10 select-none bg-[#09090B] font-space-grotesk">
      {/* Viewport chassis container */}
      <motion.div
        ref={containerRef}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-4xl rounded-3xl overflow-hidden border-2 border-double border-[rgba(255,255,255,0.08)] bg-[#111113]/90 shadow-[0_0_50px_rgba(124,92,255,0.15)] relative"
      >
        
        {/* SECTION 1: TOP PANEL (Starship Command Nav Header) */}
        <div className="border-b border-[rgba(255,255,255,0.08)] bg-[#111113]/70 backdrop-blur-md px-6 py-4 flex items-center justify-between z-30 relative font-orbitron">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[rgba(124,92,255,0.15)] flex items-center justify-center border border-[rgba(124,92,255,0.25)]">
              <Cpu size={16} className="text-[#7C5CFF]" />
            </div>
            <div>
              <span className="text-[10px] tracking-widest text-[#7C5CFF]/70 uppercase block font-semibold">arcade lobby</span>
              <h2 className="text-sm font-black tracking-widest text-white uppercase">nova racer</h2>
            </div>
          </div>

          {/* Wallets */}
          <div className="flex items-center gap-6 text-[11px] uppercase tracking-wider">
            <div className="flex items-center gap-2">
              <span className="text-white/40 font-bold">credits:</span>
              <span className="font-black text-[#F59E0B]">{coins} Cr</span>
            </div>
            <div className="w-px h-4 bg-white/10" />
            <div className="flex items-center gap-2">
              <span className="text-white/40 font-bold">xp:</span>
              <span className="font-black text-[#7C5CFF]">{xp}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleMuteToggle}
              className="p-2 rounded-lg border border-[rgba(255,255,255,0.08)] text-white/60 hover:text-white hover:bg-white/[0.03] transition-all"
              title="Toggle Audio Synth"
            >
              {soundOn ? <Volume2 size={14} /> : <VolumeX size={14} />}
            </button>
            {gameState !== 'PLAYING' && gameState !== 'COUNTDOWN' && gameState !== 'MATCHMAKING' && (
              <button
                onClick={() => setGameState('MENU')}
                className="px-3 py-1.5 rounded-lg border border-[rgba(255,255,255,0.08)] text-xs text-white/70 hover:text-white hover:bg-white/[0.03] transition-all"
              >
                Hangar Menu
              </button>
            )}
          </div>
        </div>

        {/* SECTION 2: CENTER VIEWPORT (Monitor Viewport) */}
        <div className="relative bg-[#08080A] overflow-hidden">
          
          {/* Scanline overlay sweepers */}
          <div className="absolute inset-0 pointer-events-none scanline opacity-[0.06] z-10" />

          {/* Corner wireframe braces / decorations */}
          <div className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 border-[#7C5CFF]/45 pointer-events-none z-10" />
          <div className="absolute top-4 right-4 w-4 h-4 border-t-2 border-r-2 border-[#7C5CFF]/45 pointer-events-none z-10" />
          <div className="absolute bottom-4 left-4 w-4 h-4 border-b-2 border-l-2 border-[#7C5CFF]/45 pointer-events-none z-10" />
          <div className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2 border-[#7C5CFF]/45 pointer-events-none z-10" />

          {/* ACTIVE PLAYING HUD OVERLAY */}
          {gameState === 'PLAYING' && (
            <div className="absolute inset-0 pointer-events-none p-5 flex flex-col justify-between font-orbitron text-xs text-[#A1A1AA] z-20">
              
              {/* TOP HUD METERS (WPM, Acc, Position, Progress, Score, Distance, Nitro) */}
              <div className="flex justify-between items-start w-full">
                {/* WPM & Acc Panels */}
                <div className="flex flex-col gap-1 bg-[#111113]/85 backdrop-blur-md px-3 py-2 rounded-xl border border-[rgba(255,255,255,0.08)] min-w-[100px] shadow-[inset_0_0_12px_rgba(124,92,255,0.1)]">
                  <div className="flex justify-between items-baseline gap-2">
                    <span className="text-[9px] uppercase text-[#A1A1AA]/60">wpm</span>
                    <span className="text-base font-black text-[#7C5CFF]">{wpm}</span>
                  </div>
                  <div className="flex justify-between items-baseline gap-2 mt-0.5">
                    <span className="text-[9px] uppercase text-[#A1A1AA]/60">acc</span>
                    <span className="text-[13px] font-bold text-[#22C55E]">{accuracy}%</span>
                  </div>
                </div>

                {/* Live Track progress indicator bar */}
                <div className="flex flex-col items-center bg-[#111113]/85 backdrop-blur-md px-4 py-2 rounded-xl border border-[rgba(255,255,255,0.08)] text-center min-w-[160px] shadow-[inset_0_0_12px_rgba(124,92,255,0.1)]">
                  <span className="text-[8px] uppercase tracking-widest text-[#F59E0B]">Race Position: #{position}/8</span>
                  <div className="w-full h-1.5 bg-white/10 rounded-full mt-1.5 overflow-hidden">
                    <div className="h-full bg-[#F59E0B]" style={{ width: `${Math.min(100, (distance / 1000) * 100)}%` }} />
                  </div>
                </div>

                {/* Score & Distance Panel */}
                <div className="flex flex-col gap-1 bg-[#111113]/85 backdrop-blur-md px-3 py-2 rounded-xl border border-[rgba(255,255,255,0.08)] min-w-[100px] text-right shadow-[inset_0_0_12px_rgba(124,92,255,0.1)]">
                  <div className="flex justify-between items-baseline gap-2">
                    <span className="text-[9px] uppercase text-[#A1A1AA]/60">score</span>
                    <span className="text-base font-black text-white">{score}</span>
                  </div>
                  <div className="flex justify-between items-baseline gap-2 mt-0.5">
                    <span className="text-[9px] uppercase text-[#A1A1AA]/60">dist</span>
                    <span className="text-[13px] font-bold text-[#F59E0B]">{distance}m</span>
                  </div>
                </div>
              </div>

              {/* BOTTOM HUD ROW: NITRO METER */}
              <div className="flex justify-end w-full">
                <div className="flex flex-col gap-1 bg-[#111113]/85 backdrop-blur-md p-3 rounded-xl border border-[rgba(255,255,255,0.08)] min-w-[150px] shadow-[inset_0_0_12px_rgba(124,92,255,0.1)]">
                  <div className="flex justify-between text-[9px] uppercase">
                    <span className="text-white/60">Nitro core</span>
                    <span className={`font-bold ${nitroCharge >= 99 ? 'text-[#3B82F6] animate-pulse' : 'text-[#A1A1AA]/60'}`}>
                      {nitroCharge >= 99 ? 'PRESS SPACE' : `${nitroCharge}%`}
                    </span>
                  </div>
                  <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-[#3B82F6] transition-all" style={{ width: `${nitroCharge}%` }} />
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* State 1: Game Menu */}
          {gameState === 'MENU' && (
            <div className="p-10 flex flex-col md:flex-row gap-8 items-center justify-between min-h-[400px] relative z-20 font-space-grotesk">
              <div className="max-w-md">
                <span className="px-3.5 py-1 rounded-full text-[10px] font-bold tracking-widest bg-[rgba(124,92,255,0.12)] text-[#7C5CFF] border border-[#7C5CFF]/20 uppercase font-orbitron">
                  GRAND PRIX INITIATED
                </span>
                <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white mt-4 uppercase font-orbitron">
                  Nova Racer
                </h1>
                <p className="text-xs text-[#A1A1AA] leading-relaxed mt-4">
                  Ignite the engine and race sports cars against simulated drivers on high-velocity highways. Boost acceleration with consecutive correct typing.
                </p>

                <div className="flex gap-3 mt-8 font-orbitron">
                  <button
                    onClick={startMatchmaking}
                    className="flex items-center justify-center gap-2 py-3 px-6 rounded-xl text-xs font-black bg-[#7C5CFF] text-white hover:bg-[#8B6FFF] transition-all shadow-[0_0_20px_rgba(124,92,255,0.25)]"
                  >
                    <Compass size={14} />
                    FIND RIVAL MATCH
                  </button>
                </div>
              </div>

              {/* Customizer Hangar selection panels */}
              <div className="w-full max-w-xs p-5 rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[#111113]/85 backdrop-blur-md flex flex-col gap-2 font-orbitron">
                <button
                  onClick={() => setGameState('CUSTOMIZATION')}
                  className="w-full flex items-center justify-between p-3 rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#09090B]/60 hover:bg-[#7C5CFF]/10 hover:border-[#7C5CFF]/30 transition-all text-left"
                >
                  <div className="flex items-center gap-3">
                    <ShoppingBag size={15} className="text-[#7C5CFF]" />
                    <div>
                      <p className="font-bold text-xs">GARAGE BAY</p>
                      <p className="text-[9px] text-[#A1A1AA]">Rims, body paint & wings</p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => setGameState('SETTINGS')}
                  className="w-full flex items-center justify-between p-3 rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#09090B]/60 hover:bg-[#7C5CFF]/10 hover:border-[#7C5CFF]/30 transition-all text-left"
                >
                  <div className="flex items-center gap-3">
                    <SettingsIcon size={15} className="text-[#A1A1AA]" />
                    <div>
                      <p className="font-bold text-xs">SETTINGS</p>
                      <p className="text-[9px] text-[#A1A1AA]">Weather presets & audio synth</p>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* State 2: Customization Garage */}
          {gameState === 'CUSTOMIZATION' && (
            <div className="p-8 min-h-[400px] relative z-20 font-orbitron">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-base font-black tracking-wider uppercase text-white">Garage workshop</h3>
                <button
                  onClick={() => setGameState('MENU')}
                  className="px-3.5 py-1.5 rounded-lg border border-[rgba(255,255,255,0.08)] text-xs text-[#A1A1AA] hover:text-white hover:bg-white/[0.03] transition-all"
                >
                  Save & Back
                </button>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                {/* Paint picker */}
                <div>
                  <h4 className="text-[9px] font-black uppercase tracking-widest text-[#7C5CFF] mb-3">Car paint</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { name: 'Nebula Purple', hex: '#7C5CFF' },
                      { name: 'Cobalt Blue', hex: '#3B82F6' },
                      { name: 'Crimson Red', hex: '#EF4444' },
                      { name: 'Aurora Green', hex: '#10B981' },
                    ].map((color) => (
                      <button
                        key={color.hex}
                        onClick={() => saveProfileData(coins, xp, { ...equippedCar, paint: color.hex })}
                        className="p-3 rounded-xl border text-center text-[10px] font-bold uppercase transition-all"
                        style={{
                          background: equippedCar.paint === color.hex ? 'rgba(124, 92, 255, 0.15)' : 'rgba(17, 17, 19, 0.7)',
                          borderColor: equippedCar.paint === color.hex ? '#7C5CFF' : 'rgba(255, 255, 255, 0.06)',
                        }}
                      >
                        <div className="w-5 h-5 rounded-full mx-auto mb-1.5" style={{ background: color.hex }} />
                        {color.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Spoilers */}
                <div>
                  <h4 className="text-[9px] font-black uppercase tracking-widest text-[#7C5CFF] mb-3">Spoiler Wing</h4>
                  <div className="space-y-1.5">
                    {[
                      { name: 'Stock (Clean)', id: 'none' },
                      { name: 'Aero Racing Wing', id: 'aero' },
                    ].map((sp) => (
                      <button
                        key={sp.id}
                        onClick={() => saveProfileData(coins, xp, { ...equippedCar, spoiler: sp.id })}
                        className="w-full p-3.5 rounded-xl border text-left text-[11px] font-bold uppercase transition-all flex items-center justify-between"
                        style={{
                          background: equippedCar.spoiler === sp.id ? 'rgba(124, 92, 255, 0.15)' : 'rgba(17, 17, 19, 0.7)',
                          borderColor: equippedCar.spoiler === sp.id ? '#7C5CFF' : 'rgba(255, 255, 255, 0.06)',
                        }}
                      >
                        {sp.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* License plate */}
                <div>
                  <h4 className="text-[9px] font-black uppercase tracking-widest text-[#7C5CFF] mb-3">Custom Plate</h4>
                  <input
                    type="text"
                    value={equippedCar.licensePlate}
                    onChange={(e) => saveProfileData(coins, xp, { ...equippedCar, licensePlate: e.target.value.substring(0, 8).toUpperCase() })}
                    className="w-full p-3.5 bg-[#09090B] border border-[rgba(255,255,255,0.08)] rounded-xl text-center text-sm font-bold tracking-wider text-white"
                  />
                  <p className="text-[9px] text-[#A1A1AA] mt-2 text-center">Max 8 characters</p>
                </div>
              </div>
            </div>
          )}

          {/* Settings config */}
          {gameState === 'SETTINGS' && (
            <div className="p-8 min-h-[400px] relative z-20 font-orbitron">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-base font-black tracking-wider uppercase text-white">System Config</h3>
                <button
                  onClick={() => setGameState('MENU')}
                  className="px-3.5 py-1.5 rounded-lg border border-[rgba(255,255,255,0.08)] text-xs text-[#A1A1AA] hover:text-white hover:bg-white/[0.03] transition-all"
                >
                  Return to Control
                </button>
              </div>

              <div className="max-w-md mx-auto space-y-4">
                <div className="flex items-center justify-between p-4 rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#111113]/85">
                  <div>
                    <p className="font-bold text-xs text-white">Audio Synth Module</p>
                    <p className="text-[9px] text-[#A1A1AA] mt-0.5">Programmatically generate engine hums & alarm buzzes</p>
                  </div>
                  <button
                    onClick={handleMuteToggle}
                    className="p-2 rounded-lg border border-[rgba(255,255,255,0.08)] hover:bg-white/[0.03]"
                  >
                    {soundOn ? <Volume2 size={15} /> : <VolumeX size={15} />}
                  </button>
                </div>

                <div className="p-4 rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#111113]/85 space-y-3">
                  <p className="font-bold text-xs text-white">Track Environment Condition</p>
                  <div className="grid grid-cols-2 gap-2">
                    {['sunny', 'night', 'sunset', 'rain'].map((cond) => (
                      <button
                        key={cond}
                        onClick={() => setWeatherMode(cond as any)}
                        className="py-2.5 rounded-lg text-[10px] font-black border transition-all uppercase"
                        style={{
                          background: weatherMode === cond ? 'rgba(124, 92, 255, 0.15)' : 'rgba(17, 17, 19, 0.7)',
                          borderColor: weatherMode === cond ? '#7C5CFF' : 'rgba(255, 255, 255, 0.06)',
                        }}
                      >
                        {cond}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Matchmaking Lobby state */}
          {gameState === 'MATCHMAKING' && (
            <div className="p-8 min-h-[400px] flex flex-col justify-between relative z-20 font-orbitron">
              <div>
                <h3 className="text-base font-black tracking-wider uppercase text-white mb-2 flex items-center gap-2">
                  <Globe size={16} className="text-[#7C5CFF] animate-spin" />
                  Connecting racers
                </h3>
                <p className="text-[10px] tracking-widest text-[#A1A1AA] uppercase">securing websocket server link...</p>
              </div>

              {/* Racers Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 my-6">
                <div className="p-3.5 rounded-xl border border-[#7C5CFF] bg-[#7C5CFF]/10 text-center relative overflow-hidden">
                  <div className="w-10 h-10 rounded-full bg-white/5 mx-auto mb-2 flex items-center justify-center border border-white/10">
                    <User size={18} className="text-white" />
                  </div>
                  <p className="font-black text-xs text-white">You</p>
                  <p className="text-[9px] text-[#A1A1AA] mt-0.5">READY</p>
                </div>

                {opponents.map((op) => (
                  <motion.div
                    key={op.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-3.5 rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#111113]/70 text-center"
                  >
                    <img src={op.avatar} alt="Opponent Avatar" className="w-10 h-10 rounded-full mx-auto mb-2 bg-white/5 p-1 border border-white/10" />
                    <p className="font-bold text-xs text-white truncate">{op.name}</p>
                    <p className="text-[8px] text-[#22C55E] mt-0.5 font-bold uppercase tracking-wider flex items-center justify-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] inline-block" />
                      CONNECTED
                    </p>
                  </motion.div>
                ))}
              </div>

              <div className="text-center text-[9px] text-[#A1A1AA] tracking-widest uppercase">
                session status: synchronizing lane indices...
              </div>
            </div>
          )}

          {/* Match Countdown */}
          {gameState === 'COUNTDOWN' && (
            <div className="flex flex-col items-center justify-center min-h-[400px] bg-black/80 relative z-20 font-orbitron">
              <motion.span
                key={countdownVal}
                initial={{ scale: 0.1, opacity: 0 }}
                animate={{ scale: 1.5, opacity: 1 }}
                exit={{ scale: 2.2, opacity: 0 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="text-6xl md:text-8xl font-black tracking-widest text-[#7C5CFF] drop-shadow-[0_0_20px_rgba(124,92,255,0.35)]"
              >
                {countdownVal}
              </motion.span>
            </div>
          )}

          {/* Highway Screen */}
          <canvas ref={canvasRef} className="block w-full h-[400px]" />

        </div>

        {/* SECTION 3: BOTTOM PANEL (Pilot Transmission Terminal) */}
        <div className="border-t border-[rgba(255,255,255,0.08)] bg-[#0B0B0D] p-6 relative font-space-grotesk z-30 flex flex-col md:flex-row items-center justify-between gap-6">
          
          <div className="flex-1 w-full">
            <div className="flex items-center gap-2 mb-2">
              <Radio size={14} className="text-[#22C55E] animate-pulse" />
              <span className="text-[10px] tracking-widest uppercase font-bold text-white/50 font-orbitron">
                [raceway uplink status] // active keystroke monitor
              </span>
            </div>

            {/* Keyboard Terminal Buffer */}
            <div className="min-h-[50px] flex items-center bg-[#111113]/55 border border-[rgba(255,255,255,0.06)] rounded-xl px-5 py-3 relative">
              <input
                ref={inputRef}
                type="text"
                onKeyDown={handleKeyDown}
                readOnly
                className="absolute inset-0 opacity-0 w-full h-full cursor-default z-10"
                aria-label="Cruiser typing buffer capture"
              />

              {targetWord ? (
                <div className="flex items-center flex-wrap gap-x-[2px] font-mono text-xl tracking-wide font-black">
                  {targetWord.split('').map((char, charIdx) => {
                    const isTyped = charIdx < typedBuffer.length;
                    const isActive = charIdx === typedBuffer.length;

                    return (
                      <span
                        key={charIdx}
                        className={`relative ${
                          isTyped ? 'text-white drop-shadow-[0_0_6px_rgba(255,255,255,0.8)]' : 'text-white/20'
                        }`}
                      >
                        {char}
                        {isActive && (
                          <motion.span
                            animate={{ opacity: [1, 0, 1] }}
                            transition={{ duration: 0.8, repeat: Infinity }}
                            className="absolute -right-[4px] top-0 w-[3px] h-[22px] bg-[#22C55E]"
                          />
                        )}
                      </span>
                    );
                  })}
                </div>
              ) : (
                <span className="text-white/20 text-sm italic font-mono uppercase tracking-widest">
                  Warp ignition off. Press Launch.
                </span>
              )}
            </div>
          </div>

          {/* Telemetry panel */}
          <div className="w-full md:w-auto flex flex-row md:flex-col gap-3 min-w-[170px] text-[10px] uppercase font-orbitron text-white/40">
            <div className="flex justify-between border-b border-white/5 pb-1">
              <span>Telemetry:</span>
              <span className="text-[#22C55E] font-bold">synchronized</span>
            </div>
            <div className="flex justify-between border-b border-white/5 pb-1">
              <span>Hyper Speed:</span>
              <span className="text-white font-bold">{(statsRef.current.speed * 18).toFixed(0)} km/h</span>
            </div>
            <div className="flex justify-between">
              <span>Track Condition:</span>
              <span className="text-[#F59E0B] font-bold">{weatherMode}</span>
            </div>
          </div>

        </div>

        {/* State 4: Race Finished results summary */}
        <AnimatePresence>
          {gameState === 'FINISHED' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/90 backdrop-blur-md flex flex-col justify-center items-center p-8 z-40 font-orbitron text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-[#7C5CFF]/15 flex items-center justify-center mb-6 border border-[#7C5CFF]/20 animate-bounce">
                <Trophy size={30} className="text-[#7C5CFF]" />
              </div>

              <h2 className="text-3xl font-black tracking-widest uppercase text-white">RACE COMPLETED</h2>
              <p className="text-[10px] tracking-widest text-[#22C55E] uppercase mt-2">Finish position: #{position} / 8 players</p>

              {/* Stats metric board */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 my-8 w-full max-w-2xl text-left">
                {[
                  { label: 'Avg Speed WPM', value: `${Math.round(statsRef.current.wordsCompleted * 8.5)} WPM`, color: '#7C5CFF' },
                  { label: 'Accuracy', value: `${accuracy}%`, color: accuracy >= 90 ? '#22C55E' : '#F59E0B' },
                  { label: 'Final Score', value: score, color: '#FAFAFA' },
                  { label: 'Credits Earned', value: `+${Math.floor(distance / 10) + Math.floor(score / 50)} Cr`, color: '#F59E0B' },
                ].map((c) => (
                  <div key={c.label} className="p-4 rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#111113]/70">
                    <p className="text-[8px] uppercase tracking-widest text-white/40 font-bold mb-1">{c.label}</p>
                    <p className="text-xl font-black" style={{ color: c.color }}>{c.value}</p>
                  </div>
                ))}
              </div>

              {/* Action buttons */}
              <div className="flex gap-3">
                <button
                  onClick={startMatchmaking}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl font-black text-xs uppercase bg-[#7C5CFF] text-white hover:bg-[#8B6FFF] transition-all shadow-[0_0_15px_rgba(124,92,255,0.2)]"
                >
                  <RotateCcw size={13} />
                  Match Again
                </button>
                <button
                  onClick={() => setGameState('MENU')}
                  className="px-6 py-3 rounded-xl font-black text-xs uppercase border border-[rgba(255,255,255,0.08)] text-white/70 hover:text-white hover:bg-white/[0.03] transition-all"
                >
                  Hangar Menu
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </motion.div>
    </div>
  );
}
