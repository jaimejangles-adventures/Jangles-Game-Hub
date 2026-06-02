import { useState, useCallback, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Link } from '@tanstack/react-router';
import { burstCorrect, burstFinale } from '@/game/confetti';
import { playCorrectExclamation, playIncorrectExclamation } from '@/game/exclamations';
import { cn } from '@/lib/utils';
import { asset } from "@/lib/asset";

const ROUNDS = [
  { country: 'USA',          bg: asset('/count-backgrounds/page-3.png'),  music: asset('/music/NEW ORLEANS.wav'),                         obj: { src: asset('/count-objects/tuba.png'),                 label: 'tuba'        } },
  { country: 'Mexico',       bg: asset('/count-backgrounds/page-4.png'),  music: asset('/music/MEXICO.wav'),                              obj: { src: asset('/count-objects/mexico-hat.png'),           label: 'sombrero'    } },
  { country: 'Jamaica',      bg: asset('/count-backgrounds/page-5.png'),  music: asset('/music/JAMAICA.wav'),                             obj: { src: asset('/count-objects/jamaica-steel-drum.png'),   label: 'steel drum'  } },
  { country: 'Barbados',     bg: asset('/count-backgrounds/page-6.png'),  music: asset('/music/BARBADOS_2.wav'),                          obj: { src: asset('/count-objects/flying-fish.png'),          label: 'flying fish' } },
  { country: 'Peru',         bg: asset('/count-backgrounds/page-7.png'),  music: asset('/music/PERU.wav'),                                obj: { src: asset('/count-objects/peru-pan-flute.png'),       label: 'pan flute'   } },
  { country: 'Argentina',    bg: asset('/count-backgrounds/page-8.png'),  music: asset('/music/ARGENTINA DRUMS AND HORNS_1.2.wav'),       obj: { src: asset('/count-objects/trombone.png'),             label: 'trombone'    } },
  { country: 'Antarctica',   bg: asset('/count-backgrounds/page-9.png'),  music: null,                                                    obj: { src: asset('/count-objects/south-africa-penguin.png'), label: 'penguin'     } },
  { country: 'UK',           bg: asset('/count-backgrounds/page-10.png'), music: asset('/music/UK.wav'),                                  obj: { src: asset('/count-objects/british-guy.png'),          label: 'beefeater'   } },
  { country: 'Spain',        bg: asset('/count-backgrounds/page-11.png'), music: asset('/music/SPAIN1.2.wav'),                            obj: { src: asset('/count-objects/spain-tomato.png'),         label: 'tomato'      } },
  { country: 'France',       bg: asset('/count-backgrounds/page-12.png'), music: asset('/music/FRANCE.wav'),                              obj: { src: asset('/count-objects/france-eiffel.png'),        label: 'Eiffel Tower'} },
  { country: 'Italy',        bg: asset('/count-backgrounds/page-13.png'), music: asset('/music/ITALY.wav'),                               obj: { src: asset('/count-objects/pizza.png'),                label: 'pizza'       } },
  { country: 'Sri Lanka',    bg: asset('/count-backgrounds/page-15.png'), music: asset('/music/SRI LANKA_1.1.wav'),                       obj: { src: asset('/count-objects/sri-lanka-sittar.png'),     label: 'sitar'       } },
  { country: 'Japan',        bg: asset('/count-backgrounds/page-16.png'), music: asset('/music/JAPAN.wav'),                               obj: { src: asset('/count-objects/octapus.png'),              label: 'octopus'     } },
  { country: 'Switzerland',  bg: asset('/count-backgrounds/page-17.png'), music: asset('/music/SWITZERLAND.wav'),                         obj: { src: asset('/count-objects/swiss-skiis.png'),          label: 'skis'        } },
  { country: 'Kenya',        bg: asset('/count-backgrounds/page-18.png'), music: asset('/music/KENYA.wav'),                               obj: { src: asset('/count-objects/elephant.png'),             label: 'elephant'    } },
  { country: 'South Africa', bg: asset('/count-backgrounds/page-19.png'), music: asset('/music/SOUTH AFRICA_1.2.wav'),                    obj: { src: asset('/count-objects/south-africa-penguin.png'), label: 'penguin'     } },
  { country: 'Ghana',        bg: asset('/count-backgrounds/page-20.png'), music: asset('/music/GHANA.wav'),                               obj: { src: asset('/count-objects/ghana-jewlery.png'),        label: 'jewellery'   } },
  { country: 'South Korea',  bg: asset('/count-backgrounds/page-21.png'), music: asset('/music/SOUTH KOREA.wav'),                         obj: { src: asset('/count-objects/korea-mask.png'),           label: 'mask'        } },
  { country: 'Nepal',        bg: asset('/count-backgrounds/page-22.png'), music: asset('/music/NEPAL.wav'),                               obj: { src: asset('/count-objects/compass.png'),              label: 'compass'     } },
  { country: 'Australia',    bg: asset('/count-backgrounds/page-24.png'), music: asset('/music/Jamie Jangles_Daniel_Australia.wav'),      obj: { src: asset('/count-objects/tennis.png'),               label: 'tennis ball' } },
];

