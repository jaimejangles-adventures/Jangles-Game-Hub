import { useState, useCallback, useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Link } from '@tanstack/react-router';
import { burstCorrect, burstFinale } from '@/game/confetti';
import { playCorrectExclamation, playIncorrectExclamation } from '@/game/exclamations';
import { cn } from '@/lib/utils';
import { asset } from '@/lib/asset';

type ShopItem = {
  src: string;
  label: string;
  country: string;
  flag: string;
  music: string;
};

const SHOP_ITEMS: ShopItem[] = [
  { src: asset('/count-objects/elephant.png'),             label: 'elephant',     country: 'Kenya',        flag: '🇰🇪', music: 'KENYA.wav'                        },
  { src: asset('/count-objects/flying-fish.png'),          label: 'flying fish',  country: 'Barbados',     flag: '🇧🇧', music: 'BARBADOS_2.wav'                    },
  { src: asset('/count-objects/octapus.png'),              label: 'octopus',      country: 'Japan',        flag: '🇯🇵', music: 'JAPAN.wav'                         },
  { src: asset('/count-objects/south-africa-penguin.png'), label: 'penguin',      country: 'South Africa', flag: '🇿🇦', music: 'SOUTH AFRICA_1.2.wav'              },
  { src: asset('/count-objects/mexico-hat.png'),           label: 'sombrero',     country: 'Mexico',       flag: '🇲🇽', music: 'MEXICO.wav'                        },
  { src: asset('/count-objects/trombone.png'),             label: 'trombone',     country: 'USA',          flag: '🇺🇸', music: 'NEW ORLEANS.wav'                   },
  { src: asset('/count-objects/peru-pan-flute.png'),       label: 'pan flute',    country: 'Peru',         flag: '🇵🇪', music: 'PERU.wav'                          },
  { src: asset('/count-objects/jamaica-steel-drum.png'),   label: 'steel drum',   country: 'Jamaica',      flag: '🇯🇲', music: 'JAMAICA.wav'                       },
  { src: asset('/count-objects/pizza.png'),                label: 'pizza',        country: 'Italy',        flag: '🇮🇹', music: 'ITALY.wav'                         },
  { src: asset('/count-objects/korea-mask.png'),           label: 'mask',         country: 'South Korea',  flag: '🇰🇷', music: 'SOUTH KOREA.wav'                   },
  { src: asset('/count-objects/swiss-skiis.png'),          label: 'skis',         country: 'Switzerland',  flag: '🇨🇭', music: 'SWITZERLAND.wav'                   },
  { src: asset('/count-objects/spain-tomato.png'),         label: 'tomato',       country: 'Spain',        flag: '🇪🇸', music: 'SPAIN1.2.wav'                      },
  { src: asset('/count-objects/france-eiffel.png'),        label: 'Eiffel Tower', country: 'France',       flag: '🇫🇷', music: 'FRANCE.wav'                        },
  { src: asset('/count-objects/tuba.png'),                 label: 'tuba',         country: 'England',      flag: '🇬🇧', music: 'ENGLAND.wav'                       },
  { src: asset('/count-objects/compass.png'),              label: 'compass',      country: 'Argentina',    flag: '🇦🇷', music: 'ARGENTINA DRUMS AND HORNS_1.2.wav' },
];

const BUTTON_PALETTE = ['#F9A8D4','#86EFAC','#67E8F9','#FCD34D','#C4B5FD','#FCA5A5','#93C5FD'];

const MSGS = {
  intro:   ["Time to shop! 🛍️", "How much change?", "Can Casey afford it?", "Count the coins!"],
  correct: ["You got it! 🎉", "Amazing! ⭐", "That's right!", "You're a star! 🌟", "Brilliant! 🎊"],
  wrong:   ["Good try! Count again!", "Oops! Try again!", "So close!"],
};

function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }
function rand(min: number, max: number) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function fmt(n: number) { return `$${n}`; }

type RoundType = 'change' | 'earn' | 'total';

