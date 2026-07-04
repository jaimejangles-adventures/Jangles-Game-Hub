import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { burstCorrect, burstFinale } from "@/game/confetti";
import { playCorrectExclamation, playIncorrectExclamation } from "@/game/exclamations";
import {
  LANG_WORDS, LANG_CONFIG, LANG_CATEGORIES, getWordsByCategory,
  loadProgress, saveProgress, recordCorrect, isMastered, getCategoryMastery,
  type LangCode, type LangWord, type CategorySlug, type ProgressStore,
} from "@/game/data/jang-lang";

const ROUND_SIZE = 8;
const MAX_LIVES = 3;

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildRoundQueue(progress: ProgressStore, lang: LangCode, catWords: LangWord[]): LangWord[] {
  const unmastered = shuffle(catWords.filter((w) => !isMastered(progress, lang, w.id)));
  const mastered = shuffle(catWords.filter((w) => isMastered(progress, lang, w.id)));
  return [...unmastered, ...mastered].slice(0, ROUND_SIZE);
}

function speakForeign(text: string, speechCode: string, onEnd?: () => void) {
  if (!window.speechSynthesis) { onEnd?.(); return; }
  window.speechSynthesis.cancel();
  const utt = new SpeechSynthesisUtterance(text);
  utt.lang = speechCode;
  utt.rate = 0.85;
  utt.pitch = 1.1;
  if (onEnd) {
    utt.onend = onEnd;
    utt.onerror = onEnd;
  }
  window.speechSynthesis.speak(utt);
}

function buildChoices(correct: LangWord, pool: LangWord[], lang: LangCode): string[] {
  const correctAnswer = correct.translations[lang];
  const wrongs = shuffle(
    pool
      .filter((w) => w.id !== correct.id && w.translations[lang] !== correctAnswer)
      .map((w) => w.translations[lang])
  ).slice(0, 3);
  if (wrongs.length < 3) {
    const extra = shuffle(
      LANG_WORDS
        .filter((w) => w.id !== correct.id && w.translations[lang] !== correctAnswer && !wrongs.includes(w.translations[lang]))
        .map((w) => w.translations[lang])
    ).slice(0, 3 - wrongs.length);
    wrongs.push(...extra);
  }
  return shuffle([correctAnswer, ...wrongs]);
}

// ── Language Picker ────────────────────────────────────────────────────────────

function LangPicker({ onPick }: { onPick: (lang: LangCode) => void }) {
  const langs = Object.entries(LANG_CONFIG) as [LangCode, (typeof LANG_CONFIG)[LangCode]][];
  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-gradient-to-b from-sky-100 to-white px-4 py-10">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
        <div className="text-5xl mb-3">🌍</div>
        <h1 className="text-4xl font-black text-gray-800 tracking-tight">Jang-Lang</h1>
        <p className="text-gray-500 mt-2 text-lg">Pick a language to learn!</p>
      </motion.div>

      <div className="grid grid-cols-2 gap-4 w-full max-w-md">
        {langs.map(([code, cfg], i) => (
          <motion.button
            key={code}
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.08 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onPick(code)}
            className="flex flex-col items-center justify-center gap-2 py-8 px-4 rounded-2xl border-2 border-b-4 bg-white shadow-sm cursor-pointer select-none"
            style={{ borderColor: cfg.accent }}
          >
            <span className="text-5xl">{cfg.flag}</span>
            <span className="font-bold text-gray-700 text-lg">{cfg.name}</span>
          </motion.button>
        ))}
      </div>

      <Link to="/" className="mt-10 text-gray-400 hover:text-gray-600 text-sm underline">
        ← Back to games
      </Link>
    </div>
  );
}

// ── Category Picker ────────────────────────────────────────────────────────────