const BUTTON_PALETTE = [
  '#F9A8D4', // pink
  '#86EFAC', // green
  '#67E8F9', // cyan
  '#FCD34D', // yellow
  '#C4B5FD', // purple
  '#FCA5A5', // red
  '#93C5FD', // blue
  '#FDE68A', // amber
];

const MSGS = {
  intro:   ["Let's add! 🎵", "Can you count them?", "How many in all?", "Add them up!"],
  correct: ["You got it! 🎉", "Amazing! ⭐", "That's right!", "You're a star! 🌟", "Brilliant! 🎊"],
  wrong:   ["Good try! Keep going!", "Oops! Count again!", "So close! Try again!"],
  celebrate: ["Next one! →", "You're on fire! 🔥", "Let's keep going!"],
};

function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }

function rand(min: number, max: number) { return Math.floor(Math.random() * (max - min + 1)) + min; }

function generateRound(excludeIdx?: number) {
  const a = rand(1, 4);
  const b = rand(1, 4);
  const answer = a + b;

  let rdIdx: number;
  do { rdIdx = Math.floor(Math.random() * ROUNDS.length); } while (rdIdx === excludeIdx && ROUNDS.length > 1);
  const rd = ROUNDS[rdIdx];

  const wrongs = new Set<number>();
  while (wrongs.size < 2) {
    const w = rand(Math.max(1, answer - 3), Math.min(8, answer + 3));
    if (w !== answer) wrongs.add(w);
  }

  const choices = [answer, ...wrongs].sort(() => Math.random() - 0.5);
  return { a, b, answer, obj: rd.obj, bg: rd.bg, country: rd.country, music: rd.music, rdIdx, choices };
}

type Phase = 'playing' | 'correct' | 'wrong';

