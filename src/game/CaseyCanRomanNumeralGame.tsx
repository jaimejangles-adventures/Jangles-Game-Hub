import { useState, useCallback, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Link } from '@tanstack/react-router';
import { burstCorrect, burstFinale } from '@/game/confetti';
import { playCorrectExclamation, playIncorrectExclamation } from '@/game/exclamations';
import { cn } from '@/lib/utils';
import { asset } from "@/lib/asset";

// ── Roman numeral converter ────────────────────────────────────────────────
function toRoman(num: number): string {
  const vals = [1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1];
  const syms = ['M', 'CM', 'D', 'CD', 'C', 'XC', 'L', 'XL', 'X', 'IX', 'V', 'IV', 'I'];
  let result = '';
  for (let i = 0; i < vals.length; i++) {
    while (num >= vals[i]) { result += syms[i]; num -= vals[i]; }
  }
  return result;
}

// ── Types ──────────────────────────────────────────────────────────────────
type Grade = 3 | 4 | 5;
type Screen = 'grade-select' | 'mode-select' | 'learn' | 'quiz';
type Phase = 'playing' | 'correct' | 'wrong';
type QuizType = 'roman-to-number' | 'number-to-roman';

// ── Grade data ─────────────────────────────────────────────────────────────
const GRADE_DATA: Record<Grade, {
  label: string;
  eyebrow: string;
  accent: string;
  symbols: Array<{ sym: string; val: number }>;
  learnExamples: Array<{ num: number; explanation: string }>;
  quizPool: number[];
}> = {
  3: {
    label: 'Grade 3',
    eyebrow: 'Symbols: I, V, X',
    accent: '#86EFAC',
    symbols: [
      { sym: 'I', val: 1 },
      { sym: 'V', val: 5 },
      { sym: 'X', val: 10 },
    ],
    learnExamples: [
      { num: 1,  explanation: 'I = 1. One stroke for one.' },
      { num: 2,  explanation: 'II = 2. Two strokes for two.' },
      { num: 3,  explanation: 'III = 3. Three I\'s side by side.' },
      { num: 4,  explanation: 'IV = 4. I before V means 5 − 1 = 4.' },
      { num: 5,  explanation: 'V = 5. Think of an open hand!' },
      { num: 6,  explanation: 'VI = 6. V + I = 5 + 1 = 6.' },
      { num: 7,  explanation: 'VII = 7. V + II = 5 + 2 = 7.' },
      { num: 8,  explanation: 'VIII = 8. V + III = 5 + 3 = 8.' },
      { num: 9,  explanation: 'IX = 9. I before X means 10 − 1 = 9.' },
      { num: 10, explanation: 'X = 10. Two V\'s crossed together!' },
      { num: 14, explanation: 'XIV = 14. X + IV = 10 + 4 = 14.' },
      { num: 19, explanation: 'XIX = 19. X + IX = 10 + 9 = 19.' },
      { num: 20, explanation: 'XX = 20. Two tens make twenty!' },
    ],
    quizPool: [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,25,30],
  },
  4: {
    label: 'Grade 4',
    eyebrow: 'Symbols: I, V, X, L, C',
    accent: '#67E8F9',
    symbols: [
      { sym: 'I', val: 1 },
      { sym: 'V', val: 5 },
      { sym: 'X', val: 10 },
      { sym: 'L', val: 50 },
      { sym: 'C', val: 100 },
    ],
    learnExamples: [
      { num: 30,  explanation: 'XXX = 30. Three tens.' },
      { num: 40,  explanation: 'XL = 40. X before L means 50 − 10 = 40.' },
      { num: 50,  explanation: 'L = 50. L stands for fifty.' },
      { num: 60,  explanation: 'LX = 60. L + X = 50 + 10 = 60.' },
      { num: 80,  explanation: 'LXXX = 80. L + XXX = 50 + 30 = 80.' },
      { num: 90,  explanation: 'XC = 90. X before C means 100 − 10 = 90.' },
      { num: 100, explanation: 'C = 100. C is from "centum" — Latin for hundred!' },
      { num: 150, explanation: 'CL = 150. C + L = 100 + 50 = 150.' },
      { num: 199, explanation: 'CXCIX = 199. C + XC + IX = 100 + 90 + 9.' },
      { num: 250, explanation: 'CCL = 250. CC + L = 200 + 50.' },
      { num: 399, explanation: 'CCCXCIX = 399. CCC + XC + IX = 300 + 90 + 9.' },
    ],
    quizPool: [14, 19, 30, 40, 44, 50, 60, 75, 90, 100, 150, 190, 200, 250, 300, 350, 399],
  },
  5: {
    label: 'Grade 5',
    eyebrow: 'All 7 symbols: I V X L C D M',
    accent: '#C4B5FD',
    symbols: [
      { sym: 'I', val: 1 },
      { sym: 'V', val: 5 },
      { sym: 'X', val: 10 },
      { sym: 'L', val: 50 },
      { sym: 'C', val: 100 },
      { sym: 'D', val: 500 },
      { sym: 'M', val: 1000 },
    ],
    learnExamples: [
      { num: 400,  explanation: 'CD = 400. C before D means 500 − 100 = 400.' },
      { num: 500,  explanation: 'D = 500. D stands for five hundred.' },
      { num: 600,  explanation: 'DC = 600. D + C = 500 + 100 = 600.' },
      { num: 800,  explanation: 'DCCC = 800. D + CCC = 500 + 300 = 800.' },
      { num: 900,  explanation: 'CM = 900. C before M means 1000 − 100 = 900.' },
      { num: 1000, explanation: 'M = 1000. M is from "mille" — Latin for thousand!' },
      { num: 1500, explanation: 'MD = 1500. M + D = 1000 + 500 = 1500.' },
      { num: 1776, explanation: 'MDCCLXXVI = 1776. The year America declared independence!' },
      { num: 1999, explanation: 'MCMXCIX = 1999. M + CM + XC + IX.' },
      { num: 2024, explanation: 'MMXXIV = 2024. Two thousand and twenty-four.' },
      { num: 3000, explanation: 'MMM = 3000. Three thousand — very old!' },
    ],
    quizPool: [400, 450, 500, 600, 700, 800, 900, 1000, 1200, 1500, 1776, 1900, 1999, 2000, 2024, 3000],
  },
};

