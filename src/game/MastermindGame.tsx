import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { burstFinale } from '@/game/confetti';
import { asset } from '@/lib/asset';
import { cn } from '@/lib/utils';

const OBJECTS = [
  { id: 'elephant',   label: 'Elephant',     src: asset('/objects/wt-elephant.png'),    country: 'Kenya' },
  { id: 'eiffel',     label: 'Eiffel Tower', src: asset('/objects/wt-eiffel.png'),      country: 'France' },
  { id: 'korea-mask', label: 'Korea Mask',   src: asset('/objects/wt-korea-mask.png'),  country: 'S. Korea' },
  { id: 'penguin',    label: 'Penguin',      src: asset('/objects/wt-penguin.png'),     country: 'S. Africa' },
  { id: 'tomato',     label: 'Tomato',       src: asset('/objects/wt-tomato.png'),      country: 'Spain' },
  { id: 'steel-drum', label: 'Steel Drum',   src: asset('/objects/wt-steel-drum.png'),  country: 'Jamaica' },
  { id: 'sombrero',   label: 'Sombrero',     src: asset('/objects/wt-sombrero.png'),    country: 'Mexico' },
  { id: 'pan-flute',  label: 'Pan Flute',    src: asset('/objects/wt-pan-flute.png'),   country: 'Peru' },
  { id: 'sitar',      label: 'Sitar',        src: asset('/objects/wt-sitar.png'),       country: 'Sri Lanka' },
  { id: 'skiis',      label: 'Skis',         src: asset('/objects/wt-skiis.png'),       country: 'Switzerland' },
];

const BG_PAGES = [3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23].map(
  n => asset(`/book3-nt/page-${String(n).padStart(2,'0')}.png`)
);

const CODE_LENGTH = 4;
type Difficulty = 'rookie' | 'master';
type GamePhase = 'select' | 'playing';
type GuessRow = { objects: string[]; black: number; white: number };

const DIFFICULTY = {
  rookie: { guesses: 10, showCountry: true,  label: 'Rookie', emoji: '⭐', color: '#22c55e', desc: '10 guesses + country hints' },
  master: { guesses: 8,  showCountry: false, label: 'Master', emoji: '🔥', color: '#ef4444', desc: '8 guesses, no hints' },
};

function pickBg() { return BG_PAGES[Math.floor(Math.random() * BG_PAGES.length)]; }
function generateSecret() {
  return [...OBJECTS].sort(() => Math.random() - 0.5).slice(0, CODE_LENGTH).map(o => o.id);
}
function calcFeedback(guess: string[], secret: string[]) {
  let black = 0;
  const gl: string[] = [], sl: string[] = [];
  for (let i = 0; i < CODE_LENGTH; i++) {
    if (guess[i] === secret[i]) black++;
    else { gl.push(guess[i]); sl.push(secret[i]); }
  }
  let white = 0;
  for (const g of gl) { const i = sl.indexOf(g); if (i !== -1) { white++; sl.splice(i, 1); } }
  return { black, white };
}

function PegGrid({ black, white }: { black: number; white: number }) {
  return (
    <div className="grid grid-cols-2 gap-[2px] w-[22px] h-[22px] shrink-0">
      {Array.from({ length: 4 }, (_, i) => {
        const type = i < black ? 'black' : i < black + white ? 'white' : 'empty';
        return <div key={i} className="rounded-full border" style={{
          background: type === 'black' ? '#22c55e' : type === 'white' ? '#fbbf24' : 'transparent',
          borderColor: type === 'black' ? '#16a34a' : type === 'white' ? '#d97706' : 'rgba(255,255,255,0.3)',
        }} />;
      })}
    </div>
  );
}

// ── Select screen ─────────────────────────────────────────────────────────────