function CategoryPicker({
  lang,
  progress,
  onPick,
  onBack,
}: {
  lang: LangCode;
  progress: ProgressStore;
  onPick: (cat: CategorySlug) => void;
  onBack: () => void;
}) {
  const cfg = LANG_CONFIG[lang];
  return (
    <div className="flex-1 flex flex-col items-center bg-gradient-to-b from-white to-gray-50 px-4 py-8 overflow-y-auto">
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8 w-full max-w-md">
        <button onClick={onBack} className="float-left text-gray-400 hover:text-gray-600 text-2xl leading-none">←</button>
        <div className="text-4xl mb-1">{cfg.flag}</div>
        <h2 className="text-2xl font-black text-gray-800">Pick a category</h2>
        <p className="text-gray-400 text-sm mt-1">What do you want to learn in <span className="font-bold" style={{ color: cfg.accent }}>{cfg.name}</span>?</p>
      </motion.div>

      <div className="grid grid-cols-2 gap-3 w-full max-w-md">
        {LANG_CATEGORIES.map((cat, i) => {
          const { mastered, total } = getCategoryMastery(progress, lang, cat.slug);
          const pct = total > 0 ? Math.round((mastered / total) * 100) : 0;
          const allDone = mastered === total;
          return (
            <motion.button
              key={cat.slug}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => onPick(cat.slug)}
              className="flex flex-col items-start gap-1 p-4 rounded-2xl border-2 border-b-4 bg-white shadow-sm cursor-pointer select-none text-left"
              style={{ borderColor: cat.accent }}
            >
              <div className="flex items-center justify-between w-full">
                <span className="text-3xl">{cat.emoji}</span>
                {allDone && <span className="text-lg">🏆</span>}
              </div>
              <span className="font-bold text-gray-800 text-base leading-tight">{cat.label}</span>
              <span className="text-xs text-gray-400">{mastered}/{total} mastered</span>
              <div className="w-full h-1.5 bg-gray-100 rounded-full mt-0.5 overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: cat.accent }}
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.6, delay: i * 0.06 + 0.2 }}
                />
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

// ── Lesson ─────────────────────────────────────────────────────────────────────

type AnswerState = "idle" | "correct" | "wrong";

function Lesson({
  lang,
  category,
  progress,
  onComplete,
  onWordCorrect,
  onChangeLang,
}: {
  lang: LangCode;
  category: CategorySlug;
  progress: ProgressStore;
  onComplete: (score: number) => void;
  onWordCorrect: (wordId: string) => void;
  onChangeLang: () => void;
}) {
  const cfg = LANG_CONFIG[lang];
  const catWords = getWordsByCategory(category);

  const [queue] = useState<LangWord[]>(() => buildRoundQueue(progress, lang, catWords));
  const roundSize = queue.length;

  const [idx, setIdx] = useState(0);
  const [choices, setChoices] = useState<string[]>(() => buildChoices(queue[0], catWords, lang));
  const [lives, setLives] = useState(MAX_LIVES);
  const [score, setScore] = useState(0);
  const [answerState, setAnswerState] = useState<AnswerState>("idle");
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [cardShake, setCardShake] = useState(false);

  const current = queue[idx];
  const correctAnswer = current.translations[lang];

  const advance = useCallback((currentScore: number) => {
    const nextIdx = idx + 1;
    if (nextIdx >= roundSize) {
      burstFinale();
      onComplete(currentScore);
      return;
    }
    const nextWord = queue[nextIdx];
    setIdx(nextIdx);
    setChoices(buildChoices(nextWord, catWords, lang));
    setAnswerState("idle");
    setSelectedChoice(null);
  }, [idx, queue, catWords, lang, roundSize, onComplete]);

  const handleChoice = useCallback(
    (choice: string) => {
      if (answerState !== "idle") return;
      setSelectedChoice(choice);
      if (choice === correctAnswer) {
        const newScore = score + 1;
        setAnswerState("correct");
        setScore(newScore);
        burstCorrect();
        onWordCorrect(current.id);
        speakForeign(correctAnswer, cfg.speechCode, () => playCorrectExclamation());
        setTimeout(() => advance(newScore), 2800);
      } else {
        setAnswerState("wrong");
        setCardShake(true);
        setTimeout(() => setCardShake(false), 500);
        playIncorrectExclamation();
        const remaining = lives - 1;
        setLives(remaining);
        if (remaining <= 0) {
          setTimeout(() => {
            setIdx(0);
            setChoices(buildChoices(queue[0], catWords, lang));
            setAnswerState("idle");
            setSelectedChoice(null);
            setLives(MAX_LIVES);
            setScore(0);
          }, 1200);
        } else {
          setTimeout(() => {
            setAnswerState("idle");
            setSelectedChoice(null);
          }, 900);
        }
      }
    },
    [answerState, correctAnswer, score, lives, advance, queue, catWords, lang, cfg, current.id, onWordCorrect]
  );

  const progress_pct = (idx / roundSize) * 100;

  return (
    <div className="flex-1 flex flex-col bg-gray-50">
      <div className="flex items-center gap-3 px-4 pt-5 pb-3 max-w-lg mx-auto w-full">
        <button
          onClick={onChangeLang}
          className="text-gray-400 hover:text-gray-600 text-xl leading-none"
          aria-label="Back to language picker"
        >
          ✕
        </button>
        <div className="flex-1 h-4 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ backgroundColor: "#58CC02" }}
            animate={{ width: `${progress_pct}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
        <div className="flex gap-1">
          {Array.from({ length: MAX_LIVES }).map((_, i) => (
            <span key={i} className="text-xl" style={{ opacity: i < lives ? 1 : 0.2 }}>❤️</span>
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-4 gap-6">
        <motion.p
          key={idx}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-gray-500 font-medium text-base"
        >
          How do you say this in{" "}
          <span className="font-bold" style={{ color: cfg.accent }}>{cfg.name}</span>?
        </motion.p>

        <motion.div
          key={`card-${idx}`}
          animate={cardShake ? { x: [0, -8, 8, -8, 8, 0] } : { x: 0 }}
          transition={{ duration: cardShake ? 0.4 : 0.2 }}
          className="bg-white rounded-3xl shadow-md p-6 flex flex-col items-center gap-4 w-full max-w-sm"
        >
          {current.image ? (
            <img src={current.image} alt={current.english} className="w-40 h-40 object-contain" />
          ) : (
            <span className="text-8xl">{current.emoji}</span>
          )}
          <p className="text-3xl font-black text-gray-800">{current.english}</p>
        </motion.div>

        <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
          {choices.map((choice) => {
            const isSelected = selectedChoice === choice;
            let borderColor = "#d1d5db";
            let bg = "white";
            let textColor = "#374151";
            if (isSelected && answerState === "correct") {
              borderColor = "#22c55e"; bg = "#f0fdf4"; textColor = "#15803d";
            } else if (isSelected && answerState === "wrong") {
              borderColor = "#ef4444"; bg = "#fef2f2"; textColor = "#b91c1c";
            }
            return (
              <motion.button
                key={choice}
                whileHover={answerState === "idle" ? { scale: 1.03 } : {}}
                whileTap={answerState === "idle" ? { scale: 0.97 } : {}}
                onClick={() => handleChoice(choice)}
                className="py-4 px-3 rounded-xl border-2 border-b-4 font-bold text-base cursor-pointer select-none transition-colors duration-150"
                style={{ borderColor, backgroundColor: bg, color: textColor }}
              >
                {choice}
              </motion.button>
            );
          })}
        </div>
      </div>

      <div className="flex justify-center pb-6">
        <span className="text-2xl">{cfg.flag}</span>
      </div>
    </div>
  );
}

// ── Complete screen ────────────────────────────────────────────────────────────

function CompleteScreen({
  score,
  total,
  lang,
  category,
  progress,
  onPlayAgain,
  onPickCategory,
  onChangeLang,
}: {
  score: number;
  total: number;
  lang: LangCode;
  category: CategorySlug;
  progress: ProgressStore;
  onPlayAgain: () => void;
  onPickCategory: () => void;
  onChangeLang: () => void;
}) {
  const cfg = LANG_CONFIG[lang];
  const pct = Math.round((score / total) * 100);
  const perfect = score === total;
  const catDef = LANG_CATEGORIES.find((c) => c.slug === category)!;
  const { mastered, total: catTotal } = getCategoryMastery(progress, lang, category);
  const allDone = mastered === catTotal;

  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-gradient-to-b from-green-50 to-white px-4 gap-6">
      <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 220, damping: 14 }} className="text-7xl">
        {allDone ? "🏆" : perfect ? "⭐" : "✨"}
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-center">
        <h2 className="text-3xl font-black text-gray-800">
          {allDone ? "Category complete!" : perfect ? "Perfect round!" : "Round complete!"}
        </h2>
        <p className="text-gray-500 mt-1">
          {cfg.flag} {catDef.emoji} {catDef.label} · {score}/{total} correct · {pct}%
        </p>
        <div className="mt-3 flex items-center justify-center gap-2">
          <div className="w-40 h-2 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: catDef.accent }}
              initial={{ width: 0 }}
              animate={{ width: `${Math.round((mastered / catTotal) * 100)}%` }}
              transition={{ duration: 0.8, delay: 0.4 }}
            />
          </div>
          <span className="text-sm text-gray-500 font-medium">{mastered}/{catTotal} mastered</span>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="flex flex-col gap-3 w-full max-w-xs">
        {!allDone && (
          <button
            onClick={onPlayAgain}
            className="py-4 rounded-2xl font-bold text-white text-lg border-b-4 transition-all"
            style={{ backgroundColor: cfg.accent, borderColor: `color-mix(in srgb, ${cfg.accent} 70%, black)` }}
          >
            Keep learning {cfg.flag}
          </button>
        )}
        <button
          onClick={onPickCategory}
          className="py-4 rounded-2xl font-bold text-gray-700 text-lg border-2 border-gray-200 border-b-4 bg-white"
        >
          Try another category {catDef.emoji}
        </button>
        <button
          onClick={onChangeLang}
          className="py-4 rounded-2xl font-bold text-gray-500 text-base border-2 border-gray-100 border-b-4 bg-white"
        >
          Switch language 🌍
        </button>
        <Link to="/" className="text-center text-gray-400 hover:text-gray-600 text-sm underline mt-1">
          ← Back to all games
        </Link>
      </motion.div>
    </div>
  );
}

// ── Root ───────────────────────────────────────────────────────────────────────

type Screen = "picker" | "category" | "lesson" | "complete";

export function JangLangGame() {
  const [screen, setScreen] = useState<Screen>("picker");
  const [lang, setLang] = useState<LangCode>("es");
  const [category, setCategory] = useState<CategorySlug>("objects");
  const [finalScore, setFinalScore] = useState(0);
  const [finalTotal, setFinalTotal] = useState(ROUND_SIZE);
  const [lessonKey, setLessonKey] = useState(0);
  const [progress, setProgress] = useState<ProgressStore>(() => loadProgress());

  const handlePickLang = useCallback((l: LangCode) => {
    setLang(l);
    setScreen("category");
  }, []);

  const handlePickCategory = useCallback((cat: CategorySlug) => {
    setCategory(cat);
    setLessonKey((k) => k + 1);
    setScreen("lesson");
  }, []);

  const handleComplete = useCallback((score: number) => {
    const catWords = getWordsByCategory(category);
    setFinalScore(score);
    setFinalTotal(Math.min(catWords.length, ROUND_SIZE));
    setScreen("complete");
  }, [category]);

  const handleWordCorrect = useCallback((wordId: string) => {
    setProgress((prev) => {
      const next = recordCorrect(prev, lang, wordId);
      saveProgress(next);
      return next;
    });
  }, [lang]);

  const handlePlayAgain = useCallback(() => {
    setLessonKey((k) => k + 1);
    setScreen("lesson");
  }, []);

  const handlePickCategoryAgain = useCallback(() => {
    setScreen("category");
  }, []);

  const handleChangeLang = useCallback(() => {
    setScreen("picker");
  }, []);

  if (screen === "picker") return <LangPicker onPick={handlePickLang} />;
  if (screen === "category") return <CategoryPicker lang={lang} progress={progress} onPick={handlePickCategory} onBack={handleChangeLang} />;
  if (screen === "lesson") return (
    <Lesson
      key={lessonKey}
      lang={lang}
      category={category}
      progress={progress}
      onComplete={handleComplete}
      onWordCorrect={handleWordCorrect}
      onChangeLang={handleChangeLang}
    />
  );
  return (
    <CompleteScreen
      score={finalScore}
      total={finalTotal}
      lang={lang}
      category={category}
      progress={progress}
      onPlayAgain={handlePlayAgain}
      onPickCategory={handlePickCategoryAgain}
      onChangeLang={handleChangeLang}
    />
  );
}
