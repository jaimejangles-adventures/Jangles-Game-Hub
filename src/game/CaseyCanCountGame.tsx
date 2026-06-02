import { useState, useCallback, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Link } from '@tanstack/react-router';
import { burstCorrect, burstFinale } from '@/game/confetti';
import { playCorrectExclamation, playIncorrectExclamation } from '@/game/exclamations';
import { cn } from '@/lib/utils';
import { asset } from "@/lib/asset";

const ROUNDS = [
  { country: 'USA',          bg: asset('/count-backgrounds/page-3.png'),  music: asset('/music/NEW ORLEANS.wav'),                          obj: { src: asset('/count-objects/tuba.png'),                 label: 'tuba'        } },
  { country: 'Mexico',       bg: asset('/count-backgrounds/page-4.png'),  music: asset('/music/MEXICO.wav'),                               obj: { src: asset('/count-objects/mexico-hat.png'),           label: 'sombrero'    } },
  { country: 'Jamaica',      bg: asset('/count-backgrounds/page-5.png'),  music: asset('/music/JAMAICA.wav'),                              obj: { src: asset('/count-objects/jamaica-steel-drum.png'),   label: 'steel drum'  } },
  { country: 'Barbados',     bg: asset('/count-backgrounds/page-6.png'),  music: asset('/music/BARBADOS_2.wav'),                           obj: { src: asset('/count-objects/flying-fish.png'),          label: 'flying fish' } },
  { country: 'Peru',         bg: asset('/count-backgrounds/page-7.png'),  music: asset('/music/PERU.wav'),                                 obj: { src: asset('/count-objects/peru-pan-flute.png'),       label: 'pan flute'   } },
  { country: 'Argentina',    bg: asset('/count-backgrounds/page-8.png'),  music: asset('/music/ARGENTINA DRUMS AND HORNS_1.2.wav'),        obj: { src: asset('/count-objects/trombone.png'),             label: 'trombone'    } },
  { country: 'Antarctica',   bg: asset('/count-backgrounds/page-9.png'),  music: null,                                                     obj: { src: asset('/count-objects/south-africa-penguin.png'), label: 'penguin'     } },
  { country: 'UK',           bg: asset('/count-backgrounds/page-10.png'), music: asset('/music/UK.wav'),                                   obj: { src: asset('/count-objects/british-guy.png'),          label: 'beefeater'   } },
  { country: 'Spain',        bg: asset('/count-backgrounds/page-11.png'), music: asset('/music/SPAIN1.2.wav'),                             obj: { src: asset('/count-objects/spain-tomato.png'),         label: 'tomato'      } },
  { country: 'France',       bg: asset('/count-backgrounds/page-12.png'), music: asset('/music/FRANCE.wav'),                               obj: { src: asset('/count-objects/france-eiffel.png'),        label: 'Eiffel Tower'} },
  { country: 'Italy',        bg: asset('/count-backgrounds/page-13.png'), music: asset('/music/ITALY.wav'),                                obj: { src: asset('/count-objects/pizza.png'),                label: 'pizza'       } },
  { country: 'Sri Lanka',    bg: asset('/count-backgrounds/page-15.png'), music: asset('/music/SRI LANKA_1.1.wav'),                        obj: { src: asset('/count-objects/sri-lanka-sittar.png'),     label: 'sitar'       } },
  { country: 'Japan',        bg: asset('/count-backgrounds/page-16.png'), music: asset('/music/JAPAN.wav'),                                obj: { src: asset('/count-objects/octapus.png'),              label: 'octopus'     } },
  { country: 'Switzerland',  bg: asset('/count-backgrounds/page-17.png'), music: asset('/music/SWITZERLAND.wav'),                          obj: { src: asset('/count-objects/swiss-skiis.png'),          label: 'skis'        } },
  { country: 'Kenya',        bg: asset('/count-backgrounds/page-18.png'), music: asset('/music/KENYA.wav'),                                obj: { src: asset('/count-objects/elephant.png'),             label: 'elephant'    } },
  { country: 'South Africa', bg: asset('/count-backgrounds/page-19.png'), music: asset('/music/SOUTH AFRICA_1.2.wav'),                     obj: { src: asset('/count-objects/south-africa-penguin.png'), label: 'penguin'     } },
  { country: 'Ghana',        bg: asset('/count-backgrounds/page-20.png'), music: asset('/music/GHANA.wav'),                                obj: { src: asset('/count-objects/ghana-jewlery.png'),        label: 'jewellery'   } },
  { country: 'South Korea',  bg: asset('/count-backgrounds/page-21.png'), music: asset('/music/SOUTH KOREA.wav'),                          obj: { src: asset('/count-objects/korea-mask.png'),           label: 'mask'        } },
  { country: 'Nepal',        bg: asset('/count-backgrounds/page-22.png'), music: asset('/music/NEPAL.wav'),                                obj: { src: asset('/count-objects/spy-glass.png'),            label: 'spyglass'    } },
  { country: 'Indonesia',    bg: asset('/count-backgrounds/page-23.png'), music: asset('/music/INDONESIA.wav'),                            obj: { src: asset('/count-objects/compass.png'),              label: 'compass'     } },
  { country: 'Australia',    bg: asset('/count-backgrounds/page-24.png'), music: asset('/music/Jamie Jangles_Daniel_Australia.wav'),       obj: { src: asset('/count-objects/tennis.png'),               label: 'tennis ball' } },
];