function SelectScreen({ onSelect }: { onSelect: (d: Difficulty) => void }) {
  const bg = pickBg();
  return (
    <div className="flex-1 flex flex-col min-h-0 items-center justify-center px-5 py-8 gap-6"
      style={{ backgroundImage: `linear-gradient(rgba(20,8,50,0.75), rgba(20,8,50,0.75)), url(${bg})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
      <div className="text-center">
        <div className="text-5xl mb-2">🔐</div>
        <h1 className="text-3xl font-extrabold text-white drop-shadow-lg">Crack the Code!</h1>
        <p className="text-sm text-white/75 mt-1 font-semibold">Jaime hid 4 world objects — can you find them?</p>
      </div>
      <div className="flex flex-col gap-3 w-full max-w-sm">
        {(['rookie', 'master'] as Difficulty[]).map(d => {
          const cfg = DIFFICULTY[d];
          return (
            <motion.button key={d} whileTap={{ scale: 0.96 }} onClick={() => onSelect(d)}
              className="w-full rounded-2xl border-[3px] border-[#1e1b4b] bg-white p-4 shadow-[4px_5px_0_#1e1b4b] text-left flex items-center gap-4 cursor-pointer hover:brightness-95">
              <div className="w-14 h-14 rounded-xl flex items-center justify-center text-3xl shrink-0 border-[3px] border-[#1e1b4b]" style={{ background: cfg.color }}>{cfg.emoji}</div>
              <div>
                <div className="text-xl font-extrabold text-ink">{cfg.label}</div>
                <div className="text-xs text-ink/55 font-semibold mt-0.5">{cfg.desc}</div>
              </div>
            </motion.button>
          );
        })}
      </div>
      <div className="flex gap-4">
        {[{c:'#22c55e',b:'#16a34a',t:'Right spot'},{c:'#fbbf24',b:'#d97706',t:'Wrong spot'},{c:'transparent',b:'rgba(255,255,255,0.5)',t:'Not in code'}].map(p => (
          <div key={p.t} className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded-full border-2 shrink-0" style={{ background: p.c, borderColor: p.b }} />
            <span className="text-[11px] font-bold text-white/90">{p.t}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Game ──────────────────────────────────────────────────────────────────────

export function MastermindGame() {
  const [phase, setPhase] = useState<GamePhase>('select');
  const [difficulty, setDifficulty] = useState<Difficulty>('rookie');
  const [bg] = useState(pickBg);
  const [secret, setSecret] = useState(generateSecret);
  const [guesses, setGuesses] = useState<GuessRow[]>([]);
  const [current, setCurrent] = useState<(string | null)[]>([null, null, null, null]);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);

  const maxGuesses = DIFFICULTY[difficulty].guesses;
  const showCountry = DIFFICULTY[difficulty].showCountry;
  const cfg = DIFFICULTY[difficulty];

  const startGame = useCallback((d: Difficulty) => {
    setDifficulty(d); setSecret(generateSecret()); setGuesses([]);
    setCurrent([null,null,null,null]); setGameOver(false); setWon(false); setPhase('playing');
  }, []);

  const resetGame = useCallback(() => {
    setSecret(generateSecret()); setGuesses([]);
    setCurrent([null,null,null,null]); setGameOver(false); setWon(false);
  }, []);

  const addToGuess = useCallback((id: string) => {
    if (gameOver) return;
    setCurrent(prev => {
      if (prev.includes(id)) return prev; // no duplicates
      const i = prev.findIndex(s => s === null);
      if (i === -1) return prev;
      const next = [...prev]; next[i] = id; return next;
    });
  }, [gameOver]);

  const removeFromGuess = useCallback((i: number) => {
    if (gameOver) return;
    setCurrent(prev => { const next = [...prev]; next[i] = null; return next; });
  }, [gameOver]);

  const submitGuess = useCallback(() => {
    if (gameOver || current.some(s => s === null)) return;
    const guess = current as string[];
    const { black, white } = calcFeedback(guess, secret);
    const next = [...guesses, { objects: guess, black, white }];
    setGuesses(next); setCurrent([null,null,null,null]);
    if (black === CODE_LENGTH) { setGameOver(true); setWon(true); burstFinale(); }
    else if (next.length >= maxGuesses) { setGameOver(true); }
  }, [gameOver, current, guesses, secret, maxGuesses]);

  if (phase === 'select') return <SelectScreen onSelect={startGame} />;

  const complete = current.every(s => s !== null);
  const attemptsLeft = maxGuesses - guesses.length;

  return (
    <div className="flex-1 flex flex-col min-h-0"
      style={{ backgroundImage: `linear-gradient(rgba(20,8,50,0.82), rgba(20,8,50,0.82)), url(${bg})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'local' }}>

      {/* ── Header ── */}
      <div className="flex items-center justify-between px-3 pt-2 pb-1 shrink-0">
        <button onClick={() => setPhase('select')}
          className="rounded-full bg-white/15 px-3 py-1 text-xs font-bold text-white hover:bg-white/25 cursor-pointer">
          ← Back
        </button>
        <div className="text-center leading-tight">
          <div className="text-sm font-extrabold text-white">🔐 Crack the Code!</div>
          <div className="text-[10px] font-bold" style={{ color: cfg.color }}>
            {cfg.emoji} {cfg.label}
            {!gameOver && <span className="text-white/60"> · {attemptsLeft} left</span>}
            {gameOver && won && <span className="text-white"> · 🎉 Cracked it!</span>}
            {gameOver && !won && <span className="text-white"> · Game over!</span>}
          </div>
        </div>
        <button onClick={resetGame}
          className="rounded-full bg-white/15 px-3 py-1 text-xs font-bold text-white hover:bg-white/25 cursor-pointer">
          New
        </button>
      </div>

      {/* ── Legend ── */}
      <div className="flex justify-center gap-3 shrink-0 pb-1">
        {[{c:'#22c55e',b:'#16a34a',t:'Right spot'},{c:'#fbbf24',b:'#d97706',t:'Wrong spot'},{c:'transparent',b:'rgba(255,255,255,0.35)',t:'Not in code'}].map(p => (
          <div key={p.t} className="flex items-center gap-1">
            <div className="w-2.5 h-2.5 rounded-full border shrink-0" style={{ background: p.c, borderColor: p.b }} />
            <span className="text-[9px] font-bold text-white/75">{p.t}</span>
          </div>
        ))}
      </div>

      {/* ── Main area: board left, guess+palette centred together ── */}
      <div className="flex-1 flex min-h-0 justify-center gap-3 px-2 pb-2">

        {/* ── LEFT: guess history ── */}
        <div className="w-[232px] flex flex-col justify-around shrink-0 py-1">
          {Array.from({ length: maxGuesses }, (_, i) => {
            const row = guesses[i];
            const isActive = i === guesses.length && !gameOver;
            const isFuture = !row && !isActive;
            const slots: (string | null)[] = row ? row.objects : isActive ? current : [null,null,null,null];
            return (
              <motion.div key={i}
                initial={row ? { opacity: 0, x: -6 } : false}
                animate={{ opacity: 1, x: 0 }}
                className={cn('flex items-center gap-1 px-1 rounded-md', isFuture && 'opacity-25')}
              >
                <span className="text-[9px] font-extrabold text-white/40 w-3 text-right shrink-0">{i + 1}</span>
                <div className="flex gap-1 flex-1">
                  {slots.map((id, si) => {
                    const obj = id ? OBJECTS.find(o => o.id === id) : null;
                    return (
                      <div key={si} className={cn('w-[42px] h-[42px] rounded-md border-2 flex items-center justify-center shrink-0',
                        obj ? 'bg-white border-[#1e1b4b] shadow-[1px_1px_0_#1e1b4b]' : 'bg-white/12 border-dashed border-white/25')}>
                        {obj && <img src={obj.src} alt={obj.label} className="w-[30px] h-[30px] object-contain" />}
                      </div>
                    );
                  })}
                </div>
                {row
                  ? <PegGrid black={row.black} white={row.white} />
                  : <div className="grid grid-cols-2 gap-[2px] w-[22px] h-[22px] shrink-0">{[0,1,2,3].map(k => <div key={k} className="rounded-full border border-white/18" />)}</div>}
              </motion.div>
            );
          })}
        </div>

        {/* ── CENTRE: guess slots + palette side by side, vertically centred ── */}
        <div className="flex gap-2 items-center self-center shrink-0 ml-3">

          {/* Guess slots */}
          <div className="flex flex-col items-center gap-1">
            <span className="text-[8px] font-extrabold text-white/45 uppercase tracking-widest text-center leading-tight">Your<br/>Guess</span>
            {current.map((id, i) => {
              const obj = id ? OBJECTS.find(o => o.id === id) : null;
              return (
                <motion.button key={i}
                  whileTap={!gameOver && id ? { scale: 0.86 } : undefined}
                  onClick={!gameOver && id ? () => removeFromGuess(i) : undefined}
                  disabled={gameOver || !id}
                  className={cn(
                    'w-[100px] h-[100px] rounded-xl border-[3px] flex items-center justify-center transition-all',
                    obj ? 'bg-white border-[#1e1b4b] shadow-[2px_3px_0_#1e1b4b] cursor-pointer hover:scale-105'
                       : 'bg-white/10 border-dashed border-white/30',
                  )}
                >
                  {obj ? <img src={obj.src} alt={obj.label} className="w-16 h-16 object-contain" />
                       : <span className="text-white/20 text-2xl font-thin">·</span>}
                </motion.button>
              );
            })}
            <motion.button
              whileTap={complete && !gameOver ? { scale: 0.92 } : undefined}
              onClick={submitGuess}
              disabled={!complete || gameOver}
              className={cn(
                'w-full rounded-xl border-[2px] py-1.5 text-[11px] font-extrabold transition-all',
                complete && !gameOver
                  ? 'bg-green-400 border-[#1e1b4b] shadow-[2px_3px_0_#1e1b4b] cursor-pointer hover:brightness-105 active:shadow-none'
                  : 'bg-white/10 border-white/20 text-white/30 cursor-not-allowed',
              )}
            >
              {complete && !gameOver ? '🔒 Lock It In!' : '· · ·'}
            </motion.button>
          </div>

          {/* Object palette — 2 cols × 5, right beside guess slots */}
          <div className="flex flex-col gap-1 items-center">
            <span className="text-[8px] font-extrabold text-white/45 uppercase tracking-widest">Pick</span>
            <div className="grid grid-cols-2 gap-[1px]">
              {OBJECTS.map(obj => {
                const full = current.every(s => s !== null);
                const alreadyPicked = current.includes(obj.id);
                const disabled = full || alreadyPicked || gameOver;
                return (
                  <motion.button key={obj.id} whileTap={!disabled ? { scale: 0.86 } : undefined}
                    onClick={() => addToGuess(obj.id)}
                    disabled={disabled}
                    className={cn(
                      'flex flex-col items-center rounded-xl border-[2px] border-[#1e1b4b] bg-white pt-2 pb-1.5 w-[100px]',
                      'shadow-[2px_2px_0_#1e1b4b]',
                      disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer hover:brightness-95 active:shadow-none active:translate-y-0.5',
                    )}
                  >
                    <img src={obj.src} alt={obj.label} className="w-16 h-16 object-contain" />
                    <span className="text-[8px] font-bold text-ink text-center leading-tight mt-1 px-1">{obj.label}</span>
                    {showCountry && <span className="text-[6px] text-ink/40 font-semibold leading-none">{obj.country}</span>}
                  </motion.button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ── Win / lose banner ── */}
      <AnimatePresence>
        {gameOver && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            className="mx-2 mb-2 rounded-xl border-[2px] border-[#1e1b4b] bg-white px-3 py-2 shadow-[3px_4px_0_#1e1b4b] shrink-0 flex items-center justify-between gap-2">
            <div className="flex-1 min-w-0">
              {won
                ? <p className="text-sm font-extrabold text-green-600">🎉 Cracked in {guesses.length}!</p>
                : <div>
                    <p className="text-[10px] font-extrabold text-pink-600 mb-1">The secret was:</p>
                    <div className="flex gap-1">
                      {secret.map((id, i) => {
                        const obj = OBJECTS.find(o => o.id === id)!;
                        return <div key={i} className="w-8 h-8 rounded-lg border-2 border-[#1e1b4b] bg-white flex items-center justify-center shadow-[1px_2px_0_#1e1b4b]">
                          <img src={obj.src} alt={obj.label} className="w-5 h-5 object-contain" />
                        </div>;
                      })}
                    </div>
                  </div>}
            </div>
            <div className="flex flex-col gap-1 shrink-0">
              <button onClick={resetGame}
                className="rounded-lg border-[2px] border-[#1e1b4b] bg-yellow-400 px-3 py-1 text-[10px] font-extrabold shadow-[2px_2px_0_#1e1b4b] cursor-pointer">
                Again!
              </button>
              <button onClick={() => setPhase('select')}
                className="rounded-lg border-[2px] border-[#1e1b4b] bg-white px-3 py-1 text-[10px] font-extrabold shadow-[2px_2px_0_#1e1b4b] cursor-pointer">
                Mode
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