const BACKGROUNDS = [
  asset('/count-backgrounds/page-3.png'),
  asset('/count-backgrounds/page-4.png'),
  asset('/count-backgrounds/page-5.png'),
  asset('/count-backgrounds/page-6.png'),
  asset('/count-backgrounds/page-7.png'),
  asset('/count-backgrounds/page-8.png'),
  asset('/count-backgrounds/page-10.png'),
  asset('/count-backgrounds/page-11.png'),
  asset('/count-backgrounds/page-12.png'),
  asset('/count-backgrounds/page-13.png'),
];

const BUTTON_PALETTE = ['#F9A8D4', '#86EFAC', '#67E8F9', '#FCD34D', '#C4B5FD', '#FCA5A5', '#93C5FD', '#FDE68A'];

const MSGS = {
  quiz:    ["What do you think?", "Roman master!", "Think it through!", "You've got this!"],
  correct: ["You got it!", "Amazing!", "That's right!", "You're a star!", "Romans approve!", "Brilliant!"],
  wrong:   ["Good try! Look again!", "Oops! Check the symbols!", "So close! Try again!"],
  learn:   ["Cool, right?", "Romans were clever!", "Now you know!", "Ancient math!", "Try to remember this!"],
};

function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }
function randInt(min: number, max: number) { return Math.floor(Math.random() * (max - min + 1)) + min; }

// ── Quiz question generator ────────────────────────────────────────────────
function makeWrongChoices(correct: number, pool: number[]): number[] {
  const others = pool.filter(n => n !== correct);
  const shuffled = others.sort(() => Math.random() - 0.5);
  const chosen: number[] = shuffled.slice(0, 3);
  // Pad with nearby numbers if pool is small
  let offset = 1;
  while (chosen.length < 3) {
    const c = correct + (offset % 2 === 0 ? offset / 2 : -(offset + 1) / 2);
    if (c > 0 && !chosen.includes(c) && c !== correct) chosen.push(c);
    offset++;
  }
  return chosen;
}

