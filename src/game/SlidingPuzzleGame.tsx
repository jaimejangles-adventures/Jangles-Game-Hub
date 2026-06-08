import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { burstFinale } from '@/game/confetti';
import { playCorrectExclamation } from '@/game/exclamations';
import { asset } from '@/lib/asset';
import { useScore } from '@/hooks/use-score';
import { useAuth } from '@/lib/auth-context';
import { Leaderboard } from '@/components/leaderboard';

const BOARD_SIZE = 420;

const PAGES = [
  { flag: '🇺🇸', name: 'U.S.A.',         src: asset('/puzzle-pages/page-3.png'),  music: asset('/music/NEW ORLEANS.wav') },
  { flag: '🇲🇽', name: 'Mexico',          src: asset('/puzzle-pages/page-4.png'),  music: asset('/music/MEXICO.wav') },
  { flag: '🇯🇲', name: 'Jamaica',         src: asset('/puzzle-pages/page-5.png'),  music: asset('/music/JAMAICA.wav') },
  { flag: '🇧🇧', name: 'Barbados',        src: asset('/puzzle-pages/page-6.png'),  music: asset('/music/BARBADOS_2.wav') },
  { flag: '🇵🇪', name: 'Peru',            src: asset('/puzzle-pages/page-7.png'),  music: asset('/music/PERU.wav') },
  { flag: '🇦🇷', name: 'Argentina',       src: asset('/puzzle-pages/page-8.png'),  music: asset('/music/ARGENTINA DRUMS AND HORNS_1.2.wav') },
  { flag: '❄️',  name: 'Antarctica',      src: asset('/puzzle-pages/page-9.png'),  music: null },
  { flag: '🇬🇧', name: 'United Kingdom',  src: asset('/puzzle-pages/page-10.png'), music: asset('/music/UK.wav') },
  { flag: '🇪🇸', name: 'Spain',           src: asset('/puzzle-pages/page-11.png'), music: asset('/music/SPAIN1.2.wav') },
  { flag: '🇫🇷', name: 'France',          src: asset('/puzzle-pages/page-12.png'), music: asset('/music/FRANCE.wav') },
  { flag: '🇮🇹', name: 'Italy',           src: asset('/puzzle-pages/page-13.png'), music: asset('/music/ITALY.wav') },
  { flag: '🇱🇰', name: 'Sri Lanka',       src: asset('/puzzle-pages/page-15.png'), music: asset('/music/SRI LANKA_1.1.wav') },
  { flag: '🇯🇵', name: 'Japan',           src: asset('/puzzle-pages/page-16.png'), music: asset('/music/JAPAN.wav') },
  { flag: '🇨🇭', name: 'Switzerland',     src: asset('/puzzle-pages/page-17.png'), music: asset('/music/SWITZERLAND.wav') },
  { flag: '🇰🇪', name: 'Kenya',           src: asset('/puzzle-pages/page-18.png'), music: asset('/music/KENYA.wav') },
  { flag: '🇿🇦', name: 'South Africa',    src: asset('/puzzle-pages/page-19.png'), music: asset('/music/SOUTH AFRICA_1.2.wav') },
  { flag: '🇬🇭', name: 'Ghana',           src: asset('/puzzle-pages/page-20.png'), music: asset('/music/GHANA.wav') },
  { flag: '🇰🇷', name: 'South Korea',     src: asset('/puzzle-pages/page-21.png'), music: asset('/music/SOUTH KOREA.wav') },
  { flag: '🇳🇵', name: 'Nepal',           src: asset('/puzzle-pages/page-22.png'), music: asset('/music/NEPAL.wav') },
  { flag: '🇮🇩', name: 'Indonesia',       src: asset('/puzzle-pages/page-23.png'), music: asset('/music/INDONESIA.wav') },
  { flag: '🇦🇺', name: 'Australia',       src: asset('/puzzle-pages/page-24.png'), music: asset('/music/Jamie Jangles_Daniel_Australia.wav') },
];

type Difficulty = 'rookie' | 'master';

const DIFFICULTY_CONFIG = {
  rookie: { gridSize: 3, timeLimit: 120, label: 'Rookie', emoji: '⭐', color: '#22c55e', desc: '3×3 grid · 2 min' },
  master: { gridSize: 6, timeLimit: 240, label: 'Master', emoji: '🔥', color: '#ef4444', desc: '6×6 grid · 4 min' },
};

function randomPageIdx(current: number): number {
  let next = current;
  while (next === current) next = Math.floor(Math.random() * PAGES.length);
  return next;
}

