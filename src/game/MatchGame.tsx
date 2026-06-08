import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { burstFinale } from '@/game/confetti';
import { asset } from '@/lib/asset';
import { useScore } from '@/hooks/use-score';
import { useAuth } from '@/lib/auth-context';
import { Leaderboard } from '@/components/leaderboard';

// Real coloured book illustrations from /count-objects/
const ALL_OBJECTS = [
  { id: 'elephant',     label: 'Elephant',     src: asset('/count-objects/elephant.png') },
  { id: 'penguin',      label: 'Penguin',       src: asset('/count-objects/south-africa-penguin.png') },
  { id: 'octopus',      label: 'Octopus',       src: asset('/count-objects/octapus.png') },
  { id: 'flying-fish',  label: 'Flying Fish',   src: asset('/count-objects/flying-fish.png') },
  { id: 'trombone',     label: 'Trombone',      src: asset('/count-objects/trombone.png') },
  { id: 'sombrero',     label: 'Sombrero',      src: asset('/count-objects/mexico-hat.png') },
  { id: 'steel-drum',   label: 'Steel Drum',    src: asset('/count-objects/jamaica-steel-drum.png') },
  { id: 'eiffel',       label: 'Eiffel Tower',  src: asset('/count-objects/france-eiffel.png') },
  { id: 'pan-flute',    label: 'Pan Flute',     src: asset('/count-objects/peru-pan-flute.png') },
  { id: 'pizza',        label: 'Pizza',         src: asset('/count-objects/pizza.png') },
  { id: 'sitar',        label: 'Sitar',         src: asset('/count-objects/sri-lanka-sittar.png') },
  { id: 'skis',         label: 'Skis',          src: asset('/count-objects/swiss-skiis.png') },
  { id: 'korea-mask',   label: 'Korean Mask',   src: asset('/count-objects/korea-mask.png') },
  { id: 'tomato',       label: 'Tomato',        src: asset('/count-objects/spain-tomato.png') },
  { id: 'jewellery',    label: 'Jewellery',     src: asset('/count-objects/ghana-jewlery.png') },
  { id: 'tuba',         label: 'Tuba',          src: asset('/count-objects/tuba.png') },
  { id: 'compass',      label: 'Compass',       src: asset('/count-objects/compass.png') },
  { id: 'spyglass',     label: 'Spyglass',      src: asset('/count-objects/spy-glass.png') },
  { id: 'tennis',       label: 'Tennis',        src: asset('/count-objects/tennis.png') },
  { id: 'beefeater',    label: 'Beefeater',     src: asset('/count-objects/british-guy.png') },
];

type Difficulty = 'rookie' | 'master';

const DIFFICULTY_CONFIG = {
  rookie: { cols: 5, rows: 4, pairsPerObject: 1, label: 'Rookie', emoji: '⭐', color: '#22c55e', desc: '5×4 grid · 10 pairs' },
  master: { cols: 10, rows: 10, pairsPerObject: 2, label: 'Master', emoji: '🔥', color: '#ef4444', desc: '10×10 grid · 50 pairs' },
};

type Card = {
  uid: string;
  objectId: string;
  src: string;
  label: string;
  flipped: boolean;
  matched: boolean;
};

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildDeck(difficulty: Difficulty): Card[] {
  const pairs: Array<{ obj: typeof ALL_OBJECTS[0]; pairIdx: number }> = [];

  if (difficulty === 'rookie') {
    // Pick 10 random objects, 1 pair each = 20 cards
    const chosen = shuffle(ALL_OBJECTS).slice(0, 10);
    for (const obj of chosen) pairs.push({ obj, pairIdx: 0 });
  } else {
    // 20 objects × 2 pairs = 40, then 10 random objects get a 3rd pair = 50 pairs total
    for (const obj of ALL_OBJECTS) {
      pairs.push({ obj, pairIdx: 0 });
      pairs.push({ obj, pairIdx: 1 });
    }
    const extra = shuffle(ALL_OBJECTS).slice(0, 10);
    for (const obj of extra) pairs.push({ obj, pairIdx: 2 });
  }

  const cards: Card[] = [];
  for (const { obj, pairIdx } of pairs) {
    // uid must be unique per card; objectId is just obj.id so any two cards
    // showing the same image always count as a match regardless of which
    // "copy" of the pair they belong to.
    cards.push({ uid: `${obj.id}-${pairIdx}-a`, objectId: obj.id, src: obj.src, label: obj.label, flipped: false, matched: false });
    cards.push({ uid: `${obj.id}-${pairIdx}-b`, objectId: obj.id, src: obj.src, label: obj.label, flipped: false, matched: false });
  }

  return shuffle(cards);
}

function formatTime(s: number) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

