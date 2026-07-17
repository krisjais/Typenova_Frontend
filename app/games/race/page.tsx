'use client';
import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { io, Socket } from 'socket.io-client';
import {
  Trophy,
  Users,
  Car,
  Play,
  X,
  Gauge,
  Target,
  ArrowRight,
  Flame,
  Award,
  Gamepad2,
  Timer,
  ChevronLeft,
  Volume2,
  VolumeX,
  Zap,
  Sparkles,
  Shield,
  Snowflake,
  Compass,
  Loader
} from 'lucide-react';
import Link from 'next/link';
import { api } from '@/lib/api';

// Curated passages for AI matches
const PRACTICE_PASSAGES = [
  'Successful typing requires both accuracy and speed. Practice builds natural pathways that allow your fingers to glide across keys.',
  'Quantum computing utilizes superposition and entanglement to solve computational problems at speeds exceeding traditional processors.',
  'The only way of discovering the limits of the possible is to venture a little way past them into the impossible.',
  'RESTful APIs use HTTP methods like GET, POST, PUT, and DELETE to manage resources. Client-side apps communicate via JSON payloads.',
  'Two roads diverged in a yellow wood, and sorry I could not travel both and be one traveler, long I stood and looked down one as far as I could.'
];

// ─── Sound Synth for Racer ──────────────────────────────────────────────────
class CarAudioSynth {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;

  private init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
  }

  public playEngine(pitch: number) {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(70 + pitch * 1.5, now);
    osc.frequency.linearRampToValueAtTime(120 + pitch * 2, now + 0.12);

    gain.gain.setValueAtTime(0.06, now);
    gain.gain.linearRampToValueAtTime(0.001, now + 0.12);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.12);
  }

  public playNitro() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(300, now);
    osc.frequency.exponentialRampToValueAtTime(800, now + 0.3);

    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.3);
  }

  public playScreech() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.linearRampToValueAtTime(650, now + 0.15);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.linearRampToValueAtTime(0.001, now + 0.15);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.15);
  }
}

interface Player {
  userId: string;
  username: string;
  progress: number;
  wpm: number;
  accuracy: number;
  finished: boolean;
  rank?: number | null;
  color?: string;
  isAI?: boolean;
  aiWpmGoal?: number;
  aiSlowdown?: number; // active freeze time
}

interface SparkParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  life: number;
}