interface QuizQuestion {
  correctNum: number;
  type: QuizType;
  choices: number[];
  bgIdx: number;
}

function makeQuestion(pool: number[], prevBgIdx: number, prevNum?: number): QuizQuestion {
  const filtered = prevNum !== undefined ? pool.filter(n => n !== prevNum) : pool;
  const src = filtered.length > 0 ? filtered : pool;
  const correctNum = src[Math.floor(Math.random() * src.length)];
  const type: QuizType = Math.random() < 0.5 ? 'roman-to-number' : 'number-to-roman';
  const wrongs = makeWrongChoices(correctNum, pool);
  const choices = [correctNum, ...wrongs].sort(() => Math.random() - 0.5);
  let bgIdx: number;
  do { bgIdx = randInt(0, BACKGROUNDS.length - 1); } while (bgIdx === prevBgIdx && BACKGROUNDS.length > 1);
  return { correctNum, type, choices, bgIdx };
}

// ── Main component ─────────────────────────────────────────────────────────
export function CaseyCanRomanNumeralGame() {
  const [screen, setScreen] = useState<Screen>('grade-select');
  const [grade, setGrade] = useState<Grade>(3);
  const [learnIdx, setLearnIdx] = useState(0);
  const [caseyMsg, setCaseyMsg] = useState(pick(MSGS.learn));
  const [question, setQuestion] = useState<QuizQuestion>(() => makeQuestion(GRADE_DATA[3].quizPool, -1));
  const [phase, setPhase] = useState<Phase>('playing');
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [roundNum, setRoundNum] = useState(1);
  const musicRef = useRef<HTMLAudioElement | null>(null);

  function stopMusic() {
    if (musicRef.current) { musicRef.current.pause(); musicRef.current.currentTime = 0; musicRef.current = null; }
  }

  const selectGrade = useCallback((g: Grade) => {
    setGrade(g);
    setLearnIdx(0);
    setScore(0);
    setRoundNum(1);
    setPhase('playing');
    setPicked(null);
    setCaseyMsg(pick(MSGS.learn));
    setQuestion(makeQuestion(GRADE_DATA[g].quizPool, -1));
    setScreen('mode-select');
  }, []);

  const startLearn = useCallback(() => {
    setLearnIdx(0);
    setCaseyMsg(pick(MSGS.learn));
    setScreen('learn');
  }, []);

  const startQuiz = useCallback(() => {
    setScore(0);
    setRoundNum(1);
    setPhase('playing');
    setPicked(null);
    setCaseyMsg(pick(MSGS.quiz));
    setQuestion(makeQuestion(GRADE_DATA[grade].quizPool, -1));
    setScreen('quiz');
  }, [grade]);

  const goNext = useCallback(() => {
    const examples = GRADE_DATA[grade].learnExamples;
    const nextIdx = (learnIdx + 1) % examples.length;
    setLearnIdx(nextIdx);
    setCaseyMsg(pick(MSGS.learn));
  }, [grade, learnIdx]);

  const goPrev = useCallback(() => {
    const examples = GRADE_DATA[grade].learnExamples;
    const prevIdx = (learnIdx - 1 + examples.length) % examples.length;
    setLearnIdx(prevIdx);
    setCaseyMsg(pick(MSGS.learn));
  }, [grade, learnIdx]);

  const handleChoice = useCallback((n: number) => {
    if (phase !== 'playing') return;
    setPicked(n);
    if (n === question.correctNum) {
      setScore(s => s + 1);
      setCaseyMsg(pick(MSGS.correct));
      setPhase('correct');
      playCorrectExclamation();
      if (roundNum >= 10) burstFinale(); else burstCorrect();
    } else {
      setCaseyMsg(pick(MSGS.wrong));
      playIncorrectExclamation();
      setPhase('wrong');
    }
  }, [phase, question.correctNum, roundNum]);

  const nextQuestion = useCallback(() => {
    stopMusic();
    setQuestion(prev => makeQuestion(GRADE_DATA[grade].quizPool, prev.bgIdx, prev.correctNum));
    setPhase('playing');
    setPicked(null);
    setCaseyMsg(pick(MSGS.quiz));
    setRoundNum(r => r + 1);
  }, [grade]);

  const tryAgain = useCallback(() => {
    stopMusic();
    setPhase('playing');
    setPicked(null);
    setCaseyMsg(pick(MSGS.quiz));
  }, []);

  const data = GRADE_DATA[grade];
  const bg = BACKGROUNDS[question.bgIdx];

  // ── Grade select screen ──────────────────────────────────────────────────
  if (screen === 'grade-select') {
    return (
      <div className="relative flex flex-col h-full overflow-hidden select-none items-center justify-center"
        style={{ background: 'linear-gradient(135deg, #fef9ff 0%, #f0f8ff 100%)' }}>
        <div className="absolute top-3 left-3 z-30">
          <Link to="/" className="flex items-center gap-1.5 rounded-2xl border-[3px] border-ink bg-white px-3 py-1.5 text-xs font-extrabold shadow-md"
            style={{ borderBottomWidth: 5, borderRightWidth: 4 }}>← Games</Link>
        </div>

        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          className="flex flex-col items-center gap-6 px-4 w-full max-w-sm">
          <div className="text-center">
            <div className="text-5xl mb-2">🏛️</div>
            <h1 className="text-2xl font-extrabold tracking-tight">Casey Can Roman Numeral!</h1>
            <p className="text-sm text-ink/60 mt-1">Pick your grade to get started</p>
          </div>

          {([3, 4, 5] as Grade[]).map((g) => (
            <button key={g} onClick={() => selectGrade(g)}
              className="w-full rounded-[1.5rem] border-[3px] border-ink px-6 py-4 text-left shadow-md active:scale-95 transition-transform"
              style={{ background: GRADE_DATA[g].accent, borderBottomWidth: 6, borderRightWidth: 5 }}>
              <div className="font-extrabold text-lg">{GRADE_DATA[g].label}</div>
              <div className="text-sm font-bold opacity-75">{GRADE_DATA[g].eyebrow}</div>
            </button>
          ))}
        </motion.div>
      </div>
    );
  }

  // ── Mode select screen ───────────────────────────────────────────────────
  if (screen === 'mode-select') {
    return (
      <div className="relative flex flex-col h-full overflow-hidden select-none items-center justify-center"
        style={{ background: 'linear-gradient(135deg, #fef9ff 0%, #f0f8ff 100%)' }}>
        <div className="absolute top-3 left-3 z-30">
          <button onClick={() => setScreen('grade-select')}
            className="flex items-center gap-1.5 rounded-2xl border-[3px] border-ink bg-white px-3 py-1.5 text-xs font-extrabold shadow-md"
            style={{ borderBottomWidth: 5, borderRightWidth: 4 }}>← Grades</button>
        </div>

        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          className="flex flex-col items-center gap-5 px-4 w-full max-w-sm">
          <div className="text-center">
            <div className="inline-flex rounded-full border-[3px] border-ink px-4 py-1 text-xs font-extrabold uppercase tracking-widest mb-3"
              style={{ background: data.accent, borderBottomWidth: 4, borderRightWidth: 3 }}>
              {data.label}
            </div>
            <h2 className="text-xl font-extrabold">What would you like to do?</h2>
          </div>

          <button onClick={startLearn}
            className="w-full rounded-[1.5rem] border-[3px] border-ink px-6 py-5 text-left shadow-md active:scale-95 transition-transform"
            style={{ background: '#FEF9C3', borderBottomWidth: 6, borderRightWidth: 5 }}>
            <div className="text-2xl mb-1">📖</div>
            <div className="font-extrabold text-lg">Learn</div>
            <div className="text-sm text-ink/70">Step through Roman numeral examples with Casey</div>
          </button>

          <button onClick={startQuiz}
            className="w-full rounded-[1.5rem] border-[3px] border-ink px-6 py-5 text-left shadow-md active:scale-95 transition-transform"
            style={{ background: '#DCFCE7', borderBottomWidth: 6, borderRightWidth: 5 }}>
            <div className="text-2xl mb-1">⚡</div>
            <div className="font-extrabold text-lg">Quiz</div>
            <div className="text-sm text-ink/70">Test your Roman numeral skills — 4 choices per question</div>
          </button>
        </motion.div>
      </div>
    );
  }

  // ── Learn screen ─────────────────────────────────────────────────────────
  if (screen === 'learn') {
    const examples = data.learnExamples;
    const ex = examples[learnIdx];

    return (
      <div className="relative flex flex-col h-full overflow-hidden select-none">
        {/* Background */}
        <div className="absolute inset-0 z-0">
          <div className="w-full h-full" style={{ background: `linear-gradient(135deg, ${data.accent}55 0%, #f0f8ff 100%)` }} />
        </div>

        {/* Nav */}
        <div className="absolute top-3 left-3 z-30">
          <button onClick={() => setScreen('mode-select')}
            className="flex items-center gap-1.5 rounded-2xl border-[3px] border-ink bg-white px-3 py-1.5 text-xs font-extrabold shadow-md"
            style={{ borderBottomWidth: 5, borderRightWidth: 4 }}>← Back</button>
        </div>
        <div className="absolute top-3 right-3 z-30">
          <div className="rounded-2xl border-[3px] border-ink bg-white px-3 py-1 text-xs font-extrabold shadow"
            style={{ borderBottomWidth: 4, borderRightWidth: 3 }}>
            <span className="text-ink/40">{learnIdx + 1}</span> / {examples.length}
          </div>
        </div>

        {/* Main card */}
        <div className="absolute inset-0 z-10 flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div key={learnIdx}
              initial={{ x: 40, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -40, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="relative flex flex-col items-center gap-4 rounded-3xl border-[4px] border-ink px-8 py-6 shadow-2xl"
              style={{
                background: '#ffffff',
                backgroundImage: `linear-gradient(rgba(99,102,241,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.12) 1px, transparent 1px)`,
                backgroundSize: '22px 22px',
                borderBottomWidth: 7,
                borderRightWidth: 6,
                minWidth: 300,
                maxWidth: '88vw',
                paddingRight: 130,
              }}>

              {/* Casey + speech bubble */}
              <div className="absolute top-3 right-3 flex flex-col items-end">
                <div className="relative mb-1 max-w-[110px]">
                  <div className="rounded-2xl border-[2px] border-ink bg-white px-2.5 py-1.5 text-[0.65rem] font-bold leading-snug shadow-sm text-center"
                    style={{ borderBottomWidth: 3, borderRightWidth: 2 }}>
                    {caseyMsg}
                  </div>
                  <div className="absolute -bottom-1.5 right-4 w-2.5 h-2.5 bg-white border-r-[2px] border-b-[2px] border-ink rotate-45" />
                </div>
                <img src={asset('/characters/casey-pointing.png')} alt="Casey"
                  className="w-20 object-contain" />
              </div>

              {/* Grade badge */}
              <div className="inline-flex self-start rounded-full border-[2px] border-ink px-3 py-0.5 text-[0.65rem] font-extrabold uppercase tracking-widest"
                style={{ background: data.accent, borderBottomWidth: 3, borderRightWidth: 2 }}>
                {data.label} · Learn
              </div>

              {/* Big Roman numeral */}
              <div className="text-center">
                <div className="text-5xl font-extrabold tracking-widest text-ink leading-none mb-1" style={{ fontFamily: 'serif' }}>
                  {toRoman(ex.num)}
                </div>
                <div className="text-3xl font-black text-ink/30">= {ex.num}</div>
              </div>

              {/* Explanation */}
              <div className="rounded-2xl border-[2px] border-ink/20 bg-ink/5 px-4 py-2.5 text-sm font-semibold text-center leading-snug max-w-[220px]">
                {ex.explanation}
              </div>

              {/* Symbol reference */}
              <div className="flex gap-2 flex-wrap justify-center">
                {data.symbols.map(({ sym, val }) => (
                  <div key={sym} className="rounded-xl border-[2px] border-ink px-2.5 py-1 text-xs font-extrabold text-center"
                    style={{ background: data.accent + '88', borderBottomWidth: 3, borderRightWidth: 2 }}>
                    <span className="text-base font-black" style={{ fontFamily: 'serif' }}>{sym}</span>
                    <span className="text-ink/60 ml-1">= {val}</span>
                  </div>
                ))}
              </div>

              {/* Prev / Next */}
              <div className="flex gap-3 mt-1">
                <button onClick={goPrev}
                  className="rounded-2xl border-[3px] border-ink bg-white px-5 py-2 text-sm font-extrabold shadow active:scale-95 transition-transform"
                  style={{ borderBottomWidth: 5, borderRightWidth: 4 }}>← Prev</button>
                <button onClick={goNext}
                  className="rounded-2xl border-[3px] border-ink px-5 py-2 text-sm font-extrabold shadow active:scale-95 transition-transform"
                  style={{ background: data.accent, borderBottomWidth: 5, borderRightWidth: 4 }}>Next →</button>
              </div>

              {/* Quiz CTA */}
              <button onClick={startQuiz}
                className="rounded-2xl border-[3px] border-ink px-5 py-2 text-xs font-extrabold shadow active:scale-95 transition-transform"
                style={{ background: '#FCD34D', borderBottomWidth: 4, borderRightWidth: 3 }}>
                Ready? Take the Quiz! ⚡
              </button>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    );
  }

  // ── Quiz screen ──────────────────────────────────────────────────────────
  const { correctNum, type, choices } = question;
  const correctRoman = toRoman(correctNum);

  const prompt = type === 'roman-to-number'
    ? 'What number is this?'
    : 'What is the Roman numeral for…';

  const promptDisplay = type === 'roman-to-number'
    ? <span className="text-5xl font-black tracking-widest" style={{ fontFamily: 'serif' }}>{correctRoman}</span>
    : <span className="text-5xl font-black">{correctNum.toLocaleString()}</span>;

  return (
    <div className="relative flex flex-col h-full overflow-hidden select-none">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <img src={bg} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0" style={{ background: 'rgba(255,255,255,0.45)' }} />
      </div>

      {/* Nav */}
      <div className="absolute top-3 left-3 z-30">
        <button onClick={() => setScreen('mode-select')}
          className="flex items-center gap-1.5 rounded-2xl border-[3px] border-ink bg-white px-3 py-1.5 text-xs font-extrabold shadow-md"
          style={{ borderBottomWidth: 5, borderRightWidth: 4 }}>← Back</button>
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

      {/* Main card */}
      <div className="absolute inset-0 z-10 flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div key={roundNum}
            initial={{ scale: 0.93, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.22 }}
            className="relative flex flex-col items-center gap-4 rounded-3xl border-[4px] border-ink px-8 py-5 shadow-2xl"
            style={{
              background: '#ffffff',
              backgroundImage: `linear-gradient(rgba(99,102,241,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.15) 1px, transparent 1px)`,
              backgroundSize: '22px 22px',
              borderBottomWidth: 7,
              borderRightWidth: 6,
              minWidth: 310,
              maxWidth: '88vw',
              paddingRight: 140,
            }}>

            {/* Casey + speech bubble */}
            <div className="absolute top-3 right-3 flex flex-col items-end">
              <AnimatePresence mode="wait">
                <motion.div key={caseyMsg}
                  initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="relative mb-1 max-w-[110px]">
                  <div className="rounded-2xl border-[2px] border-ink bg-white px-2.5 py-1.5 text-[0.65rem] font-bold leading-snug shadow-sm text-center"
                    style={{ borderBottomWidth: 3, borderRightWidth: 2 }}>
                    {caseyMsg}
                  </div>
                  <div className="absolute -bottom-1.5 right-4 w-2.5 h-2.5 bg-white border-r-[2px] border-b-[2px] border-ink rotate-45" />
                </motion.div>
              </AnimatePresence>
              <img src={asset('/characters/casey-pointing.png')} alt="Casey"
                className="w-20 object-contain" />
            </div>

            {/* Grade badge */}
            <div className="inline-flex self-start rounded-full border-[2px] border-ink px-3 py-0.5 text-[0.65rem] font-extrabold uppercase tracking-widest"
              style={{ background: data.accent, borderBottomWidth: 3, borderRightWidth: 2 }}>
              {data.label}
            </div>

            {/* Prompt */}
            <div className="text-center">
              <p className="text-xs font-bold text-ink/50 uppercase tracking-wider mb-2">{prompt}</p>
              <div className="min-h-[3.5rem] flex items-center justify-center">
                {promptDisplay}
              </div>
            </div>

            {/* Choices */}
            <div className="grid grid-cols-2 gap-2 w-full">
              {choices.map((n, i) => {
                const label = type === 'roman-to-number' ? String(n) : toRoman(n);
                let bg = BUTTON_PALETTE[i % BUTTON_PALETTE.length];
                let extra = '';
                if (phase !== 'playing') {
                  if (n === correctNum) { bg = '#86EFAC'; extra = 'ring-2 ring-green-500'; }
                  else if (n === picked) { bg = '#FCA5A5'; extra = 'ring-2 ring-red-400'; }
                  else { bg = '#f3f4f6'; }
                }
                return (
                  <button key={n} onClick={() => handleChoice(n)}
                    disabled={phase !== 'playing'}
                    className={cn('rounded-2xl border-[3px] border-ink px-3 py-3 font-extrabold text-center shadow active:scale-95 transition-transform disabled:active:scale-100', extra)}
                    style={{ background: bg, borderBottomWidth: 5, borderRightWidth: 4, fontFamily: type === 'number-to-roman' ? 'serif' : undefined, fontSize: type === 'number-to-roman' ? '1.1rem' : '1rem', letterSpacing: type === 'number-to-roman' ? '0.1em' : undefined }}>
                    {label}
                  </button>
                );
              })}
            </div>

            {/* Result feedback */}
            <AnimatePresence>
              {phase === 'correct' && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="flex flex-col items-center gap-2 w-full">
                  <div className="text-xs font-bold text-green-600">
                    {type === 'roman-to-number'
                      ? `${correctRoman} = ${correctNum}`
                      : `${correctNum} = ${correctRoman}`}
                  </div>
                  <button onClick={nextQuestion}
                    className="rounded-2xl border-[3px] border-ink px-6 py-2 text-sm font-extrabold shadow active:scale-95 transition-transform"
                    style={{ background: '#86EFAC', borderBottomWidth: 5, borderRightWidth: 4 }}>
                    Next Question →
                  </button>
                </motion.div>
              )}
              {phase === 'wrong' && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="flex flex-col items-center gap-2 w-full">
                  <div className="text-xs font-bold text-red-500">
                    The answer was: {type === 'roman-to-number' ? correctNum : correctRoman}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={tryAgain}
                      className="rounded-2xl border-[3px] border-ink bg-white px-4 py-2 text-xs font-extrabold shadow active:scale-95 transition-transform"
                      style={{ borderBottomWidth: 4, borderRightWidth: 3 }}>
                      Try Again
                    </button>
                    <button onClick={nextQuestion}
                      className="rounded-2xl border-[3px] border-ink px-4 py-2 text-xs font-extrabold shadow active:scale-95 transition-transform"
                      style={{ background: '#FCD34D', borderBottomWidth: 4, borderRightWidth: 3 }}>
                      Next →
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Learn mode quick link */}
            {phase === 'playing' && (
              <button onClick={startLearn}
                className="text-[0.65rem] font-bold text-ink/40 underline underline-offset-2 active:text-ink/60">
                Need a hint? Review the symbols →
              </button>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
