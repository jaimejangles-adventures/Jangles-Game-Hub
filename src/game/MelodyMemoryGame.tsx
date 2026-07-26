import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { burstCorrect, burstFinale } from "@/game/confetti";
import { asset } from "@/lib/asset";
import { cn } from "@/lib/utils";

// ─── Notes ──────────────────────────────────────────────────────────────────
// Rookie: C major pentatonic on a xylophone — any order of these notes sounds
// pleasant, so a wrong tap always fails on rhythm/memory, never on "that note
// sounded bad".
const XYLOPHONE_NOTES = [
  { midi: 60, color: "#FF6B6B", shadow: "#C43B3B", height: 150 },
  { midi: 62, color: "#FF9F43", shadow: "#C96A00", height: 136 },
  { midi: 64, color: "#FFD93D", shadow: "#C8A800", height: 122 },
  { midi: 67, color: "#6BCB77", shadow: "#2E9E43", height: 108 },
  { midi: 69, color: "#48DBFB", shadow: "#009DC4", height: 94 },
  { midi: 72, color: "#C77DFF", shadow: "#8B3FD9", height: 80 },
];

// Master: a full chromatic piano roll spanning two octaves (C4–C6).
const PIANO_START_MIDI = 60; // C4
const PIANO_OCTAVES = 2;
const BLACK_PITCH_CLASSES = new Set([1, 3, 6, 8, 10]);
type PianoKey = { midi: number; isBlack: boolean };
const PIANO_KEYS: PianoKey[] = Array.from({ length: PIANO_OCTAVES * 12 + 1 }, (_, i) => {
  const midi = PIANO_START_MIDI + i;
  return { midi, isBlack: BLACK_PITCH_CLASSES.has(midi % 12) };
});

type Difficulty = "rookie" | "master";
type PatternMode = "classic" | "random";

const DIFFICULTY: Record<Difficulty, { label: string; emoji: string; color: string; desc: string }> = {
  rookie: { label: "Rookie", emoji: "⭐", color: "#22c55e", desc: "Xylophone · 6 notes" },
  master: { label: "Master", emoji: "🔥", color: "#ef4444", desc: "Piano roll · 2 octaves" },
};

const PATTERN_MODE: Record<PatternMode, { label: string; emoji: string; desc: string }> = {
  classic: { label: "Classic", emoji: "🔁", desc: "Replays the same tune, plus one new note" },
  random: { label: "Random Notes", emoji: "🎲", desc: "A brand new random tune, one note longer" },
};

function midiToFreq(m: number) {
  return 440 * Math.pow(2, (m - 69) / 12);
}

// Xylophone-ish mallet strike: a few slightly inharmonic partials (like a
// real bar) plus a short percussive click for the mallet attack.
function synthMallet(ctx: AudioContext, dest: AudioNode, freq: number, t: number) {
  const dur = 0.9;
  [1, 2.76, 5.4].forEach((h, i) => {
    const g = [1, 0.35, 0.12][i];
    const osc = ctx.createOscillator(), gn = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = freq * h;
    gn.gain.setValueAtTime(0, t);
    gn.gain.linearRampToValueAtTime(0.6 * g, t + 0.005);
    gn.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(gn); gn.connect(dest);
    osc.start(t); osc.stop(t + dur + 0.05);
  });
  const click = ctx.createOscillator(), cg = ctx.createGain();
  click.type = "triangle";
  click.frequency.value = freq * 4;
  cg.gain.setValueAtTime(0.25, t);
  cg.gain.exponentialRampToValueAtTime(0.0001, t + 0.03);
  click.connect(cg); cg.connect(dest);
  click.start(t); click.stop(t + 0.04);
}

