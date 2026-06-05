import { useState, useCallback, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Link } from '@tanstack/react-router';
import { burstCorrect, burstFinale } from '@/game/confetti';
import { playCorrectExclamation, playIncorrectExclamation } from '@/game/exclamations';
import { asset } from '@/lib/asset';
import { SPELL_WORDS } from '@/game/spell-words';

const MAX_LIVES = 3;

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

const ALL_LETTERS = 'abcdefghijklmnopqrstuvwxyz';

const MSGS = {
  intro:   ['Spell it!', 'Tap the letters!', 'Can you spell it?', "What's the word?"],
  right:   ['Yes!', 'Nice one!', 'Keep going!', "That's it!"],
  wrong:   ['Not that one!', 'Try again!', 'Look again!', 'Hmm!'],
  noLives: ['Try again!', 'Start over!', "Let's reset!"],
  correct: ['You got it!', 'Amazing!', 'Brilliant!', "You're a speller!"],
};

type LetterTile = { id: string; char: string; color: string; used: boolean; };
type Phase = 'spelling' | 'correct';

function buildPool(word: string): LetterTile[] {
  const colors = shuffle([...LETTER_COLORS]);
  const wordTiles: LetterTile[] = word.split('').map((char, i) => ({
    id: `w${i}`, char, color: colors[i % colors.length], used: false,
  }));
  const decoys = shuffle(ALL_LETTERS.split('').filter(c => !word.includes(c))).slice(0, 4);
  const decoyTiles: LetterTile[] = decoys.map((char, i) => ({
    id: `d${i}`, char, color: colors[(i + word.length) % colors.length], used: false,
  }));
  return shuffle([...wordTiles, ...decoyTiles]);
}

function speakWord(word: string) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utt = new SpeechSynthesisUtterance(word);
  utt.rate = 0.82;
  utt.pitch = 1.2;
  window.speechSynthesis.speak(utt);
}