export function MatchGame({ onComplete }: { onComplete?: () => void } = {}) {
  const { user, openAuthModal } = useAuth();
  const { saveScore, saving, saved, reset: resetScore } = useScore('match-game');

  const [phase, setPhase] = useState<'select' | 'playing' | 'win'>('select');
  const [difficulty, setDifficulty] = useState<Difficulty>('rookie');
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedUids, setFlippedUids] = useState<string[]>([]);
  const [moves, setMoves] = useState(0);
  const [matchedCount, setMatchedCount] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [blocking, setBlocking] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const totalPairs = (DIFFICULTY_CONFIG[difficulty].cols * DIFFICULTY_CONFIG[difficulty].rows) / 2;

  // Save score on win: faster = higher. master difficulty gets a 2× bonus.
  useEffect(() => {
    if (phase === 'win' && seconds > 0) {
      const base = Math.max(1, Math.round(60000 / Math.max(1, seconds)));
      const final = difficulty === 'master' ? base * 2 : base;
      saveScore(final);
    }
  }, [phase, seconds, difficulty, saveScore]);

  function startGame(diff: Difficulty) {
    resetScore();
    setDifficulty(diff);
    setCards(buildDeck(diff));
    setFlippedUids([]);
    setMoves(0);
    setMatchedCount(0);
    setSeconds(0);
    setBlocking(false);
    setPhase('playing');
  }

  useEffect(() => {
    if (phase === 'playing') {
      timerRef.current = setInterval(() => setSeconds(s => s + 1), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [phase]);

  const flipCard = useCallback((uid: string) => {
    if (blocking) return;
    const card = cards.find(c => c.uid === uid);
    if (!card || card.flipped || card.matched) return;
    if (flippedUids.includes(uid)) return;

    const newFlipped = [...flippedUids, uid];

    if (newFlipped.length === 1) {
      setCards(prev => prev.map(c => c.uid === uid ? { ...c, flipped: true } : c));
      setFlippedUids(newFlipped);
      return;
    }

    // Second card flipped
    setCards(prev => prev.map(c => c.uid === uid ? { ...c, flipped: true } : c));
    setMoves(m => m + 1);

    const firstCard = cards.find(c => c.uid === newFlipped[0])!;
    const secondCard = cards.find(c => c.uid === uid)!;

    if (firstCard.objectId === secondCard.objectId) {
      // Match!
      setTimeout(() => {
        setCards(prev => prev.map(c =>
          c.uid === newFlipped[0] || c.uid === uid ? { ...c, matched: true } : c
        ));
        setFlippedUids([]);
        setMatchedCount(m => {
          const next = m + 1;
          if (next === totalPairs) {
            setTimeout(() => {
              burstFinale();
              setPhase('win');
              onComplete?.();
            }, 400);
          }
          return next;
        });
      }, 600);
    } else {
      // No match — flip back
      setBlocking(true);
      setTimeout(() => {
        setCards(prev => prev.map(c =>
          c.uid === newFlipped[0] || c.uid === uid ? { ...c, flipped: false } : c
        ));
        setFlippedUids([]);
        setBlocking(false);
      }, 1000);
    }
  }, [blocking, cards, flippedUids, totalPairs]);

  const cfg = DIFFICULTY_CONFIG[difficulty];

  // ─── Select screen ───────────────────────────────────────────────
  if (phase === 'select') {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-8 px-4">
        <div className="text-center">
          <div className="mb-2 text-5xl">🃏</div>
          <h1 className="text-3xl font-extrabold">Match Mania!</h1>
          <p className="mt-1 text-sm text-ink/60">Flip cards to find matching pairs. How fast can you clear the board?</p>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row">
          {(['rookie', 'master'] as Difficulty[]).map(diff => {
            const d = DIFFICULTY_CONFIG[diff];
            return (
              <button
                key={diff}
                onClick={() => startGame(diff)}
                className="flex flex-col items-center gap-3 rounded-[2rem] border-[3px] border-ink px-8 py-6 text-left transition-transform hover:-translate-y-1 active:translate-y-0"
                style={{ background: d.color + '22', borderBottomWidth: 6, borderRightWidth: 5, minWidth: '13rem' }}
              >
                <span className="text-4xl">{d.emoji}</span>
                <div>
                  <div className="text-lg font-extrabold">{d.label}</div>
                  <div className="mt-0.5 text-xs text-ink/60">{d.desc}</div>
                </div>
                <span
                  className="mt-1 rounded-full border-[3px] border-ink px-6 py-1 text-sm font-extrabold"
                  style={{ background: d.color, borderBottomWidth: 5, borderRightWidth: 4 }}
                >
                  Play →
                </span>
              </button>
            );
          })}
        </div>

        <p className="text-center text-xs text-ink/40 max-w-xs">
          Master mode: 100 cards, 50 pairs — how fast can you clear the whole board?
        </p>
      </div>
    );
  }

  // ─── Win screen ────────────────────────────────────────────────
  if (phase === 'win') {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-6 px-4 text-center">
        <div className="text-6xl">🎉</div>
        <h2 className="text-3xl font-extrabold">You matched them all!</h2>
        <div className="flex gap-6 text-sm font-bold text-ink/70">
          <span>⏱ {formatTime(seconds)}</span>
          <span>🃏 {moves} moves</span>
          <span>{cfg.emoji} {cfg.label}</span>
        </div>
        {/* Leaderboard */}
        <div className="w-full max-w-sm rounded-[2rem] border-[3px] border-ink p-4 text-left" style={{ background: "#1a1a2e", borderBottomWidth: 6, borderRightWidth: 5 }}>
          <div className="text-[0.6rem] font-extrabold uppercase tracking-[0.2em] text-gray-500 mb-1">🏆 Top Scores — Match Game</div>
          {user ? (
            <p className="text-xs font-bold mb-2" style={{ color: saving ? "#9ca3af" : saved ? "#4ade80" : "transparent" }}>
              {saving ? "Saving score…" : "✓ Score saved to leaderboard"}
            </p>
          ) : (
            <button onClick={() => openAuthModal("sign-up")} className="text-xs font-bold text-yellow-400 underline hover:text-yellow-300 mb-2 block">
              🏆 Sign in to save your score
            </button>
          )}
          <Leaderboard gameSlug="match-game" limit={5} theme="dark" />
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            onClick={() => startGame(difficulty)}
            className="rounded-full border-[3px] border-ink px-8 py-2 text-sm font-extrabold transition-transform hover:-translate-y-0.5"
            style={{ background: cfg.color, borderBottomWidth: 5, borderRightWidth: 4 }}
          >
            Play Again
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

  // ─── Playing ─────────────────────────────────────────────────────
  const cardSize = difficulty === 'rookie' ? 80 : 60;

  return (
    <div className="flex flex-col items-center gap-4 px-2 pb-6">
      {/* HUD */}
      <div className="flex w-full max-w-2xl items-center justify-between rounded-[1.5rem] border-[3px] border-ink px-4 py-2"
        style={{ background: cfg.color + '22', borderBottomWidth: 5, borderRightWidth: 4 }}>
        <div className="flex items-center gap-1.5 text-sm font-extrabold">
          <span>{cfg.emoji}</span>
          <span>{cfg.label}</span>
        </div>
        <div className="flex gap-4 text-sm font-bold text-ink/70">
          <span>⏱ {formatTime(seconds)}</span>
          <span>🃏 {moves}</span>
          <span>✅ {matchedCount}/{totalPairs}</span>
        </div>
        <button
          onClick={() => setPhase('select')}
          className="rounded-full border-[2px] border-ink px-3 py-0.5 text-xs font-bold"
          style={{ background: '#fff', borderBottomWidth: 3, borderRightWidth: 2 }}
        >
          ← Quit
        </button>
      </div>

      {/* Grid */}
      <div
        className="grid"
        style={{
          gridTemplateColumns: `repeat(${cfg.cols}, ${cardSize}px)`,
          gap: difficulty === 'rookie' ? '8px' : '4px',
        }}
      >
        {cards.map(card => (
          <CardTile
            key={card.uid}
            card={card}
            size={cardSize}
            onClick={() => flipCard(card.uid)}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Individual card ─────────────────────────────────────────────────
type CardTileProps = { card: Card; size: number; onClick: () => void };

function CardTile({ card, size, onClick }: CardTileProps) {
  const isVisible = card.flipped || card.matched;

  return (
    <div
      className="relative cursor-pointer select-none"
      style={{ width: size, height: size, perspective: '600px' }}
      onClick={card.matched ? undefined : onClick}
    >
      <motion.div
        className="relative w-full h-full"
        style={{ transformStyle: 'preserve-3d' }}
        animate={{ rotateY: isVisible ? 180 : 0 }}
        transition={{ duration: 0.35, ease: 'easeInOut' }}
      >
        {/* Back */}
        <div
          className="absolute inset-0 flex items-center justify-center rounded-xl border-[2px] border-ink"
          style={{
            backfaceVisibility: 'hidden',
            background: 'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)',
            borderBottomWidth: 3,
            borderRightWidth: 3,
          }}
        >
          <span style={{ fontSize: size * 0.35 }}>🎴</span>
        </div>

        {/* Front */}
        <div
          className="absolute inset-0 flex items-center justify-center rounded-xl border-[2px] border-ink"
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            background: card.matched ? '#dcfce7' : '#fff',
            borderBottomWidth: 3,
            borderRightWidth: 3,
            padding: size * 0.1,
          }}
        >
          <img
            src={card.src}
            alt={card.label}
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          />
        </div>
      </motion.div>
    </div>
  );
}