type Round = {
  type: RoundType;
  wallet: number;
  price1: number;
  price2?: number;
  item1: ShopItem;
  item2?: ShopItem;
  answer: number;
  choices: number[];
  question: string;
};

function pickItem(exclude?: number): { item: ShopItem; idx: number } {
  let idx: number;
  do { idx = Math.floor(Math.random() * SHOP_ITEMS.length); } while (idx === exclude);
  return { item: SHOP_ITEMS[idx], idx };
}

function generateRound(): Round {
  const type: RoundType = pick(['change', 'earn', 'total'] as RoundType[]);

  if (type === 'change') {
    const price1 = rand(1, 7);
    const wallet = rand(price1 + 1, price1 + 6);
    const answer = wallet - price1;
    const { item: item1 } = pickItem();
    const question = `Casey has ${fmt(wallet)} and buys the ${item1.label} for ${fmt(price1)}. How much change does she get?`;
    const wrongs = buildWrongs(answer, 0, 9);
    return { type, wallet, price1, item1, answer, choices: shuffle([answer, ...wrongs]), question };
  }

  if (type === 'earn') {
    const wallet = rand(1, 7);
    const price1 = rand(1, 7);
    const answer = wallet + price1;
    const { item: item1 } = pickItem();
    const question = `Casey has ${fmt(wallet)} and earns ${fmt(price1)} more. How much does she have now?`;
    const wrongs = buildWrongs(answer, 1, 14);
    return { type, wallet, price1, item1, answer, choices: shuffle([answer, ...wrongs]), question };
  }

  // total — add two prices
  const price1 = rand(1, 6);
  const { item: item1, idx: idx1 } = pickItem();
  const price2 = rand(1, 6);
  const { item: item2 } = pickItem(idx1);
  const answer = price1 + price2;
  const question = `Casey buys the ${item1.label} for ${fmt(price1)} and the ${item2.label} for ${fmt(price2)}. How much did she spend?`;
  const wrongs = buildWrongs(answer, 1, 12);
  return { type, wallet: 0, price1, price2, item1, item2, answer, choices: shuffle([answer, ...wrongs]), question };
}

function buildWrongs(answer: number, min: number, max: number): [number, number] {
  const set = new Set<number>();
  while (set.size < 2) {
    const w = rand(Math.max(min, answer - 3), Math.min(max, answer + 3));
    if (w !== answer) set.add(w);
  }
  return [...set] as [number, number];
}

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

// ── 8-bit audio chain ─────────────────────────────────────────────────────────
function makeAudioCtx(): AudioContext | null {
  try {
    return new (window.AudioContext || (window as any).webkitAudioContext)();
  } catch { return null; }
}

/** Build the bit-crusher → low-pass → gain chain once per audio element. */
function buildChitpuneChain(audio: HTMLAudioElement, ctx: AudioContext): GainNode {
  const source = ctx.createMediaElementSource(audio);

  // Bit crusher: quantise to ~4 bits for that crunchy chiptune texture
  const crusher = ctx.createWaveShaper();
  const steps = 12; // small = crunchier; 12 keeps melody recognisable but lo-fi
  const n = 256;
  const curve = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const x = (i * 2) / n - 1;
    curve[i] = Math.round(x * steps) / steps;
  }
  crusher.curve = curve;
  crusher.oversample = 'none'; // no interpolation = harder edges

  // Low-pass filter: roll off above ~3.5 kHz (Game Boy speakers vibes)
  const lpf = ctx.createBiquadFilter();
  lpf.type = 'lowpass';
  lpf.frequency.value = 3500;
  lpf.Q.value = 0.7;

  // Master gain for background music volume
  const gain = ctx.createGain();
  gain.gain.value = 0.45;

  source.connect(crusher);
  crusher.connect(lpf);
  lpf.connect(gain);
  gain.connect(ctx.destination);

  return gain;
}

type Phase = 'playing' | 'correct' | 'wrong';