const COUNT_WORDS = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];

const MSGS = {
  intro:   ["Tap each one!", "Count 'em!", "How many?", "Tap to count!"],
  tap:     ["Keep going!", "Yes!", "Nice one!"],
  done:    ["Now type it!", "How many?", "Plug it in!"],
  correct: ["You got it!", "Amazing!", "That's right!", "You're a star!"],
  wrong:   ["Good try!", "Oops! Recount!", "Try again!"],
};
function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }

const KEY_PALETTE = [
  '#F9A8D4', '#FCA5A5', '#FCD34D', '#86EFAC', '#67E8F9',
  '#93C5FD', '#C4B5FD', '#F0ABFC', '#FDE68A', '#A7F3D0',
];

type Phase = 'counting' | 'choosing' | 'correct' | 'wrong';
interface ObjItem { id: string; tapped: boolean; countNumber?: number; }

function buildRound(count: number, rdIdx: number) {
  const rd = ROUNDS[rdIdx % ROUNDS.length];
  const items: ObjItem[] = Array.from({ length: count }, (_, i) => ({ id: `obj-${i}`, tapped: false }));
  return { ...rd, items, count };
}

function speakNumber(n: number) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utt = new SpeechSynthesisUtterance(COUNT_WORDS[n]);
  utt.rate = 0.85;
  utt.pitch = 1.2;
  window.speechSynthesis.speak(utt);
}

