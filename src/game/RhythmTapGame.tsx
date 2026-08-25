import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { burstFinale } from "@/game/confetti";
import { asset } from "@/lib/asset";
import { useScore } from "@/hooks/use-score";
import { useAuth } from "@/lib/auth-context";
import { Leaderboard } from "@/components/leaderboard";
import songsData from "@/game/data/music-match.json";

// ─── Songs ──────────────────────────────────────────────────────────────────
type Song = { country: string; flag: string; audio: string };
const SONGS: Song[] = (songsData as { country: string; flag: string; audio: string }[]).map(
  (s) => ({ country: s.country, flag: s.flag, audio: s.audio }),
);

function slugify(country: string) {
  return country.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

// ─── Lanes ──────────────────────────────────────────────────────────────────
const LANE_COUNT = 3;
const LANE_COLORS = ["#FF6B6B", "#FFD93D", "#48DBFB"];
const LANE_SHADOWS = ["#C43B3B", "#C8A800", "#009DC4"];
const LANE_KEYS = ["ArrowLeft", "ArrowDown", "ArrowRight"];
const LANE_GLYPHS = ["◀", "▼", "▶"];

// ─── Timing ─────────────────────────────────────────────────────────────────
const TRAVEL_TIME = 1.8; // seconds a note takes to fall from top to the hit line
const PERFECT_WINDOW = 0.09;
const GOOD_WINDOW = 0.18;
const MIN_GAP = 0.26; // minimum seconds between generated notes
const TRACK_HEIGHT = 400;
const HIT_LINE_Y = 336;

type Note = {
  id: number;
  time: number;
  lane: number;
  judged: boolean;
  result: "perfect" | "good" | "miss" | null;
};

type VisibleNote = { id: number; lane: number; top: number; result: Note["result"] };

// Small deterministic PRNG so the same song always deals the same chart.
function mulberry32(seed: number) {
  let a = seed;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function hashString(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return h;
}

// Energy-based onset detection: compares each window's energy against a
// rolling local average, flagging a beat whenever it spikes well above it.
function detectBeats(buffer: AudioBuffer): number[] {
  const channelCount = buffer.numberOfChannels;
  const length = buffer.length;
  const sampleRate = buffer.sampleRate;
  const mono = new Float32Array(length);
  for (let c = 0; c < channelCount; c++) {
    const data = buffer.getChannelData(c);
    for (let i = 0; i < length; i++) mono[i] += data[i] / channelCount;
  }

  const windowSize = 1024;
  const windowCount = Math.floor(length / windowSize);
  const energies = new Float32Array(windowCount);
  for (let w = 0; w < windowCount; w++) {
    let sum = 0;
    const base = w * windowSize;
    for (let i = 0; i < windowSize; i++) {
      const s = mono[base + i];
      sum += s * s;
    }
    energies[w] = sum / windowSize;
  }

  const historyWindows = Math.max(4, Math.round((sampleRate * 1.0) / windowSize));
  const beatTimes: number[] = [];
  let lastBeatTime = -Infinity;

  for (let w = 0; w < windowCount; w++) {
    const start = Math.max(0, w - historyWindows);
    let sum = 0;
    let count = 0;
    for (let i = start; i < w; i++) {
      sum += energies[i];
      count++;
    }
    if (count < historyWindows / 2) continue;
    const avg = sum / count;
    if (avg <= 0) continue;

    const threshold = avg * 1.4;
    const time = (w * windowSize) / sampleRate;
    if (energies[w] > threshold && time - lastBeatTime >= MIN_GAP) {
      beatTimes.push(time);
      lastBeatTime = time;
    }
  }

  return beatTimes;
}

function buildChart(beatTimes: number[], seed: number): Note[] {
  const rand = mulberry32(seed);
  let lastLane = -1;
  let sameLaneStreak = 0;
  return beatTimes.map((time, i) => {
    let lane = Math.floor(rand() * LANE_COUNT);
    if (lane === lastLane && sameLaneStreak >= 1) {
      lane = (lane + 1 + Math.floor(rand() * (LANE_COUNT - 1))) % LANE_COUNT;
    }
    sameLaneStreak = lane === lastLane ? sameLaneStreak + 1 : 0;
    lastLane = lane;
    return { id: i, time, lane, judged: false, result: null };
  });
}

type Phase = "select" | "loading" | "countdown" | "playing" | "results";

const GRADES: { min: number; label: string; color: string }[] = [
  { min: 95, label: "S", color: "#FFD93D" },
  { min: 85, label: "A", color: "#6BCB77" },
  { min: 70, label: "B", color: "#48DBFB" },
  { min: 50, label: "C", color: "#C77DFF" },
  { min: 0, label: "D", color: "#9ca3af" },
];

export function RhythmTapGame() {
  const { user, openAuthModal } = useAuth();
  const [phase, setPhase] = useState<Phase>("select");
  const [song, setSong] = useState<Song | null>(null);
  const [countdown, setCountdown] = useState(3);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [tally, setTally] = useState({ perfect: 0, good: 0, miss: 0 });
  const [visibleNotes, setVisibleNotes] = useState<VisibleNote[]>([]);
  const [flashLane, setFlashLane] = useState<number | null>(null);
  const [judgment, setJudgment] = useState<{ key: number; text: string; color: string } | null>(null);

  const { saveScore, saving, saved } = useScore("rhythm-tap");
  const scoreRef = useRef(0);
  const comboRef = useRef(0);
  const maxComboRef = useRef(0);
  const tallyRef = useRef({ perfect: 0, good: 0, miss: 0 });

  const audioCtxRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);
  const bufferRef = useRef<AudioBuffer | null>(null);
  const notesRef = useRef<Note[]>([]);
  const laneNotesRef = useRef<Note[][]>([[], [], []]);
  const laneCursorRef = useRef<number[]>([0, 0, 0]);
  const missPointerRef = useRef(0);
  const startTimeRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const judgmentKeyRef = useRef(0);

  const stopPlayback = useCallback(() => {
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    try {
      sourceRef.current?.stop();
    } catch {
      // already stopped
    }
    sourceRef.current = null;
  }, []);

  useEffect(() => () => {
    stopPlayback();
    audioCtxRef.current?.close().catch(() => {});
  }, [stopPlayback]);

  const finishSong = useCallback(() => {
    stopPlayback();
    setPhase("results");
    if (scoreRef.current > 0) {
      burstFinale();
      saveScore(scoreRef.current, song ? slugify(song.country) : undefined);
    }
  }, [stopPlayback, saveScore, song]);

  const showJudgment = useCallback((text: string, color: string) => {
    judgmentKeyRef.current += 1;
    setJudgment({ key: judgmentKeyRef.current, text, color });
  }, []);

  const registerHit = useCallback(
    (note: Note, result: "perfect" | "good") => {
      note.judged = true;
      note.result = result;
      comboRef.current += 1;
      if (comboRef.current > maxComboRef.current) maxComboRef.current = comboRef.current;
      const mult = comboRef.current >= 20 ? 4 : comboRef.current >= 10 ? 3 : comboRef.current >= 5 ? 2 : 1;
      const base = result === "perfect" ? 100 : 50;
      scoreRef.current += base * mult;
      tallyRef.current = { ...tallyRef.current, [result]: tallyRef.current[result] + 1 };
      setScore(scoreRef.current);
      setCombo(comboRef.current);
      setMaxCombo(maxComboRef.current);
      setTally(tallyRef.current);
      showJudgment(result === "perfect" ? "PERFECT!" : "GOOD", result === "perfect" ? "#FFD93D" : "#6BCB77");
    },
    [showJudgment],
  );

  const registerMiss = useCallback(
    (note: Note) => {
      note.judged = true;
      note.result = "miss";
      comboRef.current = 0;
      tallyRef.current = { ...tallyRef.current, miss: tallyRef.current.miss + 1 };
      setCombo(0);
      setTally(tallyRef.current);
      showJudgment("MISS", "#FF6B6B");
    },
    [showJudgment],
  );

  const handleLane = useCallback(
    (lane: number) => {
      if (phase !== "playing" || !audioCtxRef.current) return;
      setFlashLane(lane);
      setTimeout(() => setFlashLane((l) => (l === lane ? null : l)), 120);

      const elapsed = audioCtxRef.current.currentTime - startTimeRef.current;
      const lanes = laneNotesRef.current[lane];
      let cursor = laneCursorRef.current[lane];
      while (cursor < lanes.length && lanes[cursor].judged) cursor++;
      laneCursorRef.current[lane] = cursor;

      const candidate = lanes[cursor];
      if (!candidate) return;
      const diff = candidate.time - elapsed;
      if (Math.abs(diff) <= GOOD_WINDOW) {
        registerHit(candidate, Math.abs(diff) <= PERFECT_WINDOW ? "perfect" : "good");
        laneCursorRef.current[lane] = cursor + 1;
      }
    },
    [phase, registerHit],
  );

  useEffect(() => {
    if (phase !== "playing") return;
    const onKey = (e: KeyboardEvent) => {
      const idx = LANE_KEYS.indexOf(e.key);
      if (idx !== -1) {
        e.preventDefault();
        handleLane(idx);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, handleLane]);

  const tick = useCallback(() => {
    const ctx = audioCtxRef.current;
    const buffer = bufferRef.current;
    if (!ctx || !buffer) return;
    const elapsed = ctx.currentTime - startTimeRef.current;

    const notes = notesRef.current;
    let mp = missPointerRef.current;
    while (mp < notes.length && notes[mp].judged) mp++;
    while (mp < notes.length && !notes[mp].judged && elapsed - notes[mp].time > GOOD_WINDOW) {
      registerMiss(notes[mp]);
      mp++;
    }
    missPointerRef.current = mp;

    const nextVisible: VisibleNote[] = [];
    for (const n of notes) {
      const untilHit = n.time - elapsed;
      if (untilHit > TRAVEL_TIME + 0.15) break;
      if (untilHit < -0.3) continue;
      const progress = Math.min(1.15, Math.max(0, 1 - untilHit / TRAVEL_TIME));
      nextVisible.push({ id: n.id, lane: n.lane, top: progress * HIT_LINE_Y, result: n.result });
    }
    setVisibleNotes(nextVisible);

    if (elapsed >= buffer.duration + 0.6) {
      finishSong();
      return;
    }
    rafRef.current = requestAnimationFrame(tick);
  }, [registerMiss, finishSong]);

  const startPlaying = useCallback(() => {
    const ctx = audioCtxRef.current;
    const buffer = bufferRef.current;
    if (!ctx || !buffer) return;
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    const startAt = ctx.currentTime + 0.15;
    source.start(startAt);
    sourceRef.current = source;
    startTimeRef.current = startAt;
    setPhase("playing");
    rafRef.current = requestAnimationFrame(tick);
  }, [tick]);

  const runCountdown = useCallback(() => {
    setPhase("countdown");
    setCountdown(3);
    let n = 3;
    const step = () => {
      n -= 1;
      if (n <= 0) {
        startPlaying();
        return;
      }
      setCountdown(n);
      setTimeout(step, 700);
    };
    setTimeout(step, 700);
  }, [startPlaying]);

  const selectSong = useCallback(
    async (s: Song) => {
      setSong(s);
      setLoadError(null);
      setPhase("loading");
      scoreRef.current = 0;
      comboRef.current = 0;
      maxComboRef.current = 0;
      tallyRef.current = { perfect: 0, good: 0, miss: 0 };
      missPointerRef.current = 0;
      setScore(0);
      setCombo(0);
      setMaxCombo(0);
      setTally({ perfect: 0, good: 0, miss: 0 });
      setVisibleNotes([]);
      setJudgment(null);

      try {
        const ctx = audioCtxRef.current ?? new AudioContext();
        audioCtxRef.current = ctx;
        if (ctx.state === "suspended") await ctx.resume();

        const res = await fetch(asset(`/${s.audio}`));
        const arrayBuffer = await res.arrayBuffer();
        const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
        bufferRef.current = audioBuffer;

        const beatTimes = detectBeats(audioBuffer);
        const notes = buildChart(beatTimes, hashString(s.audio));
        notesRef.current = notes;
        const lanes: Note[][] = [[], [], []];
        for (const n of notes) lanes[n.lane].push(n);
        laneNotesRef.current = lanes;
        laneCursorRef.current = [0, 0, 0];
        // eslint-disable-next-line no-console
        console.log("[rt] chart", { duration: audioBuffer.duration, noteCount: notes.length, times: notes.map((n) => +n.time.toFixed(2)) });

        runCountdown();
      } catch {
        setLoadError("Couldn't load that song — try another one!");
        setPhase("select");
      }
    },
    [runCountdown],
  );

  const playAgain = useCallback(() => {
    if (song) selectSong(song);
  }, [song, selectSong]);

  // ─── Select screen ──────────────────────────────────────────────────────
  if (phase === "select") {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-8 px-4 py-8">
        <div className="text-center">
          <div className="mb-2 text-5xl">🥁</div>
          <h1 className="text-3xl font-extrabold">Rhythm Tap!</h1>
          <p className="mt-1 text-sm text-ink/60">
            Pick a country's song — tap the lanes in time with the beat!
          </p>
          {loadError && <p className="mt-2 text-sm font-bold text-red-500">{loadError}</p>}
        </div>

        <div className="grid max-w-3xl grid-cols-2 gap-3 sm:grid-cols-4">
          {SONGS.map((s) => (
            <button
              key={s.country}
              onClick={() => selectSong(s)}
              className="flex flex-col items-center gap-2 rounded-[1.5rem] border-[3px] border-ink px-4 py-4 transition-transform hover:-translate-y-1 active:translate-y-0"
              style={{ background: "#48DBFB22", borderBottomWidth: 6, borderRightWidth: 5 }}
            >
              <span className="text-3xl">{s.flag}</span>
              <span className="text-center text-xs font-extrabold leading-tight">{s.country}</span>
            </button>
          ))}
        </div>

        <p className="max-w-xs text-center text-xs text-ink/40">
          Use the on-screen buttons or the ← ↓ → arrow keys to hit the notes!
        </p>
      </div>
    );
  }

  // ─── Loading screen ─────────────────────────────────────────────────────
  if (phase === "loading") {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 px-4 text-center">
        <div className="text-5xl">{song?.flag}</div>
        <p className="text-sm font-bold text-ink/60">Learning the beat of {song?.country}'s song…</p>
        <motion.div
          className="h-2 w-40 rounded-full bg-ink/10"
          initial={{ opacity: 0.4 }}
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ repeat: Infinity, duration: 1.1 }}
        />
      </div>
    );
  }

  // ─── Countdown screen ───────────────────────────────────────────────────
  if (phase === "countdown") {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 px-4 text-center">
        <div className="text-2xl font-extrabold text-ink/60">
          {song?.flag} {song?.country}
        </div>
        <AnimatePresence mode="wait">
          <motion.div
            key={countdown}
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.4, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="text-8xl font-extrabold"
            style={{ color: LANE_COLORS[countdown % LANE_COLORS.length] }}
          >
            {countdown}
          </motion.div>
        </AnimatePresence>
      </div>
    );
  }

  // ─── Results screen ─────────────────────────────────────────────────────
  if (phase === "results") {
    const totalNotes = tally.perfect + tally.good + tally.miss;
    const accuracy = totalNotes > 0 ? Math.round(((tally.perfect + tally.good) / totalNotes) * 100) : 0;
    const grade = GRADES.find((g) => accuracy >= g.min) ?? GRADES[GRADES.length - 1];

    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-5 px-4 py-8 text-center">
        <div className="text-5xl">{song?.flag}</div>
        <h2 className="text-2xl font-extrabold">{song?.country} — Song Complete!</h2>

        <div
          className="flex items-center justify-center rounded-full border-[3px] border-ink text-4xl font-extrabold"
          style={{ background: grade.color, width: 88, height: 88, borderBottomWidth: 6, borderRightWidth: 5 }}
        >
          {grade.label}
        </div>

        <div
          className="rounded-2xl border-[3px] border-ink px-6 py-2 text-xl font-extrabold"
          style={{ background: "#FFD93D33", borderBottomWidth: 5, borderRightWidth: 4 }}
        >
          🏆 {score.toLocaleString()} pts
        </div>

        <div className="flex flex-wrap justify-center gap-4 text-sm font-bold text-ink/70">
          <span>🎯 {accuracy}% accuracy</span>
          <span>🔥 {maxCombo} max combo</span>
          <span style={{ color: "#FFD93D" }}>⭐ {tally.perfect} perfect</span>
          <span style={{ color: "#6BCB77" }}>✓ {tally.good} good</span>
          <span style={{ color: "#FF6B6B" }}>✗ {tally.miss} miss</span>
        </div>

        <div
          className="w-full max-w-sm rounded-[2rem] border-[3px] border-ink p-4 text-left"
          style={{ background: "#1a1a2e", borderBottomWidth: 6, borderRightWidth: 5 }}
        >
          <div className="mb-1 text-[0.6rem] font-extrabold uppercase tracking-[0.2em] text-gray-500">
            🏆 Top Scores — {song?.country}
          </div>
          {user ? (
            <p
              className="mb-2 text-xs font-bold"
              style={{ color: saving ? "#9ca3af" : saved ? "#4ade80" : "transparent" }}
            >
              {saving ? "Saving score…" : "✓ Score saved to leaderboard"}
            </p>
          ) : (
            <button
              onClick={() => openAuthModal("sign-up")}
              className="mb-2 block text-xs font-bold text-yellow-400 underline hover:text-yellow-300"
            >
              🏆 Sign in to save your score
            </button>
          )}
          <Leaderboard gameSlug="rhythm-tap" difficulty={song ? slugify(song.country) : undefined} limit={5} theme="dark" />
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            onClick={playAgain}
            className="rounded-full border-[3px] border-ink px-8 py-2 text-sm font-extrabold transition-transform hover:-translate-y-0.5"
            style={{ background: "#6BCB77", borderBottomWidth: 5, borderRightWidth: 4 }}
          >
            Play Again
          </button>
          <button
            onClick={() => setPhase("select")}
            className="rounded-full border-[3px] border-ink px-8 py-2 text-sm font-extrabold transition-transform hover:-translate-y-0.5"
            style={{ background: "#e5e7eb", borderBottomWidth: 5, borderRightWidth: 4 }}
          >
            Choose Another Song
          </button>
        </div>
      </div>
    );
  }

  // ─── Playing screen ─────────────────────────────────────────────────────
  return (
    <div className="flex min-h-[70vh] flex-col items-center gap-4 px-4 py-6">
      <div className="flex w-full max-w-md items-center justify-between text-sm font-extrabold">
        <span>
          {song?.flag} {song?.country}
        </span>
        <span>🏆 {score.toLocaleString()}</span>
        <span style={{ color: combo >= 5 ? "#FFD93D" : undefined }}>🔥 {combo}</span>
      </div>

      <div
        className="relative w-full max-w-md overflow-hidden rounded-[1.5rem] border-[3px] border-ink"
        style={{ height: TRACK_HEIGHT, background: "#111827", borderBottomWidth: 6, borderRightWidth: 5 }}
      >
        {/* lane dividers */}
        <div className="absolute inset-0 flex">
          {Array.from({ length: LANE_COUNT }).map((_, i) => (
            <div key={i} className="flex-1 border-white/5" style={{ borderRightWidth: i < LANE_COUNT - 1 ? 1 : 0 }} />
          ))}
        </div>

        {/* hit line */}
        <div
          className="absolute left-0 right-0 border-t-2 border-dashed border-white/40"
          style={{ top: HIT_LINE_Y }}
        />

        {/* falling notes */}
        {visibleNotes.map((n) => (
          <div
            key={n.id}
            className="absolute rounded-full border-[3px] border-ink"
            style={{
              left: `${(n.lane / LANE_COUNT) * 100}%`,
              width: `${100 / LANE_COUNT}%`,
              top: n.top,
              height: 0,
            }}
          >
            <div
              className="mx-auto rounded-full border-[3px] border-ink"
              style={{
                width: 40,
                height: 40,
                marginTop: -20,
                background: n.result === "miss" ? "#4b5563" : LANE_COLORS[n.lane],
                opacity: n.result === "miss" ? 0.3 : 1,
                borderBottomWidth: 4,
                borderRightWidth: 3,
              }}
            />
          </div>
        ))}

        {/* judgment popup */}
        <AnimatePresence>
          {judgment && (
            <motion.div
              key={judgment.key}
              initial={{ opacity: 0, y: 10, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.35 }}
              className="absolute left-1/2 top-6 -translate-x-1/2 text-lg font-extrabold"
              style={{ color: judgment.color }}
            >
              {judgment.text}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* tap buttons */}
      <div className="flex w-full max-w-md gap-3">
        {Array.from({ length: LANE_COUNT }).map((_, lane) => (
          <button
            key={lane}
            onPointerDown={() => handleLane(lane)}
            className="flex-1 rounded-2xl border-[3px] border-ink py-5 text-2xl font-extrabold transition-transform active:translate-y-0.5"
            style={{
              background: flashLane === lane ? LANE_SHADOWS[lane] : LANE_COLORS[lane],
              borderBottomWidth: 5,
              borderRightWidth: 4,
            }}
          >
            {LANE_GLYPHS[lane]}
          </button>
        ))}
      </div>
    </div>
  );
}