export function CaseyCanPayGame({ onComplete }: { onComplete?: () => void } = {}) {
  const [round, setRound] = useState<Round>(() => generateRound());
  const [phase, setPhase] = useState<Phase>('playing');
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [roundNum, setRoundNum] = useState(1);
  const [caseyMsg, setCaseyMsg] = useState(() => pick(MSGS.intro));
  const [muted, setMuted] = useState(false);

  // 8-bit audio refs
  const audioCtxRef = useRef<AudioContext | null>(null);
  const audioElRef  = useRef<HTMLAudioElement | null>(null);
  const gainRef     = useRef<GainNode | null>(null);
  const chainBuilt  = useRef(false);

  // Play (or switch) country music with 8-bit filter
  const playMusic = useCallback((musicFile: string) => {
    // Lazily create AudioContext (must happen after a user gesture)
    if (!audioCtxRef.current) {
      audioCtxRef.current = makeAudioCtx();
    }
    const ctx = audioCtxRef.current;
    if (!ctx) return;

    // Lazily create the audio element
    if (!audioElRef.current) {
      const el = new Audio();
      el.loop = true;
      el.crossOrigin = 'anonymous';
      audioElRef.current = el;
    }
    const audio = audioElRef.current;

    // Build chiptune chain only once (MediaElementSource can't be re-created)
    if (!chainBuilt.current) {
      gainRef.current = buildChitpuneChain(audio, ctx);
      chainBuilt.current = true;
    }

    // Switch track
    audio.pause();
    audio.src = `/music/${encodeURI(musicFile)}`;
    audio.load();

    if (ctx.state === 'suspended') ctx.resume();
    audio.play().catch(() => {/* autoplay may be blocked – user gesture will unlock */});
  }, []);

  // React to round changes & mute toggle
  useEffect(() => {
    if (muted) {
      audioElRef.current?.pause();
    } else {
      playMusic(round.item1.music);
    }
  }, [round.item1.music, muted, playMusic]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      audioElRef.current?.pause();
      audioCtxRef.current?.close().catch(() => {});
    };
  }, []);

  function speak(text: string) {
    if (muted || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    utt.rate = 0.85; utt.pitch = 1.2;
    window.speechSynthesis.speak(utt);
  }

  const handleChoice = useCallback((n: number) => {
    if (phase !== 'playing') return;
    setPicked(n);
    if (n === round.answer) {
      setScore(s => { if ((s + 1) % 5 === 0) onComplete?.(); return s + 1; });
      setCaseyMsg(pick(MSGS.correct));
      setPhase('correct');
      playCorrectExclamation();
      if (roundNum >= 10) burstFinale(); else burstCorrect();
    } else {
      setCaseyMsg(pick(MSGS.wrong));
      playIncorrectExclamation();
      setPhase('wrong');
    }
  }, [phase, round.answer, roundNum, onComplete]);

  const nextRound = useCallback(() => {
    setRound(generateRound());
    setPhase('playing');
    setPicked(null);
    setCaseyMsg(pick(MSGS.intro));
    setRoundNum(r => r + 1);
  }, []);

  const tryAgain = useCallback(() => {
    setPhase('playing');
    setPicked(null);
    setCaseyMsg(pick(MSGS.intro));
  }, []);

  const { type, wallet, price1, price2, item1, item2, choices, question } = round;

  return (
    <div className="relative flex flex-col h-full overflow-hidden select-none">
      {/* Warm shop background */}
      <div className="absolute inset-0 z-0" style={{ background: 'linear-gradient(135deg, #fff7ed 0%, #fef3c7 50%, #fffbeb 100%)' }} />

      {/* Polka-dot overlay */}
      <div className="absolute inset-0 z-0 opacity-20" style={{
        backgroundImage: 'radial-gradient(circle, #f59e0b 1px, transparent 1px)',
        backgroundSize: '30px 30px',
      }} />

      {/* Corner nav */}
      <div className="absolute top-3 left-3 z-30">
        <Link to="/"
          className="flex items-center gap-1.5 rounded-2xl border-[3px] border-ink bg-white px-3 py-1.5 text-xs font-extrabold shadow-md"
          style={{ borderBottomWidth: 5, borderRightWidth: 4 }}>
          ← Games
        </Link>
      </div>

      {/* Score / round */}
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

      {/* Main card */}
      <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
        <motion.div
          key={round.question}
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.25 }}
          className="relative pointer-events-auto flex flex-col items-center gap-4 rounded-3xl border-[4px] border-ink px-8 py-6 shadow-2xl"
          style={{
            background: '#ffffff',
            backgroundImage: `
              linear-gradient(rgba(99,102,241,0.12) 1px, transparent 1px),
              linear-gradient(90deg, rgba(99,102,241,0.12) 1px, transparent 1px)
            `,
            backgroundSize: '22px 22px',
            borderBottomWidth: 7,
            borderRightWidth: 6,
            minWidth: 320,
            maxWidth: '90vw',
            paddingRight: 148,
          }}
        >
          {/* Casey + speech bubble */}
          <div className="absolute top-3 right-3 flex flex-col items-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={caseyMsg}
                initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="relative mb-1 rounded-2xl border-[3px] border-ink bg-white px-3 py-2 text-center text-xs font-extrabold leading-tight shadow-md"
                style={{ borderBottomWidth: 4, borderRightWidth: 3, maxWidth: 110 }}
              >
                {caseyMsg}
                <div className="absolute bottom-[-8px] left-1/2 -translate-x-1/2 w-0 h-0"
                  style={{ borderLeft: '6px solid transparent', borderRight: '6px solid transparent', borderTop: '8px solid #1c1917' }} />
              </motion.div>
            </AnimatePresence>
            <img src={asset('/characters/casey-pointing.png')} alt="Casey" className="h-32 w-auto object-contain" />
          </div>

          {/* Title + now-playing country chip */}
          <div className="flex flex-col items-center gap-1.5">
            <span className="text-base font-extrabold tracking-tight" style={{ color: '#1a1a2e' }}>
              Casey Can Pay! 💰
            </span>
            <AnimatePresence mode="wait">
              <motion.div
                key={item1.country}
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 4 }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-1 rounded-full border-[2px] border-ink/25 bg-amber-50 px-2.5 py-0.5"
                style={{ fontSize: '0.6rem', fontWeight: 800, letterSpacing: '0.05em' }}
              >
                <span>{item1.flag}</span>
                <span className="text-ink/55">♪ {item1.country}</span>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Shop display */}
          <ShopDisplay type={type} wallet={wallet} price1={price1} price2={price2} item1={item1} item2={item2} />

          {/* Question text */}
          <div
            className="rounded-2xl border-[3px] border-ink bg-amber-50 px-4 py-2.5 text-sm font-bold text-center leading-snug shadow-sm"
            style={{ borderBottomWidth: 4, borderRightWidth: 3, maxWidth: 280 }}
          >
            {question}
          </div>

          {/* Answer buttons */}
          <div className="flex gap-4">
            {choices.map((n, i) => (
              <motion.button
                key={n}
                onClick={() => handleChoice(n)}
                disabled={phase !== 'playing'}
                whileTap={{ scale: 0.85 }}
                className={cn(
                  'w-20 h-20 rounded-2xl border-[4px] border-ink font-extrabold text-2xl shadow-xl flex items-center justify-center',
                  phase === 'playing' ? 'cursor-pointer' : 'cursor-not-allowed',
                  phase !== 'playing' && picked !== n && 'opacity-40',
                )}
                style={{
                  background: phase === 'correct' && picked === n ? '#86efac'
                    : phase === 'wrong' && picked === n ? '#fca5a5'
                    : BUTTON_PALETTE[i % BUTTON_PALETTE.length],
                  borderBottomWidth: 7,
                  borderRightWidth: 5,
                }}
              >
                {fmt(n)}
              </motion.button>
            ))}
          </div>

          {/* Mute */}
          <button
            onClick={() => setMuted(m => !m)}
            className="absolute bottom-3 right-3 flex items-center justify-center w-8 h-8 rounded-xl border-[2.5px] border-ink bg-white shadow"
            style={{ borderBottomWidth: 3, borderRightWidth: 2 }}
            title={muted ? 'Unmute' : 'Mute'}
          >
            {muted ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                <line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/>
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
                <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
              </svg>
            )}
          </button>

          {/* Next / Try again */}
          <AnimatePresence>
            {phase === 'correct' && (
              <motion.button
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                onClick={nextRound}
                className="rounded-2xl border-[3px] border-ink px-8 py-2.5 text-base font-extrabold shadow-lg"
                style={{ background: '#86efac', borderBottomWidth: 5, borderRightWidth: 4 }}
              >
                Next →
              </motion.button>
            )}
            {phase === 'wrong' && (
              <motion.button
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                onClick={tryAgain}
                className="rounded-2xl border-[3px] border-ink px-8 py-2.5 text-base font-extrabold shadow-lg"
                style={{ background: '#fcd34d', borderBottomWidth: 5, borderRightWidth: 4 }}
              >
                Try Again
              </motion.button>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}

// ── Shop display component ────────────────────────────────────────────
function ShopDisplay({ type, wallet, price1, price2, item1, item2 }: {
  type: RoundType;
  wallet: number;
  price1: number;
  price2?: number;
  item1: ShopItem;
  item2?: ShopItem;
}) {
  if (type === 'total' && item2 && price2 !== undefined) {
    return (
      <div className="flex items-center gap-3 flex-wrap justify-center">
        <ShopItem item={item1} price={price1} color="#fde68a" />
        <div className="font-extrabold text-2xl text-ink/40">+</div>
        <ShopItem item={item2} price={price2} color="#c7d2fe" />
      </div>
    );
  }

  if (type === 'change') {
    return (
      <div className="flex items-center gap-3 flex-wrap justify-center">
        <Wallet amount={wallet} />
        <div className="font-extrabold text-2xl text-ink/40">−</div>
        <ShopItem item={item1} price={price1} color="#fde68a" />
        <div className="font-extrabold text-2xl text-ink/40">=</div>
        <div
          className="flex items-center justify-center w-16 h-16 rounded-2xl border-[4px] border-ink font-extrabold text-2xl shadow-md"
          style={{ background: 'white', borderBottomWidth: 6, borderRightWidth: 5, color: '#6b7280' }}
        >
          ?
        </div>
      </div>
    );
  }

  // earn
  return (
    <div className="flex items-center gap-3 flex-wrap justify-center">
      <Wallet amount={wallet} />
      <div className="font-extrabold text-2xl text-ink/40">+</div>
      <div
        className="flex flex-col items-center justify-center gap-1 w-20 h-20 rounded-2xl border-[4px] border-ink shadow-md"
        style={{ background: '#bbf7d0', borderBottomWidth: 6, borderRightWidth: 5 }}
      >
        <span className="text-2xl">🪙</span>
        <span className="text-base font-extrabold">${price1}</span>
      </div>
      <div className="font-extrabold text-2xl text-ink/40">=</div>
      <div
        className="flex items-center justify-center w-16 h-16 rounded-2xl border-[4px] border-ink font-extrabold text-2xl shadow-md"
        style={{ background: 'white', borderBottomWidth: 6, borderRightWidth: 5, color: '#6b7280' }}
      >
        ?
      </div>
    </div>
  );
}

function ShopItem({ item, price, color }: { item: ShopItem; price: number; color: string }) {
  return (
    <div
      className="flex flex-col items-center gap-1 rounded-2xl border-[4px] border-ink px-3 py-2 shadow-md"
      style={{ background: color, borderBottomWidth: 6, borderRightWidth: 5 }}
    >
      <img src={item.src} alt={item.label} className="w-12 h-12 object-contain" />
      <span className="text-sm font-extrabold">${price}</span>
    </div>
  );
}

function Wallet({ amount }: { amount: number }) {
  return (
    <div
      className="flex flex-col items-center justify-center gap-0.5 w-20 h-20 rounded-2xl border-[4px] border-ink shadow-md"
      style={{ background: '#fef9c3', borderBottomWidth: 6, borderRightWidth: 5 }}
    >
      <span className="text-2xl">👛</span>
      <span className="text-base font-extrabold">${amount}</span>
    </div>
  );
}
