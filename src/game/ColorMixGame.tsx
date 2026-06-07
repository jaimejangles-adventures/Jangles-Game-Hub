import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from '@tanstack/react-router';
import { burstCorrect, burstFinale } from '@/game/confetti';
import { playCorrectExclamation, playIncorrectExclamation } from '@/game/exclamations';
import { asset } from '@/lib/asset';

type Color = { name: string; hex: string };
type Pair  = { a: Color; b: Color };

type PageMix = {
  file: string;
  result: Color;
  pair: Pair;
  fact: string;
  arrow: { x: number; y: number }; // % position of the target colour in the image
};

const RED:       Color = { name: 'Red',      hex: '#FF3B3B' };
const YELLOW:    Color = { name: 'Yellow',   hex: '#FFD600' };
const BLUE:      Color = { name: 'Blue',     hex: '#3B8EFF' };
const WHITE:     Color = { name: 'White',    hex: '#E0E0E0' };
const GREEN:     Color = { name: 'Green',    hex: '#22C55E' };

const ORANGE:    Color = { name: 'Orange',   hex: '#FF8C00' };
const MIX_GREEN: Color = { name: 'Green',    hex: '#22C55E' };
const PURPLE:    Color = { name: 'Purple',   hex: '#9333EA' };
const PINK:      Color = { name: 'Pink',     hex: '#FF6EB4' };
const SKY_BLUE:  Color = { name: 'Sky Blue', hex: '#7DD3FC' };
const TEAL:      Color = { name: 'Teal',     hex: '#14B8A6' };

const ALL_RESULTS: Color[] = [ORANGE, MIX_GREEN, PURPLE, PINK, SKY_BLUE, TEAL];

const PAGE_MIXES: PageMix[] = [
  { file: 'page-11.png', result: PURPLE,    pair: { a: RED,  b: BLUE   }, fact: 'Hola! Purple streets of Spain!',       arrow: { x: 12, y: 28 } },
  { file: '6.png',       result: PURPLE,    pair: { a: RED,  b: BLUE   }, fact: 'Beautiful purple house in Barbados!',   arrow: { x: 68, y: 22 } },
  { file: 'page-4.png',  result: ORANGE,    pair: { a: RED,  b: YELLOW }, fact: 'Fiesta! Warm mariachi music in Mexico!', arrow: { x: 72, y: 48 } },
  { file: 'page-12.png', result: ORANGE,    pair: { a: RED,  b: YELLOW }, fact: 'Bonjour! Orange balloon over Paris!',    arrow: { x: 68, y: 18 } },
  { file: 'page-5.png',  result: TEAL,      pair: { a: BLUE, b: GREEN  }, fact: "Jamaica's turquoise waters!",           arrow: { x: 82, y: 38 } },
  { file: '18.png',      result: MIX_GREEN, pair: { a: BLUE, b: YELLOW }, fact: 'Safari in Kenya!',                      arrow: { x: 82, y: 25 } },
  { file: 'page-15.png', result: MIX_GREEN, pair: { a: BLUE, b: YELLOW }, fact: 'Fresh spices of Sri Lanka!',            arrow: { x: 78, y: 36 } },
  { file: '9.png',       result: SKY_BLUE,  pair: { a: BLUE, b: WHITE  }, fact: 'Icy blue Antarctica!',                  arrow: { x: 22, y: 38 } },
  { file: 'page-19.png', result: PINK,      pair: { a: RED,  b: WHITE  }, fact: "Cape Town's rainbow beach!",            arrow: { x: 45, y: 30 } },
  { file: 'page-24.png', result: SKY_BLUE,  pair: { a: BLUE, b: WHITE  }, fact: 'Blue courts in Australia!',             arrow: { x: 50, y: 48 } },
];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }

function buildChoices(correct: Color): Color[] {
  const wrong = ALL_RESULTS.filter(c => c.name !== correct.name);
  return shuffle([correct, ...shuffle(wrong).slice(0, 3)]);
}

type Phase = 'question' | 'correct' | 'wrong' | 'done';

const CORRECT_MSGS = ['Brilliant! 🎉', 'Perfect mix! ✨', 'You got it! 🌟', 'Amazing! 🎨', 'Nicely done! 💫'];
const WRONG_MSGS   = ['Not quite!', 'Try again!', 'Look carefully!', 'Hmm, not that one!'];