export function CaseyCanCountGame() {
  const [roundOrder]  = useState(() => [...ROUNDS.keys()].sort(() => Math.random() - 0.5));
  const [roundIdx,    setRoundIdx]  = useState(0);
  const [round,       setRound]     = useState(() => buildRound(Math.ceil(Math.random() * 10), 0));
  const [phase,       setPhase]     = useState<Phase>('counting');
  const [tapCount,    setTapCount]  = useState(0);
  const [caseyMsg,    setCaseyMsg]  = useState(() => pick(MSGS.intro));
  const [score,       setScore]     = useState(0);
  const [roundNum,    setRoundNum]  = useState(1);
  const [display,     setDisplay]   = useState('?');
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

  const handleTap = useCallback((id: string) => {
    if (phase !== 'counting') return;
    // If already tapped, just replay its number — no state change
    const existing = round.items.find(it => it.id === id);
    if (existing?.tapped && existing.countNumber != null) {
      speakNumber(existing.countNumber);
      return;
    }
    setTapCount(prev => {
      const next = prev + 1;
      speakNumber(next);
      setRound(r => ({ ...r, items: r.items.map(it => it.id === id ? { ...it, tapped: true, countNumber: next } : it) }));
      if (next === round.count) {
        setCaseyMsg(pick(MSGS.done));
        setTimeout(() => setPhase('choosing'), 500);
      } else {
        setCaseyMsg(pick(MSGS.tap));
      }
      return next;
    });
  }, [phase, round.count, round.items]);

  const handleKey = useCallback((n: number) => {
    if (phase !== 'choosing') return;
    setDisplay(String(n));
    if (n === round.count) {
      setScore(s => s + 1);
      setCaseyMsg(pick(MSGS.correct));
      setPhase('correct');
      playMusic(round.music);
      playCorrectExclamation();
      if (roundNum >= ROUNDS.length) burstFinale(); else burstCorrect();
    } else {
      setCaseyMsg(pick(MSGS.wrong));
      playIncorrectExclamation();
      setPhase('wrong');
    }
  }, [phase, round.count, roundNum]);

  const nextRound = useCallback(() => {
    const nextIdx   = (roundIdx + 1) % ROUNDS.length;
    const nextCount = Math.ceil(Math.random() * 10);
    setRoundIdx(nextIdx);
    stopMusic();
    setRound(buildRound(nextCount, roundOrder[nextIdx]));
    setTapCount(0); setDisplay('?');
    setPhase('counting');
    setCaseyMsg(pick(MSGS.intro));
    setRoundNum(r => r + 1);
  }, [roundIdx, roundOrder]);

  const tryAgain = useCallback(() => {
    setRound(prev => ({ ...prev, items: prev.items.map(it => ({ ...it, tapped: false })) }));
    setTapCount(0); setDisplay('?');
    setPhase('counting');
    setCaseyMsg(pick(MSGS.intro));
  }, []);

  const numbers = Array.from({ length: 10 }, (_, i) => i + 1);

  // Arrange items in centered rows on the paper
  const cols = round.count <= 3 ? round.count : round.count <= 6 ? 3 : round.count <= 8 ? 4 : 5;

  return (
    <div className="relative flex h-full overflow-hidden select-none">
      {/* Background with white opacity overlay — same as CaseyCanAdd */}
      <div className="absolute inset-0 z-0">
        <img src={round.bg} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0" style={{ background: 'rgba(255,255,255,0.45)' }} />
      </div>

      {/* Corner nav */}
      <div className="absolute top-3 left-3 z-30">
        <Link to="/" className="flex items-center gap-1.5 rounded-2xl border-[3px] border-ink bg-white px-3 py-1.5 text-xs font-extrabold shadow-md"
          style={{ borderBottomWidth: 5, borderRightWidth: 4 }}>← Games</Link>
      </div>
      <div className="absolute top-3 right-3 z-30 flex gap-2">
        <div className="rounded-2xl border-[3px] border-ink bg-white px-3 py-1 text-xs font-extrabold shadow"
          style={{ borderBottomWidth: 4, borderRightWidth: 3 }}>
          <span className="text-ink/40">Round </span>{roundNum}
        </div>
        <div className="rounded-2xl border-[3px] border-ink px-3 py-1 text-xs font-extrabold shadow"
          style={{ background: '#fbbf24', borderBottomWidth: 4, borderRightWidth: 3 }}>⭐ {score}</div>
      </div>

      {/* Main content — math paper card centred, calc on right */}
      <div className="relative z-10 flex h-full w-full items-center justify-center gap-4 px-4">

        {/* Math paper card */}
        <motion.div
          key={round.country}
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.25 }}
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
            minWidth: 260,
            maxWidth: '52vw',
            paddingRight: 140,
          }}
        >
          {/* Card header */}
          <div className="flex flex-col items-center gap-1">
            <span className="text-base font-extrabold tracking-tight" style={{ color: '#1a1a2e' }}>Casey Can Count!</span>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full border border-ink/20 bg-white/60" style={{ color: '#6b7280' }}>{round.country}</span>
          </div>

          {/* Casey — top right corner of card */}
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

          {/* Item grid on the paper */}
          <div
            className="flex flex-wrap items-center justify-center gap-2"
            style={{ maxWidth: cols * 64 }}
          >
            {round.items.map((item) => (
              <motion.button
                key={item.id}
                onClick={() => handleTap(item.id)}
                disabled={phase !== 'counting'}
                whileTap={{ scale: 0.82 }}
                className={cn(
                  'relative flex items-center justify-center rounded-xl border-[3px] border-ink p-1 shadow-md transition-colors',
                  'w-12 h-12',
                  item.tapped ? 'bg-[#bbf7d0] border-[#16a34a]' : 'bg-white/90',
                  phase !== 'counting' && !item.tapped && 'opacity-40',
                )}
              >
                <img src={round.obj.src} alt={round.obj.label} className="w-full h-full object-contain" />
              </motion.button>
            ))}
          </div>

          {/* Tap progress dots */}
          {phase === 'counting' && (
            <div className="flex gap-1.5">
              {round.items.map((item) => (
                <div key={item.id} className={cn('h-2 w-2 rounded-full border border-ink/20 transition-colors', item.tapped ? 'bg-indigo-400' : 'bg-ink/10')} />
              ))}
            </div>
          )}
        </motion.div>

        {/* Jangles Calc — right side */}
        <div
          className="flex-shrink-0 flex items-center justify-center"
          style={{ width: 'min(42vw, 190px)' }}
        >
          <div
            className="w-full rounded-[22px] shadow-2xl border-[3px] border-ink p-3 flex flex-col gap-2"
            style={{ background: '#f0e8ff', borderBottomWidth: 6, borderRightWidth: 5 }}
          >
            <div className="text-center">
              <span className="text-[9px] font-extrabold uppercase tracking-widest" style={{ color: '#a78bfa' }}>
                Jangles Calc
              </span>
            </div>

            {/* LCD display */}
            <div
              className="rounded-xl border-2 border-ink/20 px-3 py-2 text-center shadow-inner"
              style={{ background: '#d4f5c8', borderBottomWidth: 3, borderRightWidth: 2 }}
            >
              <div
                className="text-4xl font-extrabold tracking-wider leading-none"
                style={{
                  fontFamily: 'monospace',
                  color: phase === 'correct' ? '#15803d' : phase === 'wrong' ? '#dc2626' : '#1a1a2e',
                }}
              >
                {display}
              </div>
              <div className="mt-0.5 text-[9px] font-bold" style={{ color: '#6b7280' }}>
                {phase === 'counting'  ? `tap all ${round.count}` :
                 phase === 'choosing' ? 'type the count!' :
                 phase === 'correct'  ? '✓ correct!' :
                 phase === 'wrong'    ? 'try again!' : ''}
              </div>
            </div>

            {/* Number keys — 2 rows of 5 */}
            <div className="grid grid-cols-5 gap-1.5">
              {numbers.map((n) => (
                <motion.button
                  key={n}
                  onClick={() => handleKey(n)}
                  disabled={phase !== 'choosing'}
                  whileTap={{ scale: 0.82 }}
                  className={cn(
                    'flex items-center justify-center rounded-full border-[2.5px] border-ink/40 text-sm font-extrabold shadow-md aspect-square',
                    phase === 'choosing' ? 'cursor-pointer' : 'opacity-40 cursor-not-allowed',
                  )}
                  style={{
                    background: KEY_PALETTE[n - 1],
                    boxShadow: phase === 'choosing'
                      ? `0 4px 0 0 ${KEY_PALETTE[n - 1]}99, 0 4px 0 0 rgba(0,0,0,0.2)`
                      : undefined,
                  }}
                >
                  {n}
                </motion.button>
              ))}
            </div>

            {/* Action buttons */}
            <AnimatePresence>
              {phase === 'correct' && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                  onClick={nextRound}
                  className="w-full rounded-xl border-[3px] border-ink py-1.5 text-xs font-extrabold shadow"
                  style={{ background: '#86efac', borderBottomWidth: 4, borderRightWidth: 3 }}
                >
                  Next →
                </motion.button>
              )}
              {phase === 'wrong' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                  className="flex flex-col gap-1"
                >
                  <button onClick={tryAgain}
                    className="w-full rounded-xl border-[3px] border-ink py-1 text-[11px] font-extrabold shadow"
                    style={{ background: '#fcd34d', borderBottomWidth: 4, borderRightWidth: 3 }}>
                    Try Again
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