function buildShuffled(size: number): number[] {
  const tiles = Array.from({ length: size * size }, (_, i) => i);
  for (let i = tiles.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [tiles[i], tiles[j]] = [tiles[j], tiles[i]];
  }
  if (tiles.every((v, i) => v === i)) return buildShuffled(size);
  return tiles;
}

function formatTime(s: number) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

export function SlidingPuzzleGame({ onComplete }: { onComplete?: () => void } = {}) {
  const { user, openAuthModal } = useAuth();
  const { saveScore, saving, saved, reset: resetScore } = useScore('sliding-puzzle');

  const [phase, setPhase] = useState<'select' | 'playing' | 'win' | 'timeout'>('select');
  const [difficulty, setDifficulty] = useState<Difficulty>('rookie');
  const [pageIdx, setPageIdx] = useState(() => Math.floor(Math.random() * PAGES.length));
  const [tiles, setTiles] = useState<number[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [moves, setMoves] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [solved, setSolved] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [plainTiles, setPlainTiles] = useState<Set<number>>(new Set());
  const musicRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const cfg = DIFFICULTY_CONFIG[difficulty];
  const page = PAGES[pageIdx];
  const tileSize = BOARD_SIZE / cfg.gridSize;
  const timeLeft = Math.max(0, cfg.timeLimit - seconds);

  function stopMusic() {
    if (musicRef.current) {
      musicRef.current.pause();
      musicRef.current.currentTime = 0;
      musicRef.current = null;
    }
  }

  // Countdown timer
  useEffect(() => {
    if (phase === 'playing') {
      timerRef.current = setInterval(() => setSeconds(s => s + 1), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [phase]);

  // Timeout check
  useEffect(() => {
    if (phase === 'playing' && seconds >= cfg.timeLimit) {
      setPhase('timeout');
    }
  }, [phase, seconds, cfg.timeLimit]);

  // Save score on win
  useEffect(() => {
    if (phase === 'win' && seconds > 0) {
      const score = Math.round(cfg.timeLimit * 1000 / Math.max(1, seconds));
      saveScore(score, difficulty);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // Stop music on page change / unmount
  useEffect(() => { return () => stopMusic(); }, [pageIdx]);

  // Plain tile detection (number badges for visually uniform tiles)
  useEffect(() => {
    if (phase !== 'playing') return;
    setPlainTiles(new Set());
    const img = new Image();
    img.onload = () => {
      const ts = Math.floor(BOARD_SIZE / cfg.gridSize);
      const canvas = document.createElement('canvas');
      canvas.width = ts;
      canvas.height = ts;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      const plain = new Set<number>();
      const n = cfg.gridSize * cfg.gridSize;
      const STEP = 4;
      const VARIANCE_THRESHOLD = 500;
      for (let i = 0; i < n; i++) {
        const origRow = Math.floor(i / cfg.gridSize);
        const origCol = i % cfg.gridSize;
        ctx.clearRect(0, 0, ts, ts);
        ctx.drawImage(img, -origCol * ts, -origRow * ts, BOARD_SIZE, BOARD_SIZE);
        const data = ctx.getImageData(0, 0, ts, ts).data;
        let rSum = 0, gSum = 0, bSum = 0, count = 0;
        for (let p = 0; p < data.length; p += 4 * STEP) {
          rSum += data[p]; gSum += data[p + 1]; bSum += data[p + 2];
          count++;
        }
        const rM = rSum / count, gM = gSum / count, bM = bSum / count;
        let variance = 0;
        for (let p = 0; p < data.length; p += 4 * STEP) {
          variance += (data[p] - rM) ** 2 + (data[p + 1] - gM) ** 2 + (data[p + 2] - bM) ** 2;
        }
        if (variance / count < VARIANCE_THRESHOLD) plain.add(i);
      }
      setPlainTiles(plain);
    };
    img.src = page.src;
  }, [page.src, cfg.gridSize, phase]);

  function startGame(diff: Difficulty) {
    resetScore();
    stopMusic();
    setDifficulty(diff);
    setTiles(buildShuffled(DIFFICULTY_CONFIG[diff].gridSize));
    setSelected(null);
    setMoves(0);
    setSeconds(0);
    setSolved(false);
    setPhase('playing');
  }

  function reshuffleSame() {
    stopMusic();
    setTiles(buildShuffled(cfg.gridSize));
    setSelected(null);
    setMoves(0);
    setSeconds(0);
    setSolved(false);
    resetScore();
    setPhase('playing');
  }

  // Win detection
  useEffect(() => {
    if (tiles.length === 0 || solved || phase !== 'playing') return;
    if (tiles.every((v, i) => v === i)) {
      setSolved(true);
      onComplete?.();
      setTimeout(() => {
        burstFinale();
        playCorrectExclamation();
        setPhase('win');
        const musicSrc = PAGES[pageIdx].music;
        if (musicSrc) {
          stopMusic();
          const audio = new Audio(musicSrc);
          audio.volume = 0.65;
          musicRef.current = audio;
          audio.play().catch(() => undefined);
        }
      }, 300);
    }
  }, [tiles, solved, phase, pageIdx]);

  const handleTileClick = useCallback((pos: number) => {
    if (solved) return;
    if (selected === null) {
      setSelected(pos);
    } else if (selected === pos) {
      setSelected(null);
    } else {
      setTiles((prev) => {
        const next = [...prev];
        [next[selected], next[pos]] = [next[pos], next[selected]];
        return next;
      });
      setMoves((m) => m + 1);
      setSelected(null);
    }
  }, [solved, selected]);

  // ─── Select screen ──────────────────────────────────────────────
  if (phase === 'select') {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-8 px-4">
        <div className="text-center">
          <div
            className="mb-3 inline-flex items-center gap-2 rounded-full border-[3px] border-ink px-4 py-1 text-sm font-extrabold uppercase tracking-[0.2em]"
            style={{ background: '#8B5CF6', borderBottomWidth: 5, borderRightWidth: 4, color: '#fff' }}
          >
            🧩 Fix the Pic!
          </div>
          <p className="text-sm text-ink/60">Unscramble the picture before time runs out!</p>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row">
          {(['rookie', 'master'] as Difficulty[]).map(diff => {
            const d = DIFFICULTY_CONFIG[diff];
            return (
              <button
                key={diff}
                onClick={() => startGame(diff)}
                className="flex flex-col items-center gap-3 rounded-[2rem] border-[3px] border-ink px-8 py-6 transition-transform hover:-translate-y-1 active:translate-y-0"
                style={{ background: d.color + '22', borderBottomWidth: 6, borderRightWidth: 5, minWidth: '13rem' }}
              >
                <span className="text-4xl">{d.emoji}</span>
                <div className="text-center">
                  <div className="text-lg font-extrabold">{d.label}</div>
                  <div className="mt-0.5 text-xs text-ink/60">{d.desc}</div>
                </div>
                <span
                  className="mt-1 rounded-full border-[3px] border-ink px-6 py-1 text-sm font-extrabold text-white"
                  style={{ background: d.color, borderBottomWidth: 5, borderRightWidth: 4 }}
                >
                  Play →
                </span>
              </button>
            );
          })}
        </div>

        <p className="text-center text-xs text-ink/40 max-w-xs">
          Tap a piece, then tap where it should go. Faster = more points!
        </p>
      </div>
    );
  }

  // ─── Timeout screen ─────────────────────────────────────────────
  if (phase === 'timeout') {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-6 px-4 text-center">
        <div className="text-6xl">⏰</div>
        <h2 className="text-3xl font-extrabold">Time's Up!</h2>
        <p className="text-sm text-ink/60">
          {cfg.emoji} {cfg.label} · {page.flag} {page.name} · {moves} swaps made
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            onClick={() => reshuffleSame()}
            className="rounded-full border-[3px] border-ink px-8 py-2 text-sm font-extrabold text-white transition-transform hover:-translate-y-0.5"
            style={{ background: cfg.color, borderBottomWidth: 5, borderRightWidth: 4 }}
          >
            Try Again
          </button>
          <button
            onClick={() => setPhase('select')}
            className="rounded-full border-[3px] border-ink px-8 py-2 text-sm font-extrabold transition-transform hover:-translate-y-0.5"
            style={{ background: '#e5e7eb', borderBottomWidth: 5, borderRightWidth: 4 }}
          >
            Change Mode
          </button>
        </div>
      </div>
    );
  }

  // ─── Win screen ─────────────────────────────────────────────────
  if (phase === 'win') {
    const winScore = Math.round(cfg.timeLimit * 1000 / Math.max(1, seconds));
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-6 px-4 text-center">
        <div className="text-6xl">🎉</div>
        <h2 className="text-3xl font-extrabold">You Fixed It!</h2>
        <div className="flex gap-6 text-sm font-bold text-ink/70">
          <span>⏱ {formatTime(seconds)}</span>
          <span>🔀 {moves} swaps</span>
          <span>{page.flag} {page.name}</span>
        </div>
        <div
          className="rounded-2xl border-[3px] border-ink px-6 py-2 text-xl font-extrabold"
          style={{ background: cfg.color + '33', borderBottomWidth: 5, borderRightWidth: 4 }}
        >
          🏆 {winScore.toLocaleString()} pts
        </div>

        {/* Leaderboard */}
        <div className="w-full max-w-sm rounded-[2rem] border-[3px] border-ink p-4 text-left" style={{ background: '#1a1a2e', borderBottomWidth: 6, borderRightWidth: 5 }}>
          <div className="text-[0.6rem] font-extrabold uppercase tracking-[0.2em] text-gray-500 mb-1">
            🏆 Top Scores — {cfg.label}
          </div>
          {user ? (
            <p className="text-xs font-bold mb-2" style={{ color: saving ? '#9ca3af' : saved ? '#4ade80' : 'transparent' }}>
              {saving ? 'Saving score…' : '✓ Score saved to leaderboard'}
            </p>
          ) : (
            <button onClick={() => openAuthModal('sign-up')} className="text-xs font-bold text-yellow-400 underline hover:text-yellow-300 mb-2 block">
              🏆 Sign in to save your score
            </button>
          )}
          <Leaderboard gameSlug="sliding-puzzle" difficulty={difficulty} limit={5} theme="dark" />
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            onClick={() => reshuffleSame()}
            className="rounded-full border-[3px] border-ink px-8 py-2 text-sm font-extrabold text-white transition-transform hover:-translate-y-0.5"
            style={{ background: cfg.color, borderBottomWidth: 5, borderRightWidth: 4 }}
          >
            Play Again
          </button>
          <button
            onClick={() => { setPageIdx(i => randomPageIdx(i)); reshuffleSame(); }}
            className="rounded-full border-[3px] border-ink px-8 py-2 text-sm font-extrabold text-white transition-transform hover:-translate-y-0.5"
            style={{ background: '#8B5CF6', borderBottomWidth: 5, borderRightWidth: 4 }}
          >
            Next Pic →
          </button>
          <button
            onClick={() => setPhase('select')}
            className="rounded-full border-[3px] border-ink px-8 py-2 text-sm font-extrabold transition-transform hover:-translate-y-0.5"
            style={{ background: '#e5e7eb', borderBottomWidth: 5, borderRightWidth: 4 }}
          >
            Change Mode
          </button>
        </div>
      </div>
    );
  }

  // ─── Playing ────────────────────────────────────────────────────
  const isLowTime = timeLeft <= 30;

  return (
    <div className="flex flex-col items-center gap-5 py-6 px-4">

      {/* HUD */}
      <div className="flex w-full max-w-2xl items-center justify-between rounded-[1.5rem] border-[3px] border-ink px-4 py-2"
        style={{ background: cfg.color + '22', borderBottomWidth: 5, borderRightWidth: 4 }}>
        <div className="flex items-center gap-1.5 text-sm font-extrabold">
          <span>{cfg.emoji}</span>
          <span>{cfg.label}</span>
        </div>
        <div className="flex gap-4 text-sm font-bold">
          <span
            className="font-extrabold tabular-nums"
            style={{ color: isLowTime ? '#ef4444' : 'inherit' }}
          >
            ⏱ {formatTime(timeLeft)}
          </span>
          <span className="text-ink/70">🔀 {moves}</span>
        </div>
        <button
          onClick={() => setPhase('select')}
          className="rounded-full border-[2px] border-ink px-3 py-0.5 text-xs font-bold"
          style={{ background: '#fff', borderBottomWidth: 3, borderRightWidth: 2 }}
        >
          ← Quit
        </button>
      </div>

      {/* Game area */}
      <div className="flex flex-wrap items-start justify-center gap-5">

        {/* Board */}
        <div
          className="rounded-[1.5rem] border-[3px] border-ink p-3"
          style={{ background: '#fff', borderBottomWidth: 6, borderRightWidth: 5 }}
        >
          <div
            className="rounded-xl overflow-hidden"
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${cfg.gridSize}, ${tileSize}px)`,
              width: BOARD_SIZE,
              height: BOARD_SIZE,
            }}
          >
            {tiles.map((tileIdx, pos) => {
              const origRow = Math.floor(tileIdx / cfg.gridSize);
              const origCol = tileIdx % cfg.gridSize;
              const isSelectedTile = selected === pos;

              return (
                <motion.div
                  key={tileIdx}
                  layout
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  onClick={() => handleTileClick(pos)}
                  className="relative cursor-pointer select-none"
                  style={{
                    width: tileSize,
                    height: tileSize,
                    backgroundImage: `url("${page.src}")`,
                    backgroundSize: `${BOARD_SIZE}px ${BOARD_SIZE}px`,
                    backgroundPosition: `${-origCol * tileSize}px ${-origRow * tileSize}px`,
                    outline: isSelectedTile
                      ? '4px solid #8B5CF6'
                      : '1.5px solid rgba(255,255,255,0.4)',
                    zIndex: isSelectedTile ? 10 : 1,
                    filter: isSelectedTile ? 'brightness(1.2) drop-shadow(0 0 10px #8B5CF6)' : undefined,
                    scale: isSelectedTile ? 1.05 : 1,
                    transition: 'filter 0.15s, scale 0.15s, outline 0.1s',
                  }}
                >
                  {plainTiles.has(tileIdx) && (
                    <span
                      className="pointer-events-none absolute select-none font-extrabold leading-none"
                      style={{
                        bottom: 3,
                        right: 4,
                        fontSize: cfg.gridSize === 3 ? '0.7rem' : '0.5rem',
                        color: 'rgba(255,255,255,0.95)',
                        textShadow: '0 0 4px rgba(0,0,0,0.9), 0 1px 2px rgba(0,0,0,0.7)',
                      }}
                    >
                      {tileIdx + 1}
                    </span>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Side panel */}
        <div className="flex flex-col gap-3" style={{ minWidth: 160 }}>

          {/* Instruction hint */}
          <div
            className="rounded-[1.25rem] border-[3px] border-ink p-3 text-center text-xs font-bold leading-relaxed"
            style={{ background: selected !== null ? '#ede9fe' : '#fff', borderBottomWidth: 4, borderRightWidth: 3, color: selected !== null ? '#6d28d9' : '#555', transition: 'background 0.2s' }}
          >
            {selected !== null ? '✨ Now tap where to put it!' : '👆 Tap a piece to pick it up'}
          </div>

          {/* Picture nav */}
          <div
            className="flex items-center gap-2 rounded-[1.25rem] border-[3px] border-ink px-3 py-2"
            style={{ background: '#fff', borderBottomWidth: 4, borderRightWidth: 3 }}
          >
            <button
              onClick={() => setPageIdx((i) => Math.max(0, i - 1))}
              disabled={pageIdx === 0}
              className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-ink font-extrabold text-sm disabled:opacity-30"
              style={{ background: '#e9e4ff' }}
            >
              ‹
            </button>
            <span className="flex-1 text-center text-xs font-extrabold whitespace-nowrap">{page.flag} {page.name}</span>
            <button
              onClick={() => setPageIdx((i) => Math.min(PAGES.length - 1, i + 1))}
              disabled={pageIdx === PAGES.length - 1}
              className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-ink font-extrabold text-sm disabled:opacity-30"
              style={{ background: '#e9e4ff' }}
            >
              ›
            </button>
          </div>

          <button
            onClick={() => reshuffleSame()}
            className="rounded-full border-[3px] border-ink py-2.5 text-sm font-extrabold text-white transition-all hover:-translate-y-0.5 active:translate-y-0"
            style={{ background: '#f093fb', borderBottomWidth: 5, borderRightWidth: 4 }}
          >
            🔀 Shuffle
          </button>

          <button
            onClick={() => setShowPreview(true)}
            className="rounded-full border-[3px] border-ink py-2.5 text-sm font-extrabold transition-all hover:-translate-y-0.5 active:translate-y-0"
            style={{ background: '#d1fae5', borderBottomWidth: 5, borderRightWidth: 4 }}
          >
            🖼️ Preview
          </button>
          <p className="text-center text-[0.65rem] text-ink/45">See the full picture</p>
        </div>
      </div>

      {/* Preview overlay */}
      <AnimatePresence>
        {showPreview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 px-4"
            style={{ background: 'rgba(0,0,0,0.8)' }}
            onClick={() => setShowPreview(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="flex flex-col items-center gap-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-2">
                <span className="text-2xl">{page.flag}</span>
                <span className="text-lg font-extrabold text-white">{page.name}</span>
              </div>
              <img
                src={page.src}
                alt={`${page.name} full picture`}
                className="max-h-[70vh] max-w-[88vw] rounded-2xl shadow-2xl"
                style={{ border: '4px solid rgba(255,255,255,0.25)' }}
              />
              <button
                onClick={() => setShowPreview(false)}
                className="rounded-full border-[3px] border-white/40 px-8 py-2.5 text-sm font-extrabold text-white transition-all hover:bg-white/20"
              >
                ✕ Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