export function ColorMixGame() {
  const [queue, setQueue]         = useState<PageMix[]>(() => shuffle([...PAGE_MIXES]));
  const [index, setIndex]         = useState(0);
  const [phase, setPhase]         = useState<Phase>('question');
  const [score, setScore]         = useState(0);
  const [msg, setMsg]             = useState('');
  const [choices, setChoices]     = useState<Color[]>(() => buildChoices(PAGE_MIXES[0].result));
  const [wrongName, setWrongName] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const current = queue[index];
  const total   = queue.length;

  useEffect(() => {
    if (!current) return;
    setChoices(buildChoices(current.result));
    setWrongName(null);
  }, [index, current]);

  function handleChoice(color: Color) {
    if (phase !== 'question') return;
    if (timer.current) clearTimeout(timer.current);

    if (color.name === current.result.name) {
      setPhase('correct');
      setMsg(pick(CORRECT_MSGS));
      setScore(s => s + 1);
      playCorrectExclamation();
      burstCorrect();
      timer.current = setTimeout(() => {
        if (index + 1 >= total) {
          setPhase('done');
          burstFinale();
        } else {
          setIndex(i => i + 1);
          setPhase('question');
        }
      }, 1600);
    } else {
      setPhase('wrong');
      setWrongName(color.name);
      setMsg(pick(WRONG_MSGS));
      playIncorrectExclamation();
      timer.current = setTimeout(() => {
        setPhase('question');
        setWrongName(null);
      }, 900);
    }
  }

  function restart() {
    setQueue(shuffle([...PAGE_MIXES]));
    setIndex(0);
    setScore(0);
    setPhase('question');
    setWrongName(null);
  }

  // ── Done screen ────────────────────────────────────────────────────────────
  if (phase === 'done') {
    return (
      <div className="flex h-full items-center justify-center p-4"
        style={{ background: 'linear-gradient(135deg, #FFF7ED 0%, #FDF4FF 100%)' }}>
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          className="flex flex-col items-center gap-5 rounded-[2.5rem] border-[4px] border-ink bg-white px-10 py-8 text-center"
          style={{ borderBottomWidth: 8, borderRightWidth: 6 }}>
          <div className="text-6xl">🎨</div>
          <h2 className="text-2xl font-extrabold">Colour Master!</h2>
          <p className="text-base text-ink/70">
            You scored <span className="font-extrabold text-ink">{score}</span> out of{' '}
            <span className="font-extrabold">{total}</span>
          </p>
          <div className="flex gap-1">
            {Array.from({ length: total }).map((_, i) => (
              <span key={i} className="text-lg">{i < score ? '⭐' : '☆'}</span>
            ))}
          </div>
          <div className="flex gap-3">
            <button onClick={restart}
              className="rounded-2xl border-[3px] border-ink bg-yellow-400 px-6 py-2.5 font-extrabold text-base"
              style={{ borderBottomWidth: 5, borderRightWidth: 4 }}>Play Again</button>
            <Link to="/"
              className="rounded-2xl border-[3px] border-ink bg-white px-6 py-2.5 font-extrabold text-base"
              style={{ borderBottomWidth: 5, borderRightWidth: 4 }}>Home</Link>
          </div>
        </motion.div>
      </div>
    );
  }

  const pageUrl = asset(`/count-backgrounds/${current.file}`);

  // ── Game screen ────────────────────────────────────────────────────────────
  return (
    // h-full fills the portal-shell's flex-1 content area exactly — no scroll
    <div className="relative h-full overflow-hidden">

      {/* Full-bleed book page — behind everything */}
      <AnimatePresence mode="wait">
        <motion.img
          key={current.file}
          src={pageUrl}
          alt="Book page"
          className="absolute inset-0 h-full w-full object-cover"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        />
      </AnimatePresence>

      {/* Colour arrow — points at the target colour on the page */}
      <AnimatePresence>
        {phase === 'question' && (
          <ColourArrow
            key={current.file}
            x={current.arrow.x}
            y={current.arrow.y}
            colour={current.result.hex}
          />
        )}
      </AnimatePresence>

      {/* Top bar — absolutely anchored to top */}
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-3 pt-3">
        <Link to="/"
          className="rounded-xl border-[2px] border-ink bg-white/90 px-3 py-1 text-sm font-bold backdrop-blur-sm"
          style={{ borderBottomWidth: 3, borderRightWidth: 3 }}>
          ← Home
        </Link>
        <div className="flex items-center gap-2 rounded-xl border-[2px] border-ink bg-white/90 px-3 py-1 backdrop-blur-sm"
          style={{ borderBottomWidth: 3, borderRightWidth: 3 }}>
          <span className="text-sm font-extrabold">⭐ {score}</span>
          <span className="text-ink/40 text-sm">·</span>
          <span className="text-sm font-bold text-ink/60">{index + 1}/{total}</span>
        </div>
      </div>

      {/* Bottom sheet — absolutely anchored to bottom, compact */}
      <div className="absolute bottom-0 left-0 right-0 z-10 rounded-t-[1.75rem] border-t-[3px] border-x-[3px] border-ink px-4 pb-4 pt-4"
        style={{ background: 'rgba(255,251,240,0.97)', backdropFilter: 'blur(10px)' }}>

        {/* Progress bar */}
        <div className="mb-3 w-full rounded-full border-[2px] border-ink bg-white overflow-hidden h-2">
          <motion.div className="h-full rounded-full" style={{ background: '#FBBF24' }}
            animate={{ width: `${(index / total) * 100}%` }} transition={{ duration: 0.4 }} />
        </div>

        {/* Mixing pill */}
        <div className="relative mb-3 flex items-center justify-center gap-2 rounded-[1.75rem] border-[3px] border-ink bg-white px-4 py-3"
          style={{ borderBottomWidth: 5, borderRightWidth: 4 }}>
          <PaintPot color={current.pair.a} />
          <span className="text-2xl font-black text-ink select-none">+</span>
          <PaintPot color={current.pair.b} />
          <span className="text-2xl font-black text-ink select-none">=</span>
          <AnimatePresence mode="wait">
            {phase === 'correct' ? (
              <motion.div key="result"
                initial={{ scale: 0, rotate: -12 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 500, damping: 20 }}>
                <PaintPot color={current.result} glow />
              </motion.div>
            ) : (
              <motion.div key="question" initial={{ scale: 0 }} animate={{ scale: 1 }}>
                <QuestionPot />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Feedback badge — floats over pill, no layout shift */}
          <AnimatePresence>
            {(phase === 'correct' || phase === 'wrong') && (
              <motion.div
                key={msg}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="absolute -top-4 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border-[2px] border-ink px-4 py-1 text-sm font-extrabold shadow-md"
                style={{
                  background: phase === 'correct' ? '#4ADE80' : '#FCA5A5',
                  borderBottomWidth: 3,
                  borderRightWidth: 3,
                }}>
                {msg}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Colour choices — 2×2 grid */}
        <div className="grid grid-cols-2 gap-2">
          {choices.map((color) => {
            const isWrong   = wrongName === color.name;
            const isCorrect = phase === 'correct' && color.name === current.result.name;
            const dimmed    = (phase === 'wrong' && !isWrong) || (phase === 'correct' && !isCorrect);
            return (
              <motion.button
                key={color.name}
                onClick={() => handleChoice(color)}
                disabled={phase !== 'question'}
                animate={isWrong ? { x: [0, -8, 8, -6, 6, 0] } : {}}
                transition={isWrong ? { duration: 0.35 } : {}}
                whileHover={{ scale: phase === 'question' ? 1.02 : 1 }}
                whileTap={{ scale: phase === 'question' ? 0.97 : 1 }}
                className="flex items-center gap-3 rounded-[1.25rem] border-[3px] border-ink px-3 py-2.5 font-extrabold text-sm text-left transition-opacity"
                style={{
                  background: isCorrect ? '#DCFCE7' : isWrong ? '#FEE2E2' : 'white',
                  borderBottomWidth: 4,
                  borderRightWidth: 3,
                  opacity: dimmed ? 0.38 : 1,
                }}
              >
                <div className="h-10 w-10 flex-shrink-0 rounded-xl border-[2px] border-ink shadow-sm"
                  style={{ background: color.hex }} />
                <span className="text-base font-extrabold">{color.name}</span>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Colour arrow — points at the target colour on the page ────────────────────
function ColourArrow({ x, y, colour }: { x: number; y: number; colour: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.4 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.4 }}
      transition={{ type: 'spring', stiffness: 400, damping: 18 }}
      style={{
        position: 'absolute',
        left: `${x}%`,
        top: `${y}%`,
        // tip of arrow sits at the coordinate
        transform: 'translate(-50%, calc(-100% - 4px))',
        zIndex: 9,
        pointerEvents: 'none',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.55))',
      }}
    >
      {/* Bouncing group: shaft + head together */}
      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 0.9, ease: 'easeInOut' }}
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
      >
        {/* Shaft */}
        <div style={{
          width: 10,
          height: 40,
          background: colour,
          border: '2.5px solid #1a1a1a',
          borderBottom: 'none',
          borderRadius: '5px 5px 0 0',
          outline: `1px solid ${colour}`,
        }} />
        {/* Arrowhead — black outline via stacked triangles */}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {/* Outline triangle */}
          <div style={{
            position: 'absolute',
            width: 0, height: 0,
            borderLeft: '17px solid transparent',
            borderRight: '17px solid transparent',
            borderTop: '24px solid #1a1a1a',
            top: 0, left: -17,
          }} />
          {/* Colour fill triangle */}
          <div style={{
            position: 'absolute',
            width: 0, height: 0,
            borderLeft: '13px solid transparent',
            borderRight: '13px solid transparent',
            borderTop: `20px solid ${colour}`,
            top: 1, left: -13,
          }} />
        </div>
      </motion.div>

      {/* Pulsing ring — stays fixed at the tip */}
      <div style={{ position: 'relative', width: 0, height: 0, marginTop: 24 }}>
        <motion.div
          animate={{ scale: [0.5, 2.0, 0.5], opacity: [0.9, 0, 0.9] }}
          transition={{ repeat: Infinity, duration: 1.1, ease: 'easeOut' }}
          style={{
            position: 'absolute',
            width: 44,
            height: 44,
            borderRadius: '50%',
            border: `3px solid ${colour}`,
            background: `${colour}33`,
            top: -22,
            left: -22,
            boxShadow: `0 0 12px 4px ${colour}66`,
          }}
        />
      </div>
    </motion.div>
  );
}

// ── Paint pot component ────────────────────────────────────────────────────────
function PaintPot({ color, glow }: { color: Color; glow?: boolean }) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <motion.div
        animate={glow ? { scale: [1, 1.08, 1] } : {}}
        transition={glow ? { repeat: Infinity, duration: 1.2 } : {}}
        className="relative flex items-center justify-center overflow-hidden"
        style={{
          width: 48,
          height: 52,
          background: color.hex,
          borderRadius: '6px 6px 14px 14px',
          border: '2.5px solid #1a1a1a',
          borderBottomWidth: 4,
          borderRightWidth: 3,
          boxShadow: glow ? `0 0 16px 6px ${color.hex}99` : undefined,
        }}
      >
        {/* handle */}
        <div style={{
          position: 'absolute', top: -8, left: '50%', transform: 'translateX(-50%)',
          width: 22, height: 9, borderRadius: '8px 8px 0 0',
          border: '2px solid #1a1a1a', borderBottom: 'none',
          background: 'transparent',
        }} />
        {/* gloss */}
        <div style={{
          position: 'absolute', top: 5, left: 4, width: 7, height: 22,
          borderRadius: 4, background: 'rgba(255,255,255,0.28)',
        }} />
      </motion.div>
      <span style={{
        fontSize: '0.6rem', fontWeight: 800, textAlign: 'center',
        lineHeight: 1.2, maxWidth: 52, color: '#1a1a1a',
      }}>{color.name}</span>
    </div>
  );
}

// ── Question pot ───────────────────────────────────────────────────────────────
function QuestionPot() {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <motion.div
        animate={{ scale: [1, 1.06, 1] }}
        transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
        className="relative flex items-center justify-center"
        style={{
          width: 48,
          height: 52,
          borderRadius: '6px 6px 14px 14px',
          border: '2.5px solid #1a1a1a',
          borderBottomWidth: 4,
          borderRightWidth: 3,
          background: 'repeating-linear-gradient(45deg,#f3f4f6 0px,#f3f4f6 5px,#e5e7eb 5px,#e5e7eb 10px)',
        }}
      >
        <div style={{
          position: 'absolute', top: -8, left: '50%', transform: 'translateX(-50%)',
          width: 22, height: 9, borderRadius: '8px 8px 0 0',
          border: '2px solid #1a1a1a', borderBottom: 'none',
          background: 'transparent',
        }} />
        <span style={{ fontSize: '1.3rem', fontWeight: 900, color: 'rgba(26,26,26,0.35)', userSelect: 'none' }}>?</span>
      </motion.div>
      <span style={{ fontSize: '0.6rem', fontWeight: 800, color: 'rgba(26,26,26,0.35)' }}>???</span>
    </div>
  );
}
