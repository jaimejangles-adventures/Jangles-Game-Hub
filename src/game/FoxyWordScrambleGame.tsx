import { useState, useCallback, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Link } from '@tanstack/react-router';
import { burstCorrect, burstFinale } from '@/game/confetti';
import { playCorrectExclamation, playIncorrectExclamation } from '@/game/exclamations';
import { asset } from '@/lib/asset';
import { SPELL_WORDS } from '@/game/spell-words';

function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const LETTER_COLORS = [
  '#F9A8D4', '#FCA5A5', '#FCD34D', '#86EFAC', '#67E8F9',
  '#93C5FD', '#C4B5FD', '#F0ABFC', '#FDE68A', '#A7F3D0',
  '#FDBA74', '#6EE7B7',
];

const MSGS = {
  intro:   ['Unscramble it!', 'Fix the letters!', 'Rearrange them!', 'Mix it back!'],
  place:   ['Good one!', 'Keep going!', 'Yes!', 'Nice!'],
  correct: ['You got it!', 'Brilliant!', 'Nailed it!', 'Woo-hoo!'],
  wrong:   ['Not quite!', 'Try again!', 'Almost!', 'Rethink it!'],
};

type LetterTile = { id: string; char: string; color: string; };
type Phase = 'scrambling' | 'correct' | 'wrong';

function buildScramble(word: string): LetterTile[] {
  const colors = shuffle([...LETTER_COLORS]);
  let tiles: LetterTile[] = word.split('').map((char, i) => ({
    id: `w${i}`, char, color: colors[i % colors.length],
  }));
  let attempts = 0;
  while (tiles.map(t => t.char).join('') === word && attempts < 20) {
    tiles = shuffle(tiles);
    attempts++;
  }
  return tiles;
}

