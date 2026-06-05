import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { burstFinale } from '@/game/confetti';
import { asset } from '@/lib/asset';

const ALL_OBJECTS = [
  { id: 'elephant',   label: 'Elephant',   src: asset('/objects/elephant.svg') },
  { id: 'fish',       label: 'Fish',        src: asset('/objects/fish.svg') },
  { id: 'fox',        label: 'Fox',         src: asset('/objects/fox.svg') },
  { id: 'kangaroo',   label: 'Kangaroo',    src: asset('/objects/kangaroo.svg') },
  { id: 'octopus',    label: 'Octopus',     src: asset('/objects/octopus.svg') },
  { id: 'penguin',    label: 'Penguin',     src: asset('/objects/penguin.svg') },
  { id: 'sandcastle', label: 'Sandcastle',  src: asset('/objects/sandcastle.svg') },
  { id: 'sombrero',   label: 'Sombrero',    src: asset('/objects/sombrero.svg') },
  { id: 'trombone',   label: 'Trombone',    src: asset('/objects/trombone.svg') },
  { id: 'ukulele',    label: 'Ukulele',     src: asset('/objects/ukulele.svg') },
];

type Difficulty = 'rookie' | 'master';

const DIFFICULTY_CONFIG = {
  rookie: { cols: 5, rows: 4, pairsPerObject: 1, label: 'Rookie', emoji: '⭐', color: '#22c55e', desc: '5×4 grid · 10 pairs' },
  master: { cols: 10, rows: 10, pairsPerObject: 5, label: 'Master', emoji: '🔥', color: '#ef4444', desc: '10×10 grid · 50 pairs' },
};

type Card = {
  uid: string;
  objectId: string;
  src: string;
  label: string;
  flipped: boolean;
  matched: boolean;
};

function buildDeck(difficulty: Difficulty): Card[] {
  const cfg = DIFFICULTY_CONFIG[difficulty];
  const totalCards = cfg.cols * cfg.rows;
  const totalPairs = totalCards / 2;
  const objects = ALL_OBJECTS;

  const cards: Card[] = [];
  for (let p = 0; p < cfg.pairsPerObject; p++) {
    for (const obj of objects) {
      cards.push({ uid: `${obj.id}-${p}-a`, objectId: obj.id, src: obj.src, label: obj.label, flipped: false, matched: false });
      cards.push({ uid: `${obj.id}-${p}-b`, objectId: obj.id, src: obj.src, label: obj.label, flipped: false, matched: false });
    }
  }
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cards[i], cards[j]] = [cards[j], cards[i]];
  }
  return cards;
}

function formatTime(s: number) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

export function MatchGame() {
  const [phase, setPhase] = useState<'select' | 'playing' | 'win'>('select');
  const [difficulty, setDifficulty] = useState<Difficulty>('rookie');
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedUids, setFlippedUids] = useState<string[]>([]);
  const [moves, setMoves] = useState(0);
  const [matchedCount, setMatchedCount] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [blocking, setBlocking] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const totalPairs = difficulty === 'rookie' ? 10 : 50;

  function startGame(diff: Difficulty) {
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
          Master mode has 5 copies of each object — find all 5 pairs of every image to win!
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
            style={{ width: '100%', height: '100%', objectFit: 'contain', mixBlendMode: 'multiply' }}
          />
        </div>
      </motion.div>
    </div>
  );
}