export function CaseyCanAddGame() {
  const [round, setRound] = useState(() => generateRound());
  const [phase, setPhase] = useState<Phase>('playing');
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [roundNum, setRoundNum] = useState(1);
  const [caseyMsg, setCaseyMsg] = useState(() => pick(MSGS.intro));

  const musicRef = useRef<HTMLAudioElement | null>(null);

  function stopMusic() {
    if (musicRef.current) { musicRef.current.pause(); musicRef.current.currentTime = 0; musicRef.current = null; }
  }

  function playMusic(src: string | null) {
    stopMusic();
    if (!src) return;
    const audio = new Audio(src);
    audio.volume = 0.7;
    audio.play().catch(() => {});
    musicRef.current = audio;
  }

  const handleChoice = useCallback((n: number) => {
    if (phase !== 'playing') return;
    setPicked(n);
    if (n === round.answer) {
      setScore(s => s + 1);
      setCaseyMsg(pick(MSGS.correct));
      setPhase('correct');
      playCorrectExclamation();
      playMusic(round.music);
      if (roundNum >= 10) burstFinale(); else burstCorrect();
    } else {
      setCaseyMsg(pick(MSGS.wrong));
      playIncorrectExclamation();
      setPhase('wrong');
    }
  }, [phase, round.answer, round.music, roundNum]);

  const nextRound = useCallback(() => {
    stopMusic();
    setRound(prev => generateRound(prev.rdIdx));
    setPhase('playing');
    setPicked(null);
    setCaseyMsg(pick(MSGS.intro));
    setRoundNum(r => r + 1);
  }, []);

  const tryAgain = useCallback(() => {
    stopMusic();
    setPhase('playing');
    setPicked(null);
    setCaseyMsg(pick(MSGS.intro));
  }, []);

  const { a, b, answer, obj, bg, country, choices } = round;

  return (
    <div className="relative flex flex-col h-full overflow-hidden select-none">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <img src={bg} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0" style={{ background: 'rgba(255,255,255,0.45)' }} />
      </div>

      {/* Corner nav */}
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

      {/* Floating graph paper card — centred on screen */}
      <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
        <motion.div
          key={round.rdIdx}
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.25 }}
          className="relative pointer-events-auto flex flex-col items-center gap-3 rounded-3xl border-[4px] border-ink px-8 py-5 shadow-2xl"
          style={{
            background: '#ffffff',
            backgroundImage: `
              linear-gradient(rgba(99,102,241,0.15) 1px, transparent 1px),
              linear-gradient(90deg, rgba(99,102,241,0.15) 1px, transparent 1px)
            `,
            backgroundSize: '22px 22px',
            borderBottomWidth: 7,
            borderRightWidth: 6,
            minWidth: 320,
            maxWidth: '88vw',
            paddingRight: 140,
          }}
        >
          {/* Casey character + speech bubble — top right corner inside card */}
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
            <img src={asset("/characters/casey-pointing.png")} alt="Casey" className="h-32 w-auto object-contain" />
          </div>

          {/* Card header */}
          <div className="flex flex-col items-center gap-1">
            <span className="text-base font-extrabold tracking-tight" style={{ color: '#1a1a2e' }}>Casey Can Add! ➕</span>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full border border-ink/20 bg-white/60" style={{ color: '#6b7280' }}>{country}</span>
          </div>

          {/* Equation row */}
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <ObjectGroup count={a} obj={obj} color="#fde68a" />

            <div className="flex items-center justify-center w-10 h-10 rounded-full border-[3px] border-ink bg-white font-extrabold text-2xl shadow"
              style={{ borderBottomWidth: 4, borderRightWidth: 3 }}>
              +
            </div>

            <ObjectGroup count={b} obj={obj} color="#bbf7d0" />

            <div className="flex items-center justify-center w-10 h-10 rounded-full border-[3px] border-ink bg-white font-extrabold text-2xl shadow"
              style={{ borderBottomWidth: 4, borderRightWidth: 3 }}>
              =
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={`${phase}-${picked}`}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex items-center justify-center w-16 h-16 rounded-2xl border-[4px] border-ink font-extrabold text-3xl shadow-lg"
                style={{
                  background: phase === 'correct' ? '#86efac' : phase === 'wrong' ? '#fca5a5' : 'white',
                  borderBottomWidth: 6,
                  borderRightWidth: 5,
                  color: phase === 'correct' ? '#15803d' : phase === 'wrong' ? '#dc2626' : '#1a1a2e',
                }}
              >
                {phase === 'correct' && picked !== null ? picked : '?'}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Answer buttons */}
          <div className="flex gap-4">
            {choices.map((n, i) => (
              <motion.button
                key={n}
                onClick={() => handleChoice(n)}
                disabled={phase !== 'playing'}
                whileTap={{ scale: 0.85 }}
                animate={{}}
                className={cn(
                  'w-20 h-20 rounded-2xl border-[4px] border-ink font-extrabold text-3xl shadow-xl flex items-center justify-center',
                  phase === 'playing' ? 'cursor-pointer' : 'cursor-not-allowed',
                  phase !== 'playing' && 'opacity-40',
                )}
                style={{
                  background: BUTTON_PALETTE[i % BUTTON_PALETTE.length],
                  borderBottomWidth: 7,
                  borderRightWidth: 5,
                }}
              >
                {n}
              </motion.button>
            ))}
          </div>

          {/* Action row */}
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

// ── Renders N copies of an object image in a compact grid ─────────────
function ObjectGroup({ count, obj, color }: { count: number; obj: { src: string; label: string }; color: string }) {
  const imgs = Array.from({ length: count });
  return (
    <div
      className="flex flex-wrap gap-1.5 items-center justify-center p-2 rounded-2xl border-[3px] border-ink shadow-md"
      style={{
        background: color,
        borderBottomWidth: 4,
        borderRightWidth: 3,
        maxWidth: count <= 2 ? 100 : count <= 4 ? 120 : 150,
      }}
    >
      {imgs.map((_, i) => (
        <div key={i} className="w-10 h-10 rounded-xl bg-white/80 p-1 border-2 border-ink/20 flex items-center justify-center">
          <img src={obj.src} alt={obj.label} className="w-full h-full object-contain" />
        </div>
      ))}
    </div>
  );
}