export function CaseyCanSpellGame() {
  // Words in difficulty order — no shuffle
  const [wordIdx, setWordIdx] = useState(0);
  const wordData = SPELL_WORDS[wordIdx];

  const [pool, setPool] = useState<LetterTile[]>(() => buildPool(SPELL_WORDS[0].word));
  const [slots, setSlots] = useState<(string | null)[]>(() => Array(SPELL_WORDS[0].word.length).fill(null));
  const [phase, setPhase] = useState<Phase>('spelling');
  const [caseyMsg, setCaseyMsg] = useState(() => pick(MSGS.intro));
  const [score, setScore] = useState(0);
  const [roundNum, setRoundNum] = useState(1);
  const [lives, setLives] = useState(MAX_LIVES);
  const [shakingId, setShakingId] = useState<string | null>(null);
  const [cardShaking, setCardShaking] = useState(false);
  const [labelVisible, setLabelVisible] = useState(false);
  const [cardKey, setCardKey] = useState(0);

  // Speak word on mount and on word change
  useEffect(() => {
    const t = setTimeout(() => speakWord(wordData.word), 500);
    return () => clearTimeout(t);
  }, [wordData.word]);

  const resetCurrentWord = useCallback(() => {
    setPool(buildPool(wordData.word));
    setSlots(Array(wordData.word.length).fill(null));
    setLives(MAX_LIVES);
    setLabelVisible(false);
    setCardKey(k => k + 1);
    setCaseyMsg(pick(MSGS.intro));
  }, [wordData.word]);

  const handleTap = useCallback((tile: LetterTile) => {
    if (phase !== 'spelling' || tile.used) return;
    const word = wordData.word;
    const currentNextSlot = slots.findIndex(s => s === null);
    const expected = word[currentNextSlot];

    if (tile.char === expected) {
      setCaseyMsg(pick(MSGS.right));
      const newSlots = [...slots];
      newSlots[currentNextSlot] = tile.char;
      setPool(prev => prev.map(t => t.id === tile.id ? { ...t, used: true } : t));
      setSlots(newSlots);
      if (currentNextSlot === word.length - 1) {
        setCaseyMsg(pick(MSGS.correct));
        setScore(s => s + 1);
        setPhase('correct');
        playCorrectExclamation();
        if (roundNum >= SPELL_WORDS.length) burstFinale(); else burstCorrect();
      }
    } else {
      const newLives = lives - 1;
      setCaseyMsg(newLives > 0 ? pick(MSGS.wrong) : pick(MSGS.noLives));
      playIncorrectExclamation();
      setShakingId(tile.id);
      setTimeout(() => setShakingId(null), 400);
      if (newLives <= 0) {
        setCardShaking(true);
        setTimeout(() => {
          setCardShaking(false);
          resetCurrentWord();
        }, 600);
      } else {
        setLives(newLives);
      }
    }
  }, [phase, wordData.word, slots, lives, roundNum, resetCurrentWord]);

  const nextWord = useCallback(() => {
    const nextIdx = (wordIdx + 1) % SPELL_WORDS.length;
    const next = SPELL_WORDS[nextIdx];
    setWordIdx(nextIdx);
    setPool(buildPool(next.word));
    setSlots(Array(next.word.length).fill(null));
    setPhase('spelling');
    setLives(MAX_LIVES);
    setLabelVisible(false);
    setCaseyMsg(pick(MSGS.intro));
    setRoundNum(r => r + 1);
    setCardKey(k => k + 1);
  }, [wordIdx]);

  return (
    <div className="relative flex h-full overflow-hidden select-none">
      <div className="absolute inset-0 z-0"
        style={{ background: 'linear-gradient(135deg, #e0f2fe 0%, #f0fdf4 50%, #fef9c3 100%)' }} />

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
          ⭐ {score}
        </div>
      </div>

      <div className="relative z-10 flex h-full w-full items-center justify-center px-4">
        <motion.div
          key={cardKey}
          initial={{ scale: 0.95, opacity: 0 }}
          animate={cardShaking
            ? { x: [-8, 8, -6, 6, -4, 4, 0], scale: 1, opacity: 1 }
            : { x: 0, scale: 1, opacity: 1 }
          }
          transition={{ duration: cardShaking ? 0.5 : 0.25 }}
          className="relative flex flex-col items-center gap-4 rounded-3xl border-[4px] border-ink px-8 py-6 shadow-2xl"
          style={{
            background: '#ffffff',
            backgroundImage: `
              linear-gradient(rgba(99,102,241,0.15) 1px, transparent 1px),
              linear-gradient(90deg, rgba(99,102,241,0.15) 1px, transparent 1px)
            `,
            backgroundSize: '22px 22px',
            borderBottomWidth: 7,
            borderRightWidth: 6,
            minWidth: 300,
            maxWidth: '80vw',
            paddingRight: 140,
          }}
        >
          {/* Title + hearts */}
          <div className="flex items-center gap-3">
            <span className="text-base font-extrabold tracking-tight" style={{ color: '#1a1a2e' }}>
              Casey Can Spell!
            </span>
            <div className="flex gap-0.5">
              {Array.from({ length: MAX_LIVES }).map((_, i) => (
                <span key={i} className="text-lg leading-none" style={{ opacity: i < lives ? 1 : 0.2 }}>❤️</span>
              ))}
            </div>
          </div>

          {/* Casey */}
          <div className="absolute top-3 right-3 flex flex-col items-center">
            <div className="relative mb-1" style={{ height: 40, width: 110 }}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={caseyMsg}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="absolute top-0 left-0 right-0 rounded-2xl border-[3px] border-ink bg-white px-3 py-1.5 text-center text-xs font-extrabold leading-tight shadow-md"
                  style={{ borderBottomWidth: 4, borderRightWidth: 3 }}
                >
                  {caseyMsg}
                  <div className="absolute bottom-[-8px] left-1/2 -translate-x-1/2 w-0 h-0"
                    style={{ borderLeft: '6px solid transparent', borderRight: '6px solid transparent', borderTop: '8px solid #1c1917' }} />
                </motion.div>
              </AnimatePresence>
            </div>
            <img src={asset('/characters/casey-pointing.png')} alt="Casey" className="h-32 w-auto object-contain" />
          </div>

          {/* Word image — tap to reveal label */}
          <div className="flex flex-col items-center gap-1">
            <motion.button
              onClick={() => { setLabelVisible(true); speakWord(wordData.word); }}
              whileTap={{ scale: 0.93 }}
              className="flex items-center justify-center rounded-2xl border-[3px] border-ink/20 bg-white/80 p-2 shadow cursor-pointer"
              style={{ width: 96, height: 96 }}
              title="Tap to hear the word"
            >
              <img src={wordData.image} alt={wordData.label} className="w-full h-full object-contain" />
            </motion.button>
            <AnimatePresence>
              {labelVisible && (
                <motion.span
                  initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="text-xs font-bold"
                  style={{ color: '#9ca3af' }}
                >
                  {wordData.label}
                </motion.span>
              )}
            </AnimatePresence>
            {!labelVisible && (
              <span className="text-[10px] font-semibold" style={{ color: '#d1d5db' }}>tap to peek 👆</span>
            )}
          </div>

          {/* Answer slots */}
          <div className="flex gap-2 flex-wrap justify-center">
            {slots.map((char, i) => (
              <motion.div
                key={i}
                animate={phase === 'correct' ? { scale: [1, 1.25, 1] } : {}}
                transition={{ delay: i * 0.07, duration: 0.3 }}
                className="flex items-center justify-center rounded-xl border-[3px] border-ink text-xl font-extrabold shadow"
                style={{
                  width: 44, height: 48,
                  background: char ? (phase === 'correct' ? '#86efac' : '#bfdbfe') : '#f1f5f9',
                  borderBottomWidth: 4, borderRightWidth: 3,
                  color: '#1a1a2e',
                }}
              >
                {char ? char.toUpperCase() : ''}
              </motion.div>
            ))}
          </div>

          {/* Letter pool */}
          <div className="flex flex-wrap justify-center gap-2" style={{ maxWidth: 320 }}>
            {pool.map((tile) => (
              <motion.button
                key={tile.id}
                animate={shakingId === tile.id ? { x: [-6, 6, -5, 5, -3, 3, 0] } : {}}
                transition={{ duration: 0.35 }}
                onClick={() => handleTap(tile)}
                disabled={tile.used || phase === 'correct'}
                whileTap={!tile.used && phase === 'spelling' ? { scale: 0.82 } : undefined}
                className="flex items-center justify-center rounded-xl border-[3px] border-ink text-base font-extrabold shadow"
                style={{
                  width: 44, height: 48,
                  background: tile.used ? 'transparent' : tile.color,
                  borderColor: tile.used ? 'transparent' : undefined,
                  color: tile.used ? 'transparent' : '#1a1a2e',
                  borderBottomWidth: tile.used ? 0 : 4,
                  borderRightWidth: tile.used ? 0 : 3,
                  pointerEvents: tile.used ? 'none' : undefined,
                  transition: 'background 0.15s, border-color 0.15s',
                }}
              >
                {tile.char.toUpperCase()}
              </motion.button>
            ))}
          </div>

          <AnimatePresence>
            {phase === 'correct' && (
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                onClick={nextWord}
                className="w-full rounded-xl border-[3px] border-ink py-2 text-sm font-extrabold shadow"
                style={{ background: '#86efac', borderBottomWidth: 4, borderRightWidth: 3 }}
              >
                Next Word →
              </motion.button>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
