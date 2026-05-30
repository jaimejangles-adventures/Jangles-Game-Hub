import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { burstFinale } from '@/game/confetti';
import { playCorrectExclamation } from '@/game/exclamations';
import { cn } from '@/lib/utils';

const BOARD_SIZE = 420;

const PAGES = [
  { flag: '🇺🇸', name: 'U.S.A.',         src: '/puzzle-pages/page-3.png',  music: '/music/NEW ORLEANS.wav' },
  { flag: '🇲🇽', name: 'Mexico',          src: '/puzzle-pages/page-4.png',  music: '/music/MEXICO.wav' },
  { flag: '🇯🇲', name: 'Jamaica',         src: '/puzzle-pages/page-5.png',  music: '/music/JAMAICA.wav' },
  { flag: '🇧🇧', name: 'Barbados',        src: '/puzzle-pages/page-6.png',  music: '/music/BARBADOS_2.wav' },
  { flag: '🇵🇪', name: 'Peru',            src: '/puzzle-pages/page-7.png',  music: '/music/PERU.wav' },
  { flag: '🇦🇷', name: 'Argentina',       src: '/puzzle-pages/page-8.png',  music: '/music/ARGENTINA DRUMS AND HORNS_1.2.wav' },
  { flag: '❄️',  name: 'Antarctica',      src: '/puzzle-pages/page-9.png',  music: null },
  { flag: '🇬🇧', name: 'United Kingdom',  src: '/puzzle-pages/page-10.png', music: '/music/UK.wav' },
  { flag: '🇪🇸', name: 'Spain',           src: '/puzzle-pages/page-11.png', music: '/music/SPAIN1.2.wav' },
  { flag: '🇫🇷', name: 'France',          src: '/puzzle-pages/page-12.png', music: '/music/FRANCE.wav' },
  { flag: '🇮🇹', name: 'Italy',           src: '/puzzle-pages/page-13.png', music: '/music/ITALY.wav' },
  { flag: '🇱🇰', name: 'Sri Lanka',       src: '/puzzle-pages/page-15.png', music: '/music/SRI LANKA_1.1.wav' },
  { flag: '🇯🇵', name: 'Japan',           src: '/puzzle-pages/page-16.png', music: '/music/JAPAN.wav' },
  { flag: '🇨🇭', name: 'Switzerland',     src: '/puzzle-pages/page-17.png', music: '/music/SWITZERLAND.wav' },
  { flag: '🇰🇪', name: 'Kenya',           src: '/puzzle-pages/page-18.png', music: '/music/KENYA.wav' },
  { flag: '🇿🇦', name: 'South Africa',    src: '/puzzle-pages/page-19.png', music: '/music/SOUTH AFRICA_1.2.wav' },
  { flag: '🇬🇭', name: 'Ghana',           src: '/puzzle-pages/page-20.png', music: '/music/GHANA.wav' },
  { flag: '🇰🇷', name: 'South Korea',     src: '/puzzle-pages/page-21.png', music: '/music/SOUTH KOREA.wav' },
  { flag: '🇳🇵', name: 'Nepal',           src: '/puzzle-pages/page-22.png', music: '/music/NEPAL.wav' },
  { flag: '🇮🇩', name: 'Indonesia',       src: '/puzzle-pages/page-23.png', music: '/music/INDONESIA.wav' },
  { flag: '🇦🇺', name: 'Australia',       src: '/puzzle-pages/page-24.png', music: '/music/Jamie Jangles_Daniel_Australia.wav' },
];

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