// Piano-ish tone: harmonic partials with a soft attack and a longer decay.
function synthPiano(ctx: AudioContext, dest: AudioNode, freq: number, t: number) {
  const dur = 1.1;
  [1, 2, 3, 4].forEach((h, i) => {
    const g = [1, 0.5, 0.22, 0.1][i];
    const osc = ctx.createOscillator(), gn = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = freq * h;
    gn.gain.setValueAtTime(0, t);
    gn.gain.linearRampToValueAtTime(0.5 * g, t + 0.01);
    gn.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(gn); gn.connect(dest);
    osc.start(t); osc.stop(t + dur + 0.05);
  });
}

const NOTE_MS = 550;
const GAP_MS = 150;

type Phase = "select" | "ready" | "showing" | "input" | "success" | "gameover";

function randomNoteIdx(poolSize: number) {
  return Math.floor(Math.random() * poolSize);
}

function randomSequence(length: number, poolSize: number) {
  return Array.from({ length }, () => randomNoteIdx(poolSize));
}

// ── Select screen ───────────────────────────────────────────────────────────

function SelectScreen({
  patternMode,
  onPatternModeChange,
  onSelect,
}: {
  patternMode: PatternMode;
  onPatternModeChange: (p: PatternMode) => void;
  onSelect: (d: Difficulty) => void;
}) {
  return (
    <div
      className="flex-1 flex flex-col min-h-0 items-center justify-center px-5 py-8 gap-5"
      style={{ background: "linear-gradient(160deg, #0d0221 0%, #1a0a3e 35%, #0d2060 70%, #0a1a4a 100%)" }}
    >
      <div className="text-center">
        <div className="text-5xl mb-2">🎶</div>
        <h1 className="text-3xl font-extrabold text-white drop-shadow-lg">Melody Memory</h1>
        <p className="text-sm text-white/75 mt-1 font-semibold">Watch Casey play a tune, then repeat it back!</p>
      </div>

      <div className="flex flex-col items-center gap-1.5">
        <div className="flex gap-1 bg-white/10 rounded-full p-1">
          {(["classic", "random"] as PatternMode[]).map((p) => {
            const pcfg = PATTERN_MODE[p];
            return (
              <button
                key={p}
                onClick={() => onPatternModeChange(p)}
                className={cn(
                  "px-4 py-1.5 rounded-full text-xs font-extrabold cursor-pointer transition-colors",
                  patternMode === p ? "bg-white text-ink" : "text-white/60 hover:text-white/80",
                )}
              >
                {pcfg.emoji} {pcfg.label}
              </button>
            );
          })}
        </div>
        <p className="text-white/55 text-[11px] font-semibold text-center max-w-[260px]">
          {PATTERN_MODE[patternMode].desc}
        </p>
      </div>

      <div className="flex flex-col gap-3 w-full max-w-sm">
        {(["rookie", "master"] as Difficulty[]).map((d) => {
          const cfg = DIFFICULTY[d];
          return (
            <motion.button
              key={d}
              whileTap={{ scale: 0.96 }}
              onClick={() => onSelect(d)}
              className="w-full rounded-2xl border-[3px] border-[#1e1b4b] bg-white p-4 shadow-[4px_5px_0_#1e1b4b] text-left flex items-center gap-4 cursor-pointer hover:brightness-95"
            >
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center text-3xl shrink-0 border-[3px] border-[#1e1b4b]"
                style={{ background: cfg.color }}
              >
                {cfg.emoji}
              </div>
              <div>
                <div className="text-xl font-extrabold text-ink">{cfg.label}</div>
                <div className="text-xs text-ink/55 font-semibold mt-0.5">{cfg.desc}</div>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

// ── Piano roll (Master mode) ────────────────────────────────────────────────

function PianoRoll({
  activePad,
  wrongPad,
  inputLocked,
  dim,
  onPress,
}: {
  activePad: number | null;
  wrongPad: number | null;
  inputLocked: boolean;
  dim: boolean;
  onPress: (idx: number) => void;
}) {
  const WHITE_W = 34, WHITE_H = 108, BLACK_W = 20, BLACK_H = 64;

  let whiteCount = 0;
  const positioned = PIANO_KEYS.map((k, idx) => {
    if (!k.isBlack) {
      const x = whiteCount * WHITE_W;
      whiteCount++;
      return { ...k, x, idx };
    }
    return { ...k, x: whiteCount * WHITE_W - BLACK_W / 2, idx };
  });
  const totalWidth = whiteCount * WHITE_W;
  const whites = positioned.filter((k) => !k.isBlack);
  const blacks = positioned.filter((k) => k.isBlack);

  return (
    <div className="w-full max-w-full overflow-x-auto shrink-0 pb-1" style={{ WebkitOverflowScrolling: "touch" }}>
      <div className="relative mx-auto" style={{ width: totalWidth, height: WHITE_H, opacity: dim ? 0.55 : 1 }}>
        {whites.map((k) => {
          const idx = k.idx;
          const isActive = activePad === idx;
          const isWrong = wrongPad === idx;
          return (
            <button
              key={k.midi}
              disabled={inputLocked}
              onClick={() => onPress(idx)}
              className={cn(
                "absolute top-0 rounded-b-md border-[2px] border-[#1e1b4b]",
                inputLocked ? "cursor-not-allowed" : "cursor-pointer",
              )}
              style={{
                left: k.x,
                width: WHITE_W - 2,
                height: WHITE_H,
                background: isWrong ? "#ef4444" : isActive ? "#ffe066" : "#fff",
                boxShadow: isActive ? "0 0 16px 4px #ffe066bb" : "1px 2px 0 #1e1b4b",
                zIndex: 1,
              }}
            />
          );
        })}
        {blacks.map((k) => {
          const idx = k.idx;
          const isActive = activePad === idx;
          const isWrong = wrongPad === idx;
          return (
            <button
              key={k.midi}
              disabled={inputLocked}
              onClick={() => onPress(idx)}
              className={cn(
                "absolute top-0 rounded-b-md border-[2px] border-[#1e1b4b]",
                inputLocked ? "cursor-not-allowed" : "cursor-pointer",
              )}
              style={{
                left: k.x,
                width: BLACK_W,
                height: BLACK_H,
                background: isWrong ? "#ef4444" : isActive ? "#48DBFB" : "#1e1b4b",
                boxShadow: isActive ? "0 0 16px 4px #48DBFBbb" : "1px 2px 0 #000",
                zIndex: 2,
              }}
            />
          );
        })}
      </div>
    </div>
  );
}

// ── Game ─────────────────────────────────────────────────────────────────────

export function MelodyMemoryGame({ onComplete }: { onComplete?: () => void } = {}) {
  const [phase, setPhase] = useState<Phase>("select");
  const [difficulty, setDifficulty] = useState<Difficulty>("rookie");
  const [patternMode, setPatternMode] = useState<PatternMode>("classic");
  const [sequence, setSequence] = useState<number[]>([]);
  const [playerStep, setPlayerStep] = useState(0);
  const [activePad, setActivePad] = useState<number | null>(null);
  const [wrongPad, setWrongPad] = useState<number | null>(null);
  const [best, setBest] = useState(0);

  const ctxRef = useRef<AudioContext | null>(null);
  const calledCompleteRef = useRef(false);

  function getCtx() {
    if (!ctxRef.current || ctxRef.current.state === "closed") ctxRef.current = new AudioContext();
    if (ctxRef.current.state === "suspended") ctxRef.current.resume();
    return ctxRef.current;
  }

  const poolSize = difficulty === "master" ? PIANO_KEYS.length : XYLOPHONE_NOTES.length;

  const playPad = useCallback((idx: number) => {
    const ctx = getCtx();
    if (difficulty === "master") {
      synthPiano(ctx, ctx.destination, midiToFreq(PIANO_KEYS[idx].midi), ctx.currentTime + 0.01);
    } else {
      synthMallet(ctx, ctx.destination, midiToFreq(XYLOPHONE_NOTES[idx].midi), ctx.currentTime + 0.01);
    }
  }, [difficulty]);

  const chooseDifficulty = useCallback((d: Difficulty) => {
    setDifficulty(d);
    setBest(0);
    setWrongPad(null);
    setSequence([]);
    setPhase("ready");
  }, []);

  const startGame = useCallback(() => {
    calledCompleteRef.current = false;
    setBest(0);
    setWrongPad(null);
    setSequence(randomSequence(1, poolSize));
    setPlayerStep(0);
    setPhase("showing");
  }, [poolSize]);

  // Play back the current sequence any time we enter "showing" phase.
  useEffect(() => {
    if (phase !== "showing" || sequence.length === 0) return;
    let cancelled = false;
    const timers: ReturnType<typeof setTimeout>[] = [];
    sequence.forEach((padIdx, i) => {
      timers.push(setTimeout(() => {
        if (cancelled) return;
        setActivePad(padIdx);
        playPad(padIdx);
        timers.push(setTimeout(() => { if (!cancelled) setActivePad(null); }, NOTE_MS - 120));
      }, i * (NOTE_MS + GAP_MS)));
    });
    timers.push(setTimeout(() => {
      if (!cancelled) { setPlayerStep(0); setPhase("input"); }
    }, sequence.length * (NOTE_MS + GAP_MS) + 150));
    return () => { cancelled = true; timers.forEach(clearTimeout); };
  }, [phase, sequence, playPad]);

  const handlePad = useCallback((idx: number) => {
    if (phase !== "input") return;
    playPad(idx);
    setActivePad(idx);
    setTimeout(() => setActivePad(null), 200);

    if (idx !== sequence[playerStep]) {
      setWrongPad(idx);
      setPhase("gameover");
      return;
    }

    const nextStep = playerStep + 1;
    if (nextStep === sequence.length) {
      setBest(sequence.length);
      burstCorrect();
      if (!calledCompleteRef.current) { calledCompleteRef.current = true; onComplete?.(); }
      if (sequence.length % 5 === 0) burstFinale();
      setPhase("success");
      setTimeout(() => {
        setSequence(s => patternMode === "random"
          ? randomSequence(s.length + 1, poolSize)
          : [...s, randomNoteIdx(poolSize)]);
        setPhase("showing");
      }, 650);
    } else {
      setPlayerStep(nextStep);
    }
  }, [phase, playerStep, sequence, onComplete, playPad, poolSize, patternMode]);

  if (phase === "select") {
    return (
      <SelectScreen
        patternMode={patternMode}
        onPatternModeChange={setPatternMode}
        onSelect={chooseDifficulty}
      />
    );
  }

  const inputLocked = phase !== "input";
  const mascotState = phase === "gameover" ? "sad" : phase === "success" ? "happy" : "idle";
  const cfg = DIFFICULTY[difficulty];

  return (
    <div
      className="flex-1 flex flex-col min-h-0"
      style={{ background: "linear-gradient(160deg, #0d0221 0%, #1a0a3e 35%, #0d2060 70%, #0a1a4a 100%)" }}
    >
      {/* ── Header ── */}
      <div className="flex items-center justify-between px-3 pt-2 pb-1 shrink-0">
        <button
          onClick={() => setPhase("select")}
          className="rounded-full bg-white/15 px-3 py-1 text-xs font-bold text-white hover:bg-white/25 cursor-pointer"
        >
          ← Back
        </button>
        <div className="text-center leading-tight">
          <div className="text-sm font-extrabold text-white">🎶 Melody Memory</div>
          <div className="text-[10px] font-bold text-white/60">
            <span style={{ color: cfg.color }}>{cfg.emoji} {cfg.label}</span>
            {patternMode === "random" && <span> · 🎲 Random</span>}
            {phase !== "ready" && (
              <span> · Round {sequence.length}{best > 0 && ` · Best ${best}`}</span>
            )}
          </div>
        </div>
        <button
          onClick={startGame}
          className="rounded-2xl border-[3px] border-[#1e1b4b] bg-white px-3 py-1.5 text-xs font-extrabold shadow-[2px_3px_0_#1e1b4b] cursor-pointer hover:brightness-95"
        >
          {phase === "ready" ? "Start" : "Restart"}
        </button>
      </div>

      {/* ── Main area ── */}
      <div className="flex-1 flex flex-col items-center justify-center gap-6 px-5 pb-6 min-h-0">
        <motion.img
          src={asset("/characters/casey-8bit.png")}
          alt="Casey"
          className="w-16 h-16 object-contain drop-shadow-lg"
          animate={
            mascotState === "happy"
              ? { y: [0, -10, 0], rotate: [0, -6, 6, 0] }
              : mascotState === "sad"
              ? { x: [0, -6, 6, -6, 0] }
              : { y: [0, -3, 0] }
          }
          transition={{ duration: mascotState === "idle" ? 2 : 0.5, repeat: mascotState === "idle" ? Infinity : 0 }}
        />

        {phase === "ready" && (
          <div className="text-center max-w-xs">
            <p className="text-white/85 text-sm font-semibold">
              Watch Casey play a tune on the {difficulty === "master" ? "piano roll" : "xylophone"}, then tap{" "}
              {difficulty === "master" ? "the keys" : "the pads"} back in the same order.{" "}
              {patternMode === "random"
                ? "Every round is a brand new random tune — one note longer each time!"
                : "Every round adds one more note!"}
            </p>
          </div>
        )}

        {phase === "input" && (
          <p className="text-white/70 text-xs font-bold uppercase tracking-widest">Your turn — repeat the tune!</p>
        )}
        {phase === "showing" && (
          <p className="text-white/70 text-xs font-bold uppercase tracking-widest">Listen closely…</p>
        )}
        {phase === "success" && (
          <p className="text-green-300 text-xs font-extrabold uppercase tracking-widest">Nice! Next round…</p>
        )}

        {difficulty === "master" ? (
          <PianoRoll
            activePad={activePad}
            wrongPad={phase === "gameover" ? wrongPad : null}
            inputLocked={inputLocked}
            dim={phase === "ready"}
            onPress={handlePad}
          />
        ) : (
          <div className="flex items-end gap-2 shrink-0">
            {XYLOPHONE_NOTES.map((note, i) => {
              const isActive = activePad === i;
              const isWrong = phase === "gameover" && wrongPad === i;
              return (
                <motion.button
                  key={i}
                  disabled={inputLocked}
                  onClick={() => handlePad(i)}
                  whileTap={!inputLocked ? { scale: 0.94, y: 4 } : undefined}
                  animate={isActive || isWrong ? { scale: 1.08 } : { scale: 1 }}
                  className={cn(
                    "w-11 rounded-b-2xl rounded-t-md border-[3px] border-[#1e1b4b] transition-shadow",
                    inputLocked ? "cursor-not-allowed" : "cursor-pointer",
                  )}
                  style={{
                    height: note.height,
                    background: isWrong ? "#ef4444" : note.color,
                    boxShadow: isActive
                      ? `0 0 22px 6px ${note.color}bb, 3px 4px 0 ${note.shadow}`
                      : `3px 4px 0 ${note.shadow}`,
                    opacity: phase === "ready" ? 0.55 : 1,
                  }}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* ── Game over banner ── */}
      <AnimatePresence>
        {phase === "gameover" && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-2 mb-2 rounded-xl border-[2px] border-[#1e1b4b] bg-white px-3 py-2 shadow-[3px_4px_0_#1e1b4b] shrink-0 flex items-center justify-between gap-2"
          >
            <div>
              <p className="text-base font-extrabold text-pink-600">Oops, wrong note!</p>
              <p className="text-xs font-bold text-ink/60">You made it to round {best}!</p>
            </div>
            <button
              onClick={startGame}
              className="rounded-lg border-[2px] border-[#1e1b4b] bg-yellow-400 px-3 py-1.5 text-[11px] font-extrabold shadow-[2px_2px_0_#1e1b4b] cursor-pointer shrink-0"
            >
              Play Again
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