export function FoxyWordScrambleGame({ onComplete }: { onComplete?: () => void } = {}) {
  const [wordOrder] = useState(() => shuffle(SPELL_WORDS.map((_, i) => i)));
  const [wordOrderIdx, setWordOrderIdx] = useState(0);
  const [pool, setPool] = useState<LetterTile[]>(() => buildScramble(SPELL_WORDS[wordOrder[0]].word));
  const [placed, setPlaced] = useState<(LetterTile | null)[]>(() => Array(SPELL_WORDS[wordOrder[0]].word.length).fill(null));
  const [phase, setPhase] = useState<Phase>('scrambling');
  const [foxyMsg, setFoxyMsg] = useState(() => pick(MSGS.intro));
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [roundNum, setRoundNum] = useState(1);
  const [shakingSlots, setShakingSlots] = useState(false);
  const [cardKey, setCardKey] = useState(0);
  const [hintVisible, setHintVisible] = useState(false);
  const [hintUsed, setHintUsed] = useState(false);
  const [lastPoints, setLastPoints] = useState<number | null>(null);

  const wordData = SPELL_WORDS[wordOrder[wordOrderIdx]];

  const handleTapPool = useCallback((tile: LetterTile) => {
    if (phase !== 'scrambling') return;

    const emptyIdx = placed.findIndex(s => s === null);
    if (emptyIdx === -1) return;

    const next = [...placed];
    next[emptyIdx] = tile;
    setPlaced(next);
    setPool(prev => prev.filter(t => t.id !== tile.id));

    if (emptyIdx < placed.length - 1) {
      setFoxyMsg(pick(MSGS.place));
      return;
    }

    // Last slot filled — check answer
    const word = SPELL_WORDS[wordOrder[wordOrderIdx]].word;
    const attempt = next.map(t => t!.char).join('');

    if (attempt === word) {
      const pts = hintUsed ? 500 : 2000;
      setFoxyMsg(pick(MSGS.correct));
      setScore(s => s + pts);
      setLastPoints(pts);
      const newCount = correctCount + 1;
      setCorrectCount(newCount);
      setPhase('correct');
      playCorrectExclamation();
      if (newCount % 5 === 0) onComplete?.();
      if (roundNum >= SPELL_WORDS.length - 1) burstFinale(); else burstCorrect();
    } else {
      const returnTiles = next.filter(Boolean) as LetterTile[];
      setFoxyMsg(pick(MSGS.wrong));
      playIncorrectExclamation();
      setPhase('wrong');
      setShakingSlots(true);
      setTimeout(() => {
        setShakingSlots(false);
        setPool(p => shuffle([...p, ...returnTiles]));
        setPlaced(Array(word.length).fill(null));
        setPhase('scrambling');
        setFoxyMsg(pick(MSGS.intro));
      }, 1200);
    }
  }, [phase, placed, wordOrder, wordOrderIdx, correctCount, hintUsed, roundNum, onComplete]);

  const handleTapPlaced = useCallback((slotIdx: number) => {
    if (phase !== 'scrambling') return;
    const tile = placed[slotIdx];
    if (!tile) return;
    const filled = placed.filter((t, i) => i !== slotIdx && t !== null) as LetterTile[];
    const compacted: (LetterTile | null)[] = [...filled, ...Array(placed.length - filled.length).fill(null)];
    setPlaced(compacted);
    setPool(prev => shuffle([...prev, tile]));
    setFoxyMsg(pick(MSGS.intro));
  }, [phase, placed]);

  const nextWord = useCallback(() => {
    const nextIdx = (wordOrderIdx + 1) % SPELL_WORDS.length;
    const nextWordData = SPELL_WORDS[wordOrder[nextIdx]];
    setWordOrderIdx(nextIdx);
    setPool(buildScramble(nextWordData.word));
    setPlaced(Array(nextWordData.word.length).fill(null));
    setPhase('scrambling');
    setFoxyMsg(pick(MSGS.intro));
    setRoundNum(r => r + 1);
    setCardKey(k => k + 1);
    setHintVisible(false);
    setHintUsed(false);
    setLastPoints(null);
  }, [wordOrderIdx, wordOrder]);

  // Keyboard support
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (phase !== 'scrambling') return;
      if (e.key === 'Backspace') {
        // Return the last placed tile
        const lastIdx = [...placed].map((t, i) => t ? i : -1).filter(i => i !== -1).pop();
        if (lastIdx !== undefined) handleTapPlaced(lastIdx);
      } else if (e.key.length === 1 && /[a-zA-Z]/.test(e.key)) {
        const char = e.key.toLowerCase();
        const tile = pool.find(t => t.char.toLowerCase() === char);
        if (tile) handleTapPool(tile);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [phase, placed, pool, handleTapPool, handleTapPlaced]);

  return (
    <div className="relative flex h-full overflow-hidden select-none">
      <div className="absolute inset-0 z-0"
        style={{ background: 'linear-gradient(135deg, #fff7ed 0%, #fef3c7 50%, #fde68a 100%)' }} />

      <div className="absolute top-3 left-3 z-30">
        <Link to="/"
          className="flex items-center gap-1.5 rounded-2xl border-[3px] border-ink bg-white px-3 py-1.5 text-xs font-extrabold shadow-md"
          style={{ borderBottomWidth: 5, borderRightWidth: 4 }}>
          ← Games
        </Link>
      </div>
      <div className="absolute top-3 right-3 z-30 flex gap-2">
        <div className="rounded-2xl border-[3px] border-ink bg-white px-3 py-1 text-xs font-extrabold shadow"
          style={{ borderBottomWidth: 4, borderRightWidth: 3 }}>
          <span className="text-ink/40">Round </span>{roundNum}
        </div>
        <div className="rounded-2xl border-[3px] border-ink px-3 py-1 text-xs font-extrabold shadow"
          style={{ background: '#fbbf24', borderBottomWidth: 4, borderRightWidth: 3 }}>
          ⭐ {score.toLocaleString()}
        </div>
      </div>

      <div className="relative z-10 flex h-full w-full items-center justify-center px-4">
        <motion.div
          key={cardKey}
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.25 }}
          className="relative flex flex-col items-center gap-4 rounded-3xl border-[4px] px-8 py-6 shadow-2xl"
          style={{
            background: '#fffbf0',
            borderColor: '#ef6c00',
            borderBottomWidth: 7,
            borderRightWidth: 6,
            minWidth: 300,
            maxWidth: '80vw',
            paddingRight: 140,
          }}
        >
          <span className="text-base font-extrabold tracking-tight" style={{ color: '#1a1a2e' }}>
            Foxy's Word Scramble!
          </span>

          {/* Foxy */}
          <div className="absolute top-3 right-3 flex flex-col items-center">
            <div className="relative mb-1" style={{ height: 40, width: 110 }}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={foxyMsg}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="absolute top-0 left-0 right-0 rounded-2xl border-[3px] border-ink bg-white px-3 py-1.5 text-center text-xs font-extrabold leading-tight shadow-md"
                  style={{ borderBottomWidth: 4, borderRightWidth: 3 }}
                >
                  {foxyMsg}
                  <div className="absolute bottom-[-8px] left-1/2 -translate-x-1/2 w-0 h-0"
                    style={{ borderLeft: '6px solid transparent', borderRight: '6px solid transparent', borderTop: '8px solid #1c1917' }} />
                </motion.div>
              </AnimatePresence>
            </div>
            <img src={asset('/characters/FOX 3.png')} alt="Foxy" className="h-32 w-auto object-contain" />
          </div>

          {/* Hint */}
          <div className="flex flex-col items-center gap-1">
            {hintVisible && (
              <div className="flex items-center justify-center rounded-2xl border-[3px] bg-white/80 p-2 shadow"
                style={{ width: 96, height: 96, borderColor: '#ef6c00' }}>
                {wordData.hintEmoji
                  ? <span style={{ fontSize: 60, lineHeight: 1 }}>{wordData.hintEmoji}</span>
                  : <img src={wordData.image} alt={wordData.label} className="w-full h-full object-contain" />}
              </div>
            )}
            <button
              onClick={() => { setHintVisible(h => !h); setHintUsed(true); }}
              className="rounded-2xl border-[3px] border-ink px-3 py-1 text-xs font-extrabold shadow transition-all"
              style={{
                background: hintVisible ? '#fde68a' : '#f1f5f9',
                borderBottomWidth: 4,
                borderRightWidth: 3,
              }}
            >
              {hintVisible ? 'Hide Hint' : '💡 Hint'}
            </button>
          </div>

          {/* Placed slots — tap to return */}
          <div className="flex gap-2 flex-wrap justify-center">
            {placed.map((tile, i) => (
              <motion.button
                key={i}
                animate={
                  shakingSlots ? { x: [-5, 5, -4, 4, 0] } :
                  phase === 'correct' ? { scale: [1, 1.25, 1] } :
                  {}
                }
                transition={shakingSlots ? { duration: 0.35 } : { delay: i * 0.07, duration: 0.3 }}
                onClick={() => handleTapPlaced(i)}
                disabled={phase !== 'scrambling' || !tile}
                className="flex items-center justify-center rounded-xl border-[3px] border-ink text-xl font-extrabold shadow"
                style={{
                  width: 44, height: 48,
                  background: tile
                    ? (phase === 'correct' ? '#86efac' : phase === 'wrong' ? '#fca5a5' : tile.color)
                    : '#f1f5f9',
                  borderBottomWidth: 4, borderRightWidth: 3,
                  color: '#1a1a2e',
                  cursor: tile && phase === 'scrambling' ? 'pointer' : 'default',
                }}
              >
                {tile ? tile.char.toUpperCase() : ''}
              </motion.button>
            ))}
          </div>

          {/* Scrambled pool */}
          <div className="flex flex-wrap justify-center gap-2" style={{ maxWidth: 320 }}>
            {pool.map((tile) => (
              <motion.button
                key={tile.id}
                onClick={() => handleTapPool(tile)}
                disabled={phase !== 'scrambling'}
                whileTap={{ scale: 0.82 }}
                className="flex items-center justify-center rounded-xl border-[3px] border-ink text-base font-extrabold shadow"
                style={{
                  width: 44, height: 48,
                  background: tile.color,
                  borderBottomWidth: 4, borderRightWidth: 3,
                  color: '#1a1a2e',
                }}
              >
                {tile.char.toUpperCase()}
              </motion.button>
            ))}
          </div>

          <AnimatePresence>
            {phase === 'correct' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                className="flex flex-col items-center gap-2 w-full"
              >
                {/* Points earned */}
                <motion.div
                  initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 18 }}
                  className="text-2xl font-extrabold"
                  style={{ color: lastPoints === 2000 ? '#16a34a' : '#d97706' }}
                >
                  +{lastPoints?.toLocaleString()} pts{lastPoints === 2000 ? ' 🌟' : ''}
                </motion.div>

                {/* Revealed item */}
                <motion.div
                  initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.1 }}
                  className="flex items-center justify-center rounded-2xl border-[3px] bg-white/90 p-2 shadow-lg"
                  style={{ width: 100, height: 100, borderColor: '#ef6c00' }}
                >
                  {wordData.hintEmoji
                    ? <span style={{ fontSize: 64, lineHeight: 1 }}>{wordData.hintEmoji}</span>
                    : <img src={wordData.image} alt={wordData.label} className="w-full h-full object-contain" />}
                </motion.div>

                {/* Story quip */}
                {wordData.quip && (
                  <motion.p
                    initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                    className="text-center text-xs font-semibold leading-snug px-1"
                    style={{ color: '#78350f', maxWidth: 220 }}
                  >
                    {wordData.quip}
                  </motion.p>
                )}

                <button
                  onClick={nextWord}
                  className="w-full rounded-xl border-[3px] border-ink py-2 text-sm font-extrabold shadow"
                  style={{ background: '#86efac', borderBottomWidth: 4, borderRightWidth: 3 }}
                >
                  Next Word →
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