export function SlidingPuzzleGame() {
  const [gridSize, setGridSize] = useState(3);
  const [pageIdx, setPageIdx] = useState(() => Math.floor(Math.random() * PAGES.length));
  const [tiles, setTiles] = useState<number[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [moves, setMoves] = useState(0);
  const [solved, setSolved] = useState(false);
  const [showWin, setShowWin] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [plainTiles, setPlainTiles] = useState<Set<number>>(new Set());
  const musicRef = useRef<HTMLAudioElement | null>(null);
  const page = PAGES[pageIdx];
  const tileSize = BOARD_SIZE / gridSize;

  function stopMusic() {
    if (musicRef.current) {
      musicRef.current.pause();
      musicRef.current.currentTime = 0;
      musicRef.current = null;
    }
  }

  // Stop music when page changes or component unmounts
  useEffect(() => { return () => stopMusic(); }, [pageIdx]);

  // Detect visually uniform (plain) tiles via canvas pixel-variance analysis.
  // Only those tiles get a number badge so kids can tell identical-looking pieces apart.
  useEffect(() => {
    setPlainTiles(new Set());
    const img = new Image();
    img.onload = () => {
      const ts = Math.floor(BOARD_SIZE / gridSize);
      const canvas = document.createElement('canvas');
      canvas.width = ts;
      canvas.height = ts;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const plain = new Set<number>();
      const n = gridSize * gridSize;
      const STEP = 4; // sample every 4th pixel — fast enough for any grid size
      const VARIANCE_THRESHOLD = 500; // below this → tile looks too uniform to distinguish

      for (let i = 0; i < n; i++) {
        const origRow = Math.floor(i / gridSize);
        const origCol = i % gridSize;
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
  }, [page.src, gridSize]);

  const startPuzzle = useCallback((size: number) => {
    stopMusic();
    setTiles(buildShuffled(size));
    setSelected(null);
    setMoves(0);
    setSolved(false);
    setShowWin(false);
  }, []);

  useEffect(() => {
    startPuzzle(gridSize);
  }, [gridSize, pageIdx, startPuzzle]);

  // Win detection
  useEffect(() => {
    if (tiles.length === 0 || solved) return;
    if (tiles.every((v, i) => v === i)) {
      setSolved(true);
      setTimeout(() => {
        setShowWin(true);
        burstFinale();
        playCorrectExclamation();
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
  }, [tiles, solved, pageIdx]);

  const handleTileClick = useCallback((pos: number) => {
    if (solved) return;

    if (selected === null) {
      // First click: select this piece
      setSelected(pos);
    } else if (selected === pos) {
      // Clicked same piece: deselect
      setSelected(null);
    } else {
      // Second click: swap the two pieces
      setTiles((prev) => {
        const next = [...prev];
        [next[selected], next[pos]] = [next[pos], next[selected]];
        return next;
      });
      setMoves((m) => m + 1);
      setSelected(null);
    }
  }, [solved, selected]);

  return (
    <div className="flex flex-col items-center gap-5 py-6 px-4">

      {/* Header */}
      <div className="text-center">
        <div
          className="inline-flex items-center gap-2 rounded-full border-[3px] border-ink px-4 py-1 text-sm font-extrabold uppercase tracking-[0.2em]"
          style={{ background: '#8B5CF6', borderBottomWidth: 5, borderRightWidth: 4, color: '#fff' }}
        >
          🧩 Fix the Pic!
        </div>
        <p className="mt-2 text-sm text-ink/60">Tap a piece, then tap where it should go</p>
      </div>

      {/* Controls row */}
      <div className="flex flex-wrap items-center justify-center gap-3">

        {/* Page nav */}
        <div
          className="flex items-center gap-2 rounded-full border-[3px] border-ink px-3 py-1.5"
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
          <span className="text-center text-sm font-extrabold whitespace-nowrap">{page.flag} {page.name}</span>
          <button
            onClick={() => setPageIdx((i) => Math.min(PAGES.length - 1, i + 1))}
            disabled={pageIdx === PAGES.length - 1}
            className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-ink font-extrabold text-sm disabled:opacity-30"
            style={{ background: '#e9e4ff' }}
          >
            ›
          </button>
        </div>

        {/* Difficulty */}
        <div
          className="flex overflow-hidden rounded-full border-[3px] border-ink"
          style={{ borderBottomWidth: 4, borderRightWidth: 3 }}
        >
          {([3, 4, 6] as const).map((g) => (
            <button
              key={g}
              onClick={() => setGridSize(g)}
              className={cn(
                'px-4 py-1.5 text-sm font-extrabold transition-all',
                gridSize === g ? 'text-white' : 'bg-white text-ink/50',
              )}
              style={gridSize === g ? { background: '#8B5CF6' } : {}}
            >
              {g}×{g} {g === 3 ? 'Easy' : g === 4 ? 'Hard' : 'Expert'}
            </button>
          ))}
        </div>
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
              gridTemplateColumns: `repeat(${gridSize}, ${tileSize}px)`,
              width: BOARD_SIZE,
              height: BOARD_SIZE,
            }}
          >
            {tiles.map((tileIdx, pos) => {
              const origRow = Math.floor(tileIdx / gridSize);
              const origCol = tileIdx % gridSize;
              const isSelected = selected === pos;

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
                    outline: isSelected
                      ? '4px solid #8B5CF6'
                      : '1.5px solid rgba(255,255,255,0.4)',
                    zIndex: isSelected ? 10 : 1,
                    filter: isSelected ? 'brightness(1.2) drop-shadow(0 0 10px #8B5CF6)' : undefined,
                    scale: isSelected ? 1.05 : 1,
                    transition: 'filter 0.15s, scale 0.15s, outline 0.1s',
                  }}
                >
                  {/* Number badge only on visually uniform tiles (sky, water, etc.)
                      so kids can tell identical-looking pieces apart */}
                  {plainTiles.has(tileIdx) && (
                    <span
                      className="pointer-events-none absolute select-none font-extrabold leading-none"
                      style={{
                        bottom: 3,
                        right: 4,
                        fontSize: gridSize === 3 ? '0.7rem' : gridSize === 4 ? '0.6rem' : '0.5rem',
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

          {/* Moves */}
          <div
            className="rounded-[1.25rem] border-[3px] border-ink p-4 text-center"
            style={{ background: '#fff', borderBottomWidth: 5, borderRightWidth: 4 }}
          >
            <div className="text-[0.65rem] font-extrabold uppercase tracking-[0.2em] text-ink/50">Swaps</div>
            <div className="mt-1 text-4xl font-extrabold" style={{ color: '#8B5CF6' }}>{moves}</div>
          </div>

          <button
            onClick={() => startPuzzle(gridSize)}
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

      {/* Win overlay */}
      <AnimatePresence>
        {showWin && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center"
            style={{ background: 'rgba(0,0,0,0.55)' }}
          >
            <motion.div
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 20 }}
              className="mx-4 flex flex-col items-center gap-4 rounded-[2rem] border-[4px] border-ink p-8 text-center"
              style={{ background: '#fff', borderBottomWidth: 7, borderRightWidth: 6, maxWidth: 340 }}
            >
              <div className="text-5xl">🎉</div>
              <div>
                <h2 className="text-2xl font-extrabold" style={{ color: '#8B5CF6' }}>You Did It!</h2>
                <p className="mt-1 text-sm text-ink/60">Solved in {moves} swap{moves !== 1 ? 's' : ''}!</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => startPuzzle(gridSize)}
                  className="rounded-full border-[3px] border-ink px-5 py-2 text-sm font-extrabold text-white"
                  style={{ background: '#f093fb', borderBottomWidth: 5, borderRightWidth: 4 }}
                >
                  Play Again
                </button>
                <button
                  onClick={() => setPageIdx((i) => randomPageIdx(i))}
                  className="rounded-full border-[3px] border-ink px-5 py-2 text-sm font-extrabold text-white"
                  style={{ background: '#8B5CF6', borderBottomWidth: 5, borderRightWidth: 4 }}
                >
                  Next →
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