export default function TypeRacerPage() {
  const { user, loading } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);

  // Setup Ref Synthesizer
  const synthRef = useRef<CarAudioSynth | null>(null);
  const [audioEnabled, setAudioEnabled] = useState(true);

  // Customization States
  const [lobbyMode, setLobbyMode] = useState<'idle' | 'customization' | 'queue' | 'countdown' | 'racing' | 'finished'>('idle');
  const [selectedTrack, setSelectedTrack] = useState<'city' | 'highway' | 'desert' | 'space'>('highway');
  const [selectedSkin, setSelectedSkin] = useState<'red' | 'cyber' | 'gold' | 'emerald'>('cyber');
  const [gameMode, setGameMode] = useState<'single' | 'multi' | 'practice'>('single');
  const [aiLevel, setAiLevel] = useState<'novice' | 'intermediate' | 'advanced' | 'expert' | 'master'>('intermediate');

  // Unified States
  const [players, setPlayers] = useState<Player[]>([]);
  const [text, setText] = useState('');
  const [roomId, setRoomId] = useState('');
  const [countdown, setCountdown] = useState(5);
  const [standings, setStandings] = useState<any[]>([]);

  // Typing Engine States
  const [inputIndex, setInputIndex] = useState(0);
  const [errors, setErrors] = useState(0);
  const [totalKeystrokes, setTotalKeystrokes] = useState(0);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const startTimeRef = useRef<number | null>(null);
  const [typo, setTypo] = useState(false);
  const [comboStreak, setComboStreak] = useState(0);

  // Powerups State
  const [autoCorrects, setAutoCorrects] = useState(0);
  const [nitros, setNitros] = useState(0);
  const [freezes, setFreezes] = useState(0);
  const sessionIdRef = useRef<string | null>(null);

  const initializeSession = async (textToType: string) => {
    if (!user) return;
    try {
      const res: any = await api.startStatsSession({
        subtype: 'type-racer',
        text: textToType
      });
      sessionIdRef.current = res.sessionId;
    } catch (err) {
      console.error('Failed to initialize type racer session:', err);
    }
  };

  // Canvas loop state
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameId = useRef<number | null>(null);
  const particlesRef = useRef<SparkParticle[]>([]);
  const screenShake = useRef(0);
  const scrollOffset = useRef(0);

  useEffect(() => {
    synthRef.current = new CarAudioSynth();
  }, []);

  useEffect(() => {
    if (synthRef.current) synthRef.current.enabled = audioEnabled;
  }, [audioEnabled]);

  // Connect WebSockets when client starts multiplayer
  const connectSocket = () => {
    if (!user || socket) return;

    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';
    const s = io(socketUrl, {
      withCredentials: true,
      transports: ['websocket', 'polling']
    });

    s.on('connect', () => {
      s.emit('register_user', { userId: user.id, username: user.username });
    });

    s.on('queue_joined', () => {
      setLobbyMode('queue');
    });

    s.on('queue_left', () => {
      setLobbyMode('customization');
      resetRaceState();
    });

    s.on('match_found', (data: { roomId: string; text: string; players: { userId: string; username: string }[] }) => {
      setRoomId(data.roomId);
      setText(data.text);
      setPlayers(
        data.players.map((p, idx) => ({
          userId: p.userId,
          username: p.username,
          progress: 0,
          wpm: 0,
          accuracy: 100,
          finished: false,
          rank: null,
          color: idx === 0 ? '#ef4444' : idx === 1 ? '#06b6d4' : idx === 2 ? '#eab308' : '#10b981'
        }))
      );
      setLobbyMode('countdown');
    });

    s.on('race_countdown', (count: number) => {
      setCountdown(count);
    });

    s.on('race_start', () => {
      setLobbyMode('racing');
      startTimeRef.current = Date.now();
    });

    s.on('opponent_progress', (data: { userId: string; progress: number; wpm: number; accuracy: number }) => {
      setPlayers(prev =>
        prev.map(p => (p.userId === data.userId ? { ...p, progress: data.progress, wpm: data.wpm, accuracy: data.accuracy } : p))
      );
    });

    s.on('player_finished', (data: { userId: string; username: string; wpm: number; accuracy: number; rank: number }) => {
      setPlayers(prev =>
        prev.map(p => (p.userId === data.userId ? { ...p, finished: true, wpm: data.wpm, accuracy: data.accuracy, rank: data.rank } : p))
      );
    });

    s.on('race_over', (data: { standings: any[] }) => {
      setStandings(data.standings);
      setLobbyMode('finished');
    });

    s.on('opponent_disconnected', (data: { userId: string }) => {
      setPlayers(prev => prev.filter(p => p.userId !== data.userId));
    });

    setSocket(s);
  };

  const joinQueue = () => {
    if (socket) {
      socket.emit('join_queue');
    }
  };

  const leaveQueue = () => {
    if (socket) {
      socket.emit('leave_queue');
    }
  };

  const startSinglePlayer = () => {
    resetRaceState();
    setRoomId('local_race');
    const randomText = PRACTICE_PASSAGES[Math.floor(Math.random() * PRACTICE_PASSAGES.length)];
    setText(randomText);
    initializeSession(randomText);

    // AI speed profile
    const aiSpeedMap = {
      novice: 32,
      intermediate: 52,
      advanced: 74,
      expert: 96,
      master: 118
    };
    const aiWpm = aiSpeedMap[aiLevel];

    setPlayers([
      {
        userId: user?.id || 'local_user',
        username: user?.username || 'You',
        progress: 0,
        wpm: 0,
        accuracy: 100,
        finished: false,
        rank: null,
        color: selectedSkin === 'red' ? '#ef4444' : selectedSkin === 'cyber' ? '#06b6d4' : selectedSkin === 'gold' ? '#eab308' : '#10b981'
      },
      {
        userId: 'ai_competitor',
        username: `${aiLevel.toUpperCase()} Bot`,
        progress: 0,
        wpm: 0,
        accuracy: 96,
        finished: false,
        rank: null,
        color: '#a855f7',
        isAI: true,
        aiWpmGoal: aiWpm,
        aiSlowdown: 0
      }
    ]);

    setLobbyMode('countdown');
    let count = 3;
    setCountdown(count);
    const interval = setInterval(() => {
      count--;
      setCountdown(count);
      if (count <= 0) {
        clearInterval(interval);
        setLobbyMode('racing');
        startTimeRef.current = Date.now();
      }
    }, 1000);
  };

  const resetRaceState = () => {
    setInputIndex(0);
    setErrors(0);
    setTotalKeystrokes(0);
    setWpm(0);
    setAccuracy(100);
    setTypo(false);
    setComboStreak(0);
    setAutoCorrects(0);
    setNitros(0);
    setFreezes(0);
    startTimeRef.current = null;
  };

  // Keyboard engine listener
  useEffect(() => {
    if (lobbyMode !== 'racing') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Direct use of Powerups
      if (e.key === '1' && autoCorrects > 0) {
        useAutoCorrect();
        return;
      }
      if (e.key === '2' && nitros > 0) {
        useNitro();
        return;
      }
      if (e.key === '3' && freezes > 0) {
        useFreeze();
        return;
      }

      if (e.key.length !== 1) return;
      e.preventDefault();

      setTotalKeystrokes(prev => prev + 1);
      const expected = text[inputIndex];

      if (e.key === expected) {
        setTypo(false);
        const nextIdx = inputIndex + 1;
        setInputIndex(nextIdx);

        // Sound rev feedback
        synthRef.current?.playEngine(wpm);

        // Combo streak checks
        setComboStreak(prev => {
          const next = prev + 1;
          if (next === 15) {
            // Reward random powerup
            const pIndex = Math.floor(Math.random() * 3);
            if (pIndex === 0) setAutoCorrects(c => c + 1);
            else if (pIndex === 1) setNitros(n => n + 1);
            else setFreezes(f => f + 1);
            return 0; // reset streak
          }
          return next;
        });

        // WPM & Acc
        const timeMin = startTimeRef.current ? (Date.now() - startTimeRef.current) / 60000 : 0.01;
        const currentWpm = Math.round((nextIdx / 5) / Math.max(0.01, timeMin));
        const currentAcc = Math.round((nextIdx / (nextIdx + errors)) * 100);
        setWpm(currentWpm);
        setAccuracy(currentAcc);

        // Calculate progress %
        const progressPercent = Math.round((nextIdx / text.length) * 100);

        // Broadcast progress if multi
        if (gameMode === 'multi' && socket) {
          socket.emit('race_progress_update', { roomId, progress: progressPercent, wpm: currentWpm, accuracy: currentAcc });
        }

        // Final check
        if (nextIdx === text.length) {
          handleLocalFinish(currentWpm, currentAcc);
        }
      } else {
        setTypo(true);
        setComboStreak(0);
        setErrors(prev => prev + 1);
        screenShake.current = 4;
        synthRef.current?.playScreech();

        const currentAcc = Math.round((inputIndex / (inputIndex + errors + 1)) * 100);
        setAccuracy(currentAcc);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [lobbyMode, inputIndex, text, errors, wpm, autoCorrects, nitros, freezes]);

  // Powerup executables
  const useAutoCorrect = () => {
    setAutoCorrects(c => c - 1);
    const charsToCorrect = Math.min(5, text.length - inputIndex);
    const nextIdx = inputIndex + charsToCorrect;
    setInputIndex(nextIdx);
    
    // Play nitro sound
    synthRef.current?.playNitro();
    
    // Update stats
    const timeMin = startTimeRef.current ? (Date.now() - startTimeRef.current) / 60000 : 0.01;
    const currentWpm = Math.round((nextIdx / 5) / Math.max(0.01, timeMin));
    setWpm(currentWpm);

    const progressPercent = Math.round((nextIdx / text.length) * 100);
    if (gameMode === 'multi' && socket) {
      socket.emit('race_progress_update', { roomId, progress: progressPercent, wpm: currentWpm, accuracy });
    }

    if (nextIdx === text.length) {
      handleLocalFinish(currentWpm, accuracy);
    }
  };

  const useNitro = () => {
    setNitros(n => n - 1);
    synthRef.current?.playNitro();
    
    // Temporarily trigger nitro particles loop
    for (let i = 0; i < 20; i++) {
      particlesRef.current.push({
        x: 100, // approximate car back
        y: 150,
        vx: -(4 + Math.random() * 5),
        vy: (Math.random() - 0.5) * 3,
        color: '#f97316',
        size: 3 + Math.random() * 3,
        life: 25 + Math.random() * 15
      });
    }

    // Boost WPM stat
    setWpm(prev => prev + 25);
  };

  const useFreeze = () => {
    setFreezes(f => f - 1);
    synthRef.current?.playScreech();

    if (gameMode === 'single') {
      setPlayers(prev => prev.map(p => p.isAI ? { ...p, aiSlowdown: 180 } : p)); // slowdown AI for 3 seconds (180 frames)
    }
  };

  const handleLocalFinish = async (finalWpm: number, finalAcc: number) => {
    if (gameMode === 'multi') {
      if (socket) {
        socket.emit('race_complete', { roomId, wpm: finalWpm, accuracy: finalAcc });
      }
    } else {
      // Local single player victory check
      setPlayers(prev => prev.map(p => p.userId === user?.id || p.userId === 'local_user' ? { ...p, finished: true, wpm: finalWpm, accuracy: finalAcc } : p));
      
      // Wait for AI to finish or end immediately
      const standingsList = players.map(p => {
        if (p.userId === user?.id || p.userId === 'local_user') {
          return { username: p.username, wpm: finalWpm, accuracy: finalAcc, rank: 1 };
        }
        // AI estimated results
        return { username: p.username, wpm: p.aiWpmGoal || 50, accuracy: 96, rank: 2 };
      });

      setStandings(standingsList);
      setLobbyMode('finished');

      // Save stats locally on DB
      try {
        if (user && sessionIdRef.current) {
          await api.saveStats({
            sessionId: sessionIdRef.current,
            wpm: finalWpm,
            accuracy: finalAcc,
            errors,
            mode: 'practice',
            duration: startTimeRef.current ? Math.round((Date.now() - startTimeRef.current) / 1000) : 60,
            category: 'Type Racer',
            difficulty: aiLevel.toUpperCase(),
            text
          });
        }
      } catch (err) {
        console.error('Failed to save racer stats:', err);
      }
    }
  };

  // AI competitors update ticks
  useEffect(() => {
    if (lobbyMode !== 'racing' || gameMode !== 'single') return;

    const interval = setInterval(() => {
      setPlayers(prev =>
        prev.map(p => {
          if (p.isAI && !p.finished) {
            // Apply freeze slowdown if active
            const speed = p.aiSlowdown && p.aiSlowdown > 0 ? (p.aiWpmGoal || 40) * 0.5 : (p.aiWpmGoal || 40);
            
            // Stagger freeze frame decrement
            const nextSlowdown = p.aiSlowdown && p.aiSlowdown > 0 ? p.aiSlowdown - 10 : 0;

            const increment = (speed / 60) * 0.08; // speed translation
            const nextProgress = Math.min(100, p.progress + increment);

            return {
              ...p,
              progress: nextProgress,
              wpm: Math.round(speed),
              finished: nextProgress >= 100,
              aiSlowdown: nextSlowdown
            };
          }
          return p;
        })
      );
    }, 100);

    return () => clearInterval(interval);
  }, [lobbyMode, gameMode]);

  // Main Canvas render loop (Racetrack & vehicle animations)
  useEffect(() => {
    if (lobbyMode !== 'racing') {
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const renderLoop = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.save();
      // Apply screen shake
      if (screenShake.current > 0) {
        const dx = (Math.random() - 0.5) * screenShake.current;
        const dy = (Math.random() - 0.5) * screenShake.current;
        ctx.translate(dx, dy);
        screenShake.current *= 0.85;
      }

      // ─── Render Track Themes ───
      if (selectedTrack === 'highway') {
        // Highway theme: Green hills and grass
        ctx.fillStyle = '#065f46'; // Dark green
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Parallax hills background
        ctx.fillStyle = '#047857';
        ctx.beginPath();
        ctx.arc(200, 140, 250, Math.PI, 0);
        ctx.arc(650, 160, 200, Math.PI, 0);
        ctx.fill();

        // Asphalt Road lanes
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(0, 100, canvas.width, 200);
      } else if (selectedTrack === 'desert') {
        // Desert theme: orange sand dunes
        ctx.fillStyle = '#ea580c';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = '#f97316'; // Sand hills
        ctx.beginPath();
        ctx.arc(300, 150, 280, Math.PI, 0);
        ctx.arc(700, 160, 180, Math.PI, 0);
        ctx.fill();

        ctx.fillStyle = '#451a03'; // Brown road
        ctx.fillRect(0, 100, canvas.width, 200);
      } else if (selectedTrack === 'city') {
        // City theme: skyscrapers and neon roads
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Building blocks
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(80, 20, 100, 100);
        ctx.fillRect(240, 10, 120, 110);
        ctx.fillRect(500, 30, 80, 90);
        ctx.fillRect(680, 20, 110, 100);

        ctx.fillStyle = '#020617'; // Dark asphalt
        ctx.fillRect(0, 100, canvas.width, 200);
      } else if (selectedTrack === 'space') {
        // Space theme: starfields
        ctx.fillStyle = '#020205';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Space stars
        ctx.fillStyle = '#ffffff';
        for (let i = 0; i < 30; i++) {
          const sx = (Math.random() * canvas.width + scrollOffset.current) % canvas.width;
          const sy = (i * 12) % canvas.height;
          ctx.fillRect(sx, sy, 1.5, 1.5);
        }

        ctx.fillStyle = '#0f172a'; // Grey space track
        ctx.fillRect(0, 100, canvas.width, 200);
      }

      // ─── Render Road Dashed Lanes (Scrolling) ───
      scrollOffset.current = (scrollOffset.current - (wpm / 15 + 2)) % 80;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3;
      ctx.setLineDash([25, 25]);
      
      // Draw middle lanes
      ctx.beginPath();
      ctx.moveTo(scrollOffset.current, 150);
      ctx.lineTo(canvas.width + 80, 150);
      ctx.moveTo(scrollOffset.current, 200);
      ctx.lineTo(canvas.width + 80, 200);
      ctx.moveTo(scrollOffset.current, 250);
      ctx.lineTo(canvas.width + 80, 250);
      ctx.stroke();
      ctx.setLineDash([]); // clear dash

      // ─── Render Finish Line Banner ───
      ctx.fillStyle = '#ffffff'; // Checkered grid lines
      ctx.fillRect(780, 100, 25, 200);
      ctx.fillStyle = '#000000';
      for (let y = 100; y < 300; y += 20) {
        ctx.fillRect(780, y, 12, 10);
        ctx.fillRect(792, y + 10, 13, 10);
      }

      // ─── Update & Render Particle Exhausts ───
      particlesRef.current.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.life--;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });
      particlesRef.current = particlesRef.current.filter(p => p.life > 0);

      // ─── Render Vehicles / Competitors ───
      const currentProgressUser = Math.round((inputIndex / text.length) * 100);
      players.forEach((p, idx) => {
        const prog = p.userId === user?.id || p.userId === 'local_user' ? currentProgressUser : p.progress;

        const startX = 60 + (prog / 100) * 680;
        const startY = 115 + idx * 45;

        // Render car shadow
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.fillRect(startX - 5, startY + 16, 50, 8);

        // Render car body
        ctx.fillStyle = p.color || '#3b82f6';
        ctx.beginPath();
        ctx.roundRect(startX, startY, 40, 18, 4);
        ctx.fill();

        // Windshield
        ctx.fillStyle = '#e2e8f0';
        ctx.fillRect(startX + 24, startY + 3, 10, 12);

        // Wheels
        ctx.fillStyle = '#09090b';
        ctx.beginPath();
        ctx.arc(startX + 8, startY + 18, 5, 0, Math.PI * 2);
        ctx.arc(startX + 30, startY + 18, 5, 0, Math.PI * 2);
        ctx.fill();

        // Render mini player nametag above car
        ctx.font = 'bold 9px monospace';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.fillText(p.username, startX + 20, startY - 4);

        // Exude tire smoke if current user has typo
        if (typo && (p.userId === user?.id || p.userId === 'local_user') && Math.random() < 0.25) {
          particlesRef.current.push({
            x: startX + 5,
            y: startY + 14,
            vx: -2,
            vy: -1 - Math.random() * 2,
            color: '#71717a',
            size: 3 + Math.random() * 4,
            life: 15 + Math.random() * 10
          });
        }
      });

      ctx.restore();
      animationFrameId.current = requestAnimationFrame(renderLoop);
    };

    animationFrameId.current = requestAnimationFrame(renderLoop);
    return () => {
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
    };
  }, [lobbyMode, players, selectedTrack, selectedSkin, typo, wpm]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center gap-3 text-[var(--color-text-secondary)]">
          <Loader size={18} className="animate-spin text-[var(--color-accent)]" />
          Loading Race Lobby...
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-6 px-4">
        <div className="w-16 h-16 rounded-2xl bg-[var(--color-accent-muted)] flex items-center justify-center">
          <Gamepad2 size={28} className="text-[var(--color-accent)]" />
        </div>
        <div className="text-center">
          <h2 className="text-xl font-semibold text-[var(--color-text)] mb-2">Sign in to race</h2>
          <p className="text-[var(--color-text-secondary)] text-sm">Join the typing speedway against bots and rivals.</p>
        </div>
        <Link
          href="/login"
          className="px-6 py-3 rounded-xl text-[14px] font-semibold bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)] transition-colors"
        >
          Log In
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-8 pt-24 pb-16 min-h-screen flex flex-col justify-center">
      {/* Title Header */}
      <div className="mb-6">
        <Link
          href="/games"
          className="inline-flex items-center gap-1 text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors"
        >
          <ChevronLeft size={14} />
          Back to Games
        </Link>
      </div>

      <AnimatePresence mode="wait">
        {/* IDLE SELECTOR VIEW */}
        {lobbyMode === 'idle' && (
          <motion.div
            key="idle"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="glass-card p-8 text-center flex flex-col items-center max-w-md mx-auto"
          >
            <div className="w-12 h-12 rounded-xl bg-[var(--color-accent-muted)] flex items-center justify-center mb-5 text-[var(--color-accent)]">
              <Gamepad2 size={24} />
            </div>

            <h2 className="text-lg font-black uppercase tracking-wider text-[var(--color-text)] mb-2">Type Racer Lobby</h2>
            <p className="text-xs text-[var(--color-text-secondary)] mb-6">Select a gameplay race type to launch.</p>

            <div className="space-y-2 w-full mb-6">
              <button
                onClick={() => {
                  setGameMode('single');
                  setLobbyMode('customization');
                }}
                className="w-full py-3 rounded-xl border border-[var(--color-border)] text-xs text-[var(--color-text)] font-extrabold hover:bg-white/[0.04] transition-colors cursor-pointer"
              >
                Single Player (vs AI Bots)
              </button>
              <button
                onClick={() => {
                  setGameMode('multi');
                  connectSocket();
                  setLobbyMode('customization');
                }}
                className="w-full py-3 rounded-xl bg-[var(--color-accent)] text-white text-xs font-extrabold hover:bg-[var(--color-accent-hover)] transition-colors cursor-pointer"
              >
                Multiplayer Matchmaking (PvP)
              </button>
            </div>
          </motion.div>
        )}

        {/* CUSTOMIZATION MENU VIEW */}
        {lobbyMode === 'customization' && (
          <motion.div
            key="customization"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="glass-card p-8 max-w-lg mx-auto w-full flex flex-col gap-6"
          >
            <h2 className="text-md font-black uppercase tracking-wider text-[var(--color-text)] border-b border-[var(--color-border)] pb-3">
              Configure Race Parameters
            </h2>

            {/* AI level select if single */}
            {gameMode === 'single' && (
              <div>
                <label className="text-[10px] uppercase font-bold tracking-widest text-[var(--color-text-secondary)] mb-2 block">
                  AI Opponent Skill
                </label>
                <div className="flex gap-1 p-1 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)]">
                  {['novice', 'intermediate', 'advanced', 'expert', 'master'].map(lvl => (
                    <button
                      key={lvl}
                      onClick={() => setAiLevel(lvl as any)}
                      className={`flex-1 py-1.5 rounded-lg text-[9px] uppercase font-bold transition-all cursor-pointer ${
                        aiLevel === lvl
                          ? 'bg-[var(--color-accent-muted)] text-[var(--color-accent)]'
                          : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text)]'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Track Selector */}
            <div>
              <label className="text-[10px] uppercase font-bold tracking-widest text-[var(--color-text-secondary)] mb-2 block">
                Race Speedway Track
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'highway', label: 'Highway' },
                  { id: 'city', label: 'Neon City' },
                  { id: 'desert', label: 'Dunes' },
                  { id: 'space', label: 'Space Star' }
                ].map(t => (
                  <button
                    key={t.id}
                    onClick={() => setSelectedTrack(t.id as any)}
                    className={`py-2 rounded-xl border text-xs font-bold transition-colors cursor-pointer ${
                      selectedTrack === t.id
                        ? 'border-[var(--color-accent)] bg-[var(--color-accent-muted)]/10 text-[var(--color-text)]'
                        : 'border-[var(--color-border)] hover:border-[var(--color-border-hover)] text-[var(--color-text-secondary)]'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Skin Selector */}
            <div>
              <label className="text-[10px] uppercase font-bold tracking-widest text-[var(--color-text-secondary)] mb-2 block">
                Vehicle Skin Color
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { id: 'cyber', label: 'Cyber', color: 'bg-cyan-500' },
                  { id: 'red', label: 'Red Devil', color: 'bg-rose-500' },
                  { id: 'gold', label: 'Gold Bull', color: 'bg-amber-500' },
                  { id: 'emerald', label: 'Emerald', color: 'bg-emerald-500' }
                ].map(s => (
                  <button
                    key={s.id}
                    onClick={() => setSelectedSkin(s.id as any)}
                    className={`py-2 rounded-xl border flex flex-col items-center gap-1.5 transition-colors cursor-pointer ${
                      selectedSkin === s.id
                        ? 'border-[var(--color-accent)] bg-[var(--color-accent-muted)]/10'
                        : 'border-[var(--color-border)] hover:border-[var(--color-border-hover)]'
                    }`}
                  >
                    <span className={`w-3.5 h-3.5 rounded-full ${s.color}`} />
                    <span className="text-[9px] font-bold text-[var(--color-text-secondary)]">{s.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Submit / actions */}
            <div className="flex gap-2 border-t border-[var(--color-border)] pt-4 mt-2">
              <button
                onClick={() => {
                  setLobbyMode('idle');
                  if (socket) {
                    socket.disconnect();
                    setSocket(null);
                  }
                }}
                className="flex-1 py-3 border border-[var(--color-border)] rounded-xl text-xs font-bold text-[var(--color-text)] cursor-pointer"
              >
                Back
              </button>
              <button
                onClick={gameMode === 'single' ? startSinglePlayer : joinQueue}
                className="flex-1 py-3 bg-[var(--color-accent)] text-white text-xs font-bold rounded-xl hover:bg-[var(--color-accent-hover)] cursor-pointer"
              >
                {gameMode === 'single' ? 'Launch Speedway' : 'Find Opponents'}
              </button>
            </div>
          </motion.div>
        )}

        {/* QUEUE MATCHMAKING LOBBY VIEW */}
        {lobbyMode === 'queue' && (
          <motion.div
            key="queue"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass-card p-10 text-center flex flex-col items-center max-w-md mx-auto"
          >
            <div className="relative mb-6">
              <div className="w-12 h-12 rounded-full border-2 border-[var(--color-accent)]/25 flex items-center justify-center">
                <Users size={20} className="text-[var(--color-accent)] animate-pulse" />
              </div>
              <div className="absolute inset-0 rounded-full border-2 border-t-[var(--color-accent)] animate-spin" />
            </div>

            <h2 className="text-lg font-bold text-[var(--color-text)] mb-2">Connecting Speedway...</h2>
            <p className="text-xs text-[var(--color-text-secondary)] mb-8">Waiting for other racers to connect to Socket lobby.</p>

            <button
              onClick={leaveQueue}
              className="px-6 py-2.5 rounded-xl border border-[var(--color-border)] text-xs text-[var(--color-text-secondary)] hover:text-rose-400 hover:border-rose-500/20 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <X size={12} />
              Cancel Search
            </button>
          </motion.div>
        )}

        {/* COUNTDOWN START SCREEN */}
        {lobbyMode === 'countdown' && (
          <motion.div
            key="countdown"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass-card p-10 max-w-lg mx-auto w-full text-center"
          >
            <div className="w-24 h-24 rounded-full bg-white/[0.03] border border-[var(--color-border)] flex items-center justify-center mx-auto mb-8 relative">
              <span className="text-4xl font-extrabold font-orbitron text-[var(--color-accent)]">
                {countdown}
              </span>
              <Timer size={14} className="absolute bottom-2 text-[var(--color-text-secondary)]" />
            </div>

            <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--color-text)] mb-4">
              Lobby Staged! Grid starting shortly...
            </h2>
            
            <div className="space-y-2 max-w-xs mx-auto text-left">
              {players.map((p, i) => (
                <div key={p.userId} className="flex items-center gap-3 p-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]">
                  <span className="w-3.5 h-3.5 rounded-full border border-white/10 shrink-0" style={{ backgroundColor: p.color }} />
                  <span className="text-xs font-semibold text-[var(--color-text)]">{p.username}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* RACING SPEEDWAY VIEW */}
        {lobbyMode === 'racing' && (
          <motion.div
            key="racing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full flex flex-col gap-6"
          >
            {/* HUD Status top bar overlay */}
            <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]">
              <div className="flex items-center gap-4 text-xs font-mono">
                <div>Speed: <strong className="text-[var(--color-accent)]">{wpm} WPM</strong></div>
                <div>Acc: <strong>{accuracy}%</strong></div>
                
                {comboStreak > 0 && (
                  <div className="flex items-center gap-1 text-[var(--color-warning)] font-bold animate-bounce">
                    <Flame size={12} />
                    Streak: {comboStreak}
                  </div>
                )}
              </div>

              {/* Powerups inventory */}
              <div className="flex gap-2.5 items-center">
                <div className="text-[10px] uppercase font-bold text-[var(--color-text-secondary)]">Powerups:</div>
                
                <button
                  disabled={autoCorrects === 0}
                  onClick={useAutoCorrect}
                  className={`px-2.5 py-1.5 rounded-lg border text-[10px] font-bold uppercase flex items-center gap-1 cursor-pointer transition-all ${
                    autoCorrects > 0
                      ? 'border-cyan-500/30 bg-cyan-500/10 text-cyan-400 font-extrabold animate-pulse'
                      : 'border-zinc-800 text-zinc-600 opacity-30 cursor-not-allowed'
                  }`}
                  title="Auto-correct next 5 characters (Key 1)"
                >
                  <Shield size={10} />
                  Auto (1) [{autoCorrects}]
                </button>

                <button
                  disabled={nitros === 0}
                  onClick={useNitro}
                  className={`px-2.5 py-1.5 rounded-lg border text-[10px] font-bold uppercase flex items-center gap-1 cursor-pointer transition-all ${
                    nitros > 0
                      ? 'border-orange-500/30 bg-orange-500/10 text-orange-400 font-extrabold animate-pulse'
                      : 'border-zinc-800 text-zinc-600 opacity-30 cursor-not-allowed'
                  }`}
                  title="Nitro Speed Boost (Key 2)"
                >
                  <Zap size={10} />
                  Nitro (2) [{nitros}]
                </button>

                <button
                  disabled={freezes === 0}
                  onClick={useFreeze}
                  className={`px-2.5 py-1.5 rounded-lg border text-[10px] font-bold uppercase flex items-center gap-1 cursor-pointer transition-all ${
                    freezes > 0
                      ? 'border-indigo-500/30 bg-indigo-500/10 text-indigo-400 font-extrabold animate-pulse'
                      : 'border-zinc-800 text-zinc-600 opacity-30 cursor-not-allowed'
                  }`}
                  title="Slow down opponents (Key 3)"
                >
                  <Snowflake size={10} />
                  Freeze (3) [{freezes}]
                </button>

                {/* Sound control */}
                <button
                  onClick={() => setAudioEnabled(!audioEnabled)}
                  className="p-1.5 rounded-lg border border-[var(--color-border)] hover:bg-white/[0.04] text-[var(--color-text-secondary)] cursor-pointer"
                >
                  {audioEnabled ? <Volume2 size={12} /> : <VolumeX size={12} />}
                </button>
              </div>
            </div>

            {/* Main Race Canvas */}
            <div className="relative border border-[var(--color-border)] rounded-2xl overflow-hidden bg-black">
              <canvas
                ref={canvasRef}
                width={850}
                height={320}
                className="w-full block"
              />
            </div>

            {/* Bottom Typing Passage Card */}
            <div className="glass-card p-6 md:p-8 flex flex-col gap-6">
              <div className="text-lg leading-relaxed font-geist text-[var(--color-text-secondary)] select-none">
                {/* Typed part */}
                <span className="text-[var(--color-text)] font-semibold border-b-2 border-[var(--color-accent)] pb-0.5">
                  {text.slice(0, inputIndex)}
                </span>
                
                {/* Typo indicator */}
                {typo && (
                  <span className="bg-rose-500/20 text-rose-400 font-bold border-b-2 border-rose-500 pb-0.5">
                    {text.slice(inputIndex, inputIndex + 1)}
                  </span>
                )}
                
                {/* Remaining part */}
                <span className={typo ? 'opacity-30' : ''}>
                  {text.slice(typo ? inputIndex + 1 : inputIndex)}
                </span>
              </div>
            </div>
          </motion.div>
        )}

        {/* STANDINGS RESULT SCOREBOARD VIEW */}
        {lobbyMode === 'finished' && (
          <motion.div
            key="finished"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="glass-card p-8 md:p-10 max-w-lg mx-auto w-full"
          >
            <div className="flex items-center justify-center gap-3 border-b border-[var(--color-border)] pb-6 mb-6">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
                <Trophy size={20} />
              </div>
              <div>
                <h1 className="text-lg font-black uppercase tracking-wider text-[var(--color-text)]">
                  Speedway Scoreboard
                </h1>
                <p className="text-xs text-[var(--color-text-secondary)]">Race placement and statistics</p>
              </div>
            </div>

            <div className="space-y-3 mb-8">
              {standings.map((player, index) => {
                const isWinner = index === 0;
                const isCurrent = player.username === user?.username || player.username === 'You';

                return (
                  <div
                    key={player.username}
                    className={`flex items-center justify-between p-4 rounded-xl border ${
                      isCurrent
                        ? 'border-[var(--color-accent)] bg-[var(--color-accent-muted)]/10'
                        : isWinner
                        ? 'border-amber-500/20 bg-amber-500/5'
                        : 'border-[var(--color-border)] bg-[var(--color-surface)]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-lg bg-white/[0.03] border border-[var(--color-border)] flex items-center justify-center font-bold text-xs">
                        {index + 1}
                      </div>
                      <div>
                        <div className="text-xs font-bold flex items-center gap-1.5">
                          {player.username}
                          {isCurrent && (
                            <span className="text-[8px] font-bold uppercase tracking-wider text-[var(--color-accent)] px-1 py-0.5 bg-[var(--color-accent-muted)] rounded border border-[var(--color-accent)]/10">
                              You
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-[var(--color-text-secondary)] mt-0.5">Accuracy: {player.accuracy || 100}%</div>
                      </div>
                    </div>

                    <div className="flex items-baseline gap-0.5">
                      <span className="text-lg font-extrabold text-[var(--color-accent)] font-orbitron">{player.wpm}</span>
                      <span className="text-[9px] text-[var(--color-text-secondary)] font-bold uppercase">wpm</span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={() => {
                  setLobbyMode('idle');
                  resetRaceState();
                  if (socket) {
                    socket.disconnect();
                    setSocket(null);
                  }
                }}
                className="flex-1 py-3 text-xs font-bold rounded-xl bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)] transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow"
              >
                Back to Lobby
                <ArrowRight size={12} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
