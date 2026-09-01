import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { burstFinale } from "@/game/confetti";
import { asset } from "@/lib/asset";
import { useScore } from "@/hooks/use-score";
import { useAuth } from "@/lib/auth-context";
import { Leaderboard } from "@/components/leaderboard";
import songsData from "@/game/data/music-match.json";

// ─── Songs ──────────────────────────────────────────────────────────────────
type Song = { country: string; flag: string; audio: string; image: string };
const SONGS: Song[] = (
  songsData as { country: string; flag: string; audio: string; image: string }[]
).map((s) => ({
  country: s.country,
  flag: s.flag,
  audio: s.audio,
  image: s.image,
}));

function slugify(country: string) {
  return country
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
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
const TRACK_HEIGHT = 400;
const HIT_LINE_Y = 336;
const MIN_BPM = 70;
const MAX_BPM = 180;
const FIRST_NOTE_MIN_TIME = 0.3; // skip a beat that lands before the player could react

type Note = {
  id: number;
  time: number;
  lane: number;
  judged: boolean;
  result: "perfect" | "good" | "miss" | null;
};

type VisibleNote = {
  id: number;
  lane: number;
  top: number;
};

type HitResult = "perfect" | "good" | "miss";
type HitEffect = { id: number; lane: number; result: HitResult };

const RESULT_COLOR: Record<HitResult, string> = {
  perfect: "#FFD93D",
  good: "#6BCB77",
  miss: "#FF6B6B",
};
const RESULT_LABEL: Record<HitResult, string> = {
  perfect: "PERFECT!",
  good: "GOOD",
  miss: "MISS",
};

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
  for (let i = 0; i < s.length; i++)
    h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return h;
}

// Every country gets its own vivid, high-contrast accent — deterministic
// per name, spread evenly around the hue wheel so no two songs look alike.
function countryHue(country: string): number {
  return Math.abs(hashString(country)) % 360;
}
function countryAccent(country: string): string {
  return `hsl(${countryHue(country)}, 75%, 58%)`;
}

// ─── Beat tracking ──────────────────────────────────────────────────────────
// No BPM is provided — it's estimated straight from the audio. This is the
// standard two-step approach: (1) turn the waveform into an "onset strength"
// curve that spikes on every drum hit / pluck / transient, then (2)
// autocorrelate that curve to find the periodicity (the tempo) and the phase
// (where the first beat falls), so notes land on the song's actual pulse
// instead of on arbitrary loud moments.

// Step 1: onset strength envelope — half-wave-rectified energy difference
// between consecutive short windows. A window is "loud" right when
// something percussive just started.
function computeOnsetFlux(buffer: AudioBuffer): {
  flux: Float32Array;
  energy: Float32Array;
  hopSeconds: number;
} {
  const channelCount = buffer.numberOfChannels;
  const length = buffer.length;
  const sampleRate = buffer.sampleRate;
  const mono = new Float32Array(length);
  for (let c = 0; c < channelCount; c++) {
    const data = buffer.getChannelData(c);
    for (let i = 0; i < length; i++) mono[i] += data[i] / channelCount;
  }

  const windowSize = 1024;
  const hopSize = 512;
  const hopCount = Math.max(0, Math.floor((length - windowSize) / hopSize));
  const energy = new Float32Array(hopCount);
  for (let h = 0; h < hopCount; h++) {
    const base = h * hopSize;
    let sum = 0;
    for (let i = 0; i < windowSize; i++) {
      const s = mono[base + i];
      sum += s * s;
    }
    energy[h] = sum / windowSize;
  }

  const flux = new Float32Array(hopCount);
  for (let h = 1; h < hopCount; h++) {
    flux[h] = Math.max(0, energy[h] - energy[h - 1]);
  }

  return { flux, energy, hopSeconds: hopSize / sampleRate };
}

// Many of these recordings have a reverb tail or trailing silence baked into
// the file after the last real hit. Find where the audible content actually
// stops so the beat grid doesn't keep ticking into dead air.
function findContentEnd(energy: Float32Array, hopSeconds: number): number {
  let peak = 0;
  for (let i = 0; i < energy.length; i++)
    if (energy[i] > peak) peak = energy[i];
  if (peak <= 0) return energy.length * hopSeconds;

  const floor = peak * 0.06;
  for (let i = energy.length - 1; i >= 0; i--) {
    if (energy[i] > floor) return (i + 1) * hopSeconds;
  }
  return energy.length * hopSeconds;
}

// Step 2: autocorrelate the onset curve to find the strongest periodicity
// within a sane BPM range, then find the phase offset that lines a fixed
// grid at that period up with the actual onsets.
function estimateBeatGrid(
  flux: Float32Array,
  hopSeconds: number,
): { period: number; phase: number } {
  const minLag = Math.max(1, Math.round(60 / MAX_BPM / hopSeconds));
  const maxLag = Math.max(minLag + 1, Math.round(60 / MIN_BPM / hopSeconds));

  // Mean product per lag, not the raw sum — a shorter lag always has more
  // overlapping pairs to sum over, which would otherwise bias the search
  // toward faster tempos regardless of which one is actually strongest.
  const meanScore = (lag: number) => {
    let sum = 0;
    let count = 0;
    for (let i = 0; i + lag < flux.length; i++) {
      sum += flux[i] * flux[i + lag];
      count++;
    }
    return count > 0 ? sum / count : 0;
  };

  let bestLag = minLag;
  let bestScore = -Infinity;
  for (let lag = minLag; lag <= maxLag; lag++) {
    const score = meanScore(lag);
    if (score > bestScore) {
      bestScore = score;
      bestLag = lag;
    }
  }

  // Octave-error correction: autocorrelation often locks onto a subdivision
  // faster than the true beat — half time in a duple groove, or a third-time
  // in a 3/4 waltz where the "oom" downbeat dominates the quieter "pah-pah".
  // If 2x or 3x this period scores nearly as well, prefer the slowest one
  // that still clears the bar — sparser and more likely the felt pulse.
  let correctedLag = bestLag;
  let correctedScore = bestScore;
  for (const mult of [2, 3]) {
    const lag = bestLag * mult;
    if (lag > maxLag || lag <= correctedLag) continue;
    const score = meanScore(lag);
    if (score >= bestScore * 0.72) {
      correctedLag = lag;
      correctedScore = score;
    }
  }
  bestLag = correctedLag;
  bestScore = correctedScore;

  const phaseSums = new Float32Array(bestLag);
  for (let i = 0; i < flux.length; i++) phaseSums[i % bestLag] += flux[i];
  let bestPhase = 0;
  let bestPhaseScore = -Infinity;
  for (let p = 0; p < bestLag; p++) {
    if (phaseSums[p] > bestPhaseScore) {
      bestPhaseScore = phaseSums[p];
      bestPhase = p;
    }
  }

  return { period: bestLag * hopSeconds, phase: bestPhase * hopSeconds };
}

// Step 3: a real performance drifts from a perfect metronome — the singer
// rushes a bar, a drummer drags a fill. After locking the overall tempo and
// phase, nudge every beat to the loudest actual onset in a small window
// around it, so each note lines up with what's really audible there instead
// of a rigid mathematical grid. A beat with nothing audible nearby (a rest,
// a lead-in, the tail of a fade) is dropped rather than forced onto silence.
function snapToOnsets(
  times: number[],
  flux: Float32Array,
  hopSeconds: number,
  period: number,
  minFlux: number,
): number[] {
  const snapWindow = Math.min(0.09, period * 0.18);
  const snapHops = Math.max(1, Math.round(snapWindow / hopSeconds));
  const snapped: number[] = [];
  for (const t of times) {
    const centerHop = Math.round(t / hopSeconds);
    let bestHop = centerHop;
    let bestVal = -Infinity;
    for (let h = centerHop - snapHops; h <= centerHop + snapHops; h++) {
      if (h < 0 || h >= flux.length) continue;
      if (flux[h] > bestVal) {
        bestVal = flux[h];
        bestHop = h;
      }
    }
    if (bestVal < minFlux) continue;
    snapped.push(bestHop * hopSeconds);
  }
  return snapped;
}

// Estimates tempo + phase from the audio, lays a note on every beat of that
// grid up through where the audible content actually ends, then snaps each
// one onto the nearest real onset so notes cross the hit line exactly when
// the beat lands — and the song never keeps dealing notes into silence.
function detectBeats(buffer: AudioBuffer): number[] {
  const { flux, energy, hopSeconds } = computeOnsetFlux(buffer);
  if (flux.length < 8) return [];
  const { period, phase } = estimateBeatGrid(flux, hopSeconds);
  const contentEnd = findContentEnd(energy, hopSeconds);

  let peakFlux = 0;
  for (let i = 0; i < flux.length; i++)
    if (flux[i] > peakFlux) peakFlux = flux[i];
  const minFlux = peakFlux * 0.04;

  const rawTimes: number[] = [];
  for (let t = phase; t < contentEnd; t += period) {
    if (t >= FIRST_NOTE_MIN_TIME) rawTimes.push(t);
  }
  return snapToOnsets(rawTimes, flux, hopSeconds, period, minFlux);
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
  const [hitEffects, setHitEffects] = useState<HitEffect[]>([]);

  // Immersive full-bleed backdrop: the chosen country's illustration once a
  // song is picked, otherwise a random one for the picker screen so the game
  // never opens onto a flat page.
  const idleBackground = useMemo(
    () => SONGS[Math.floor(Math.random() * SONGS.length)].image,
    [],
  );
  const backgroundImage = song?.image ?? idleBackground;

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
  const hitEffectKeyRef = useRef(0);

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

  useEffect(
    () => () => {
      stopPlayback();
      audioCtxRef.current?.close().catch(() => {});
    },
    [stopPlayback],
  );

  const finishSong = useCallback(() => {
    stopPlayback();
    setPhase("results");
    if (scoreRef.current > 0) {
      burstFinale();
      saveScore(scoreRef.current, song ? slugify(song.country) : undefined);
    }
  }, [stopPlayback, saveScore, song]);

  const addHitEffect = useCallback((lane: number, result: HitResult) => {
    hitEffectKeyRef.current += 1;
    const id = hitEffectKeyRef.current;
    setHitEffects((prev) => [...prev, { id, lane, result }]);
  }, []);

  const removeHitEffect = useCallback((id: number) => {
    setHitEffects((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const registerHit = useCallback(
    (note: Note, result: "perfect" | "good") => {
      note.judged = true;
      note.result = result;
      comboRef.current += 1;
      if (comboRef.current > maxComboRef.current)
        maxComboRef.current = comboRef.current;
      const mult =
        comboRef.current >= 20
          ? 4
          : comboRef.current >= 10
            ? 3
            : comboRef.current >= 5
              ? 2
              : 1;
      const base = result === "perfect" ? 100 : 50;
      scoreRef.current += base * mult;
      tallyRef.current = {
        ...tallyRef.current,
        [result]: tallyRef.current[result] + 1,
      };
      setScore(scoreRef.current);
      setCombo(comboRef.current);
      setMaxCombo(maxComboRef.current);
      setTally(tallyRef.current);
      addHitEffect(note.lane, result);
    },
    [addHitEffect],
  );

  const registerMiss = useCallback(
    (note: Note) => {
      note.judged = true;
      note.result = "miss";
      comboRef.current = 0;
      tallyRef.current = {
        ...tallyRef.current,
        miss: tallyRef.current.miss + 1,
      };
      setCombo(0);
      setTally(tallyRef.current);
      addHitEffect(note.lane, "miss");
    },
    [addHitEffect],
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
        registerHit(
          candidate,
          Math.abs(diff) <= PERFECT_WINDOW ? "perfect" : "good",
        );
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
    while (
      mp < notes.length &&
      !notes[mp].judged &&
      elapsed - notes[mp].time > GOOD_WINDOW
    ) {
      registerMiss(notes[mp]);
      mp++;
    }
    missPointerRef.current = mp;

    const nextVisible: VisibleNote[] = [];
    for (const n of notes) {
      if (n.judged) continue;
      const untilHit = n.time - elapsed;
      if (untilHit > TRAVEL_TIME + 0.15) break;
      // Notes past due sit pinned on the receptor (progress clamped to 1)
      // until the auto-miss sweep above judges them next tick.
      const progress = Math.min(1, Math.max(0, 1 - untilHit / TRAVEL_TIME));
      nextVisible.push({ id: n.id, lane: n.lane, top: progress * HIT_LINE_Y });
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
      setHitEffects([]);

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

  let body: React.ReactNode;

  // ─── Select screen ──────────────────────────────────────────────────────
  if (phase === "select") {
    body = (
      <div className="flex flex-col items-center gap-8 px-4 py-8">
        <div className="text-center">
          <div className="mb-2 text-5xl">🥁</div>
          <h1 className="text-3xl font-extrabold">Rhythm Tap!</h1>
          <p className="mt-1 text-sm text-ink/60">
            Pick a country's song — tap the lanes in time with the beat!
          </p>
          {loadError && (
            <p className="mt-2 text-sm font-bold text-red-500">{loadError}</p>
          )}
        </div>

        <div className="grid max-w-3xl grid-cols-2 gap-3 sm:grid-cols-4">
          {SONGS.map((s) => {
            const hue = countryHue(s.country);
            return (
              <button
                key={s.country}
                onClick={() => selectSong(s)}
                className="flex flex-col items-center gap-2 rounded-[1.5rem] border-[3px] px-4 py-4 transition-transform hover:-translate-y-1 active:translate-y-0"
                style={{
                  background: `hsl(${hue}, 85%, 95%)`,
                  borderColor: `hsl(${hue}, 60%, 72%)`,
                  borderBottomWidth: 6,
                  borderRightWidth: 5,
                }}
              >
                <span className="text-3xl">{s.flag}</span>
                <span className="text-center text-xs font-extrabold leading-tight">
                  {s.country}
                </span>
              </button>
            );
          })}
        </div>

        <p className="max-w-xs text-center text-xs text-ink/40">
          Use the on-screen buttons or the ← ↓ → arrow keys to hit the notes!
        </p>
      </div>
    );

  // ─── Loading screen ─────────────────────────────────────────────────────
  } else if (phase === "loading") {
    body = (
      <div className="flex flex-col items-center gap-4 px-4 py-8 text-center">
        <div className="text-5xl">{song?.flag}</div>
        <p className="text-sm font-bold text-ink/60">
          Learning the beat of {song?.country}'s song…
        </p>
        <motion.div
          className="h-2 w-40 rounded-full bg-ink/10"
          initial={{ opacity: 0.4 }}
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ repeat: Infinity, duration: 1.1 }}
        />
      </div>
    );

  // ─── Countdown screen ───────────────────────────────────────────────────
  } else if (phase === "countdown") {
    body = (
      <div className="flex flex-col items-center gap-4 px-4 py-8 text-center">
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

  // ─── Results screen ─────────────────────────────────────────────────────
  } else if (phase === "results") {
    const totalNotes = tally.perfect + tally.good + tally.miss;
    const accuracy =
      totalNotes > 0
        ? Math.round(((tally.perfect + tally.good) / totalNotes) * 100)
        : 0;
    const grade =
      GRADES.find((g) => accuracy >= g.min) ?? GRADES[GRADES.length - 1];

    body = (
      <div className="flex flex-col items-center gap-5 px-4 py-8 text-center">
        <div className="text-5xl">{song?.flag}</div>
        <h2 className="text-2xl font-extrabold">
          {song?.country} — Song Complete!
        </h2>

        <div
          className="flex items-center justify-center rounded-full border-[3px] border-ink text-4xl font-extrabold"
          style={{
            background: grade.color,
            width: 88,
            height: 88,
            borderBottomWidth: 6,
            borderRightWidth: 5,
          }}
        >
          {grade.label}
        </div>

        <div
          className="rounded-2xl border-[3px] border-ink px-6 py-2 text-xl font-extrabold"
          style={{
            background: "#FFD93D33",
            borderBottomWidth: 5,
            borderRightWidth: 4,
          }}
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
          style={{
            background: "#1a1a2e",
            borderBottomWidth: 6,
            borderRightWidth: 5,
          }}
        >
          <div className="mb-1 text-[0.6rem] font-extrabold uppercase tracking-[0.2em] text-gray-500">
            🏆 Top Scores — {song?.country}
          </div>
          {user ? (
            <p
              className="mb-2 text-xs font-bold"
              style={{
                color: saving ? "#9ca3af" : saved ? "#4ade80" : "transparent",
              }}
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
          <Leaderboard
            gameSlug="rhythm-tap"
            difficulty={song ? slugify(song.country) : undefined}
            limit={5}
            theme="dark"
          />
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            onClick={playAgain}
            className="rounded-full border-[3px] border-ink px-8 py-2 text-sm font-extrabold transition-transform hover:-translate-y-0.5"
            style={{
              background: "#6BCB77",
              borderBottomWidth: 5,
              borderRightWidth: 4,
            }}
          >
            Play Again
          </button>
          <button
            onClick={() => setPhase("select")}
            className="rounded-full border-[3px] border-ink px-8 py-2 text-sm font-extrabold transition-transform hover:-translate-y-0.5"
            style={{
              background: "#e5e7eb",
              borderBottomWidth: 5,
              borderRightWidth: 4,
            }}
          >
            Choose Another Song
          </button>
        </div>
      </div>
    );

  // ─── Playing screen ─────────────────────────────────────────────────────
  } else {
    const accent = countryAccent(song?.country ?? "");
    body = (
      <div className="flex flex-col items-center gap-4 px-4 py-6">
      <div className="flex w-full max-w-md items-center justify-between text-sm font-extrabold">
        <span>
          {song?.flag} {song?.country}
        </span>
        <span>🏆 {score.toLocaleString()}</span>
        <span style={{ color: combo >= 5 ? "#FFD93D" : undefined }}>
          🔥 {combo}
        </span>
      </div>

      <div
        className="relative w-full max-w-md overflow-hidden rounded-[1.5rem] border-[3px]"
        style={{
          height: TRACK_HEIGHT,
          background: "#111827",
          borderColor: accent,
          borderBottomWidth: 6,
          borderRightWidth: 5,
          boxShadow: `0 0 28px -6px ${accent}`,
        }}
      >
        {/* per-country ripple + badge — a music-themed design that varies
            by country without depending on how big emoji happen to render */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="absolute rounded-full border-2"
              style={{
                borderColor: accent,
                width: 100 + i * 64,
                height: 100 + i * 64,
                opacity: 0.16 - i * 0.03,
              }}
              animate={{ scale: [1, 1.05, 1] }}
              transition={{
                repeat: Infinity,
                duration: 3 + i * 0.6,
                ease: "easeInOut",
              }}
            />
          ))}
          <div
            className="flex h-14 w-14 items-center justify-center rounded-full text-2xl"
            style={{
              background: `${accent}22`,
              border: `2px solid ${accent}66`,
            }}
          >
            {song?.flag}
          </div>
        </div>
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: `radial-gradient(circle at 50% 20%, ${accent}26, transparent 65%)`,
          }}
        />

        {/* lane dividers */}
        <div className="absolute inset-0 flex">
          {Array.from({ length: LANE_COUNT }).map((_, i) => (
            <div
              key={i}
              className="flex-1 border-white/5"
              style={{ borderRightWidth: i < LANE_COUNT - 1 ? 1 : 0 }}
            />
          ))}
        </div>

        {/* hit line */}
        <div
          className="absolute left-0 right-0 border-t-2 border-dashed border-white/20"
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
                background: LANE_COLORS[n.lane],
                borderBottomWidth: 4,
                borderRightWidth: 3,
              }}
            />
          </div>
        ))}

        {/* target receptors — this is exactly where you tap the note */}
        {Array.from({ length: LANE_COUNT }).map((_, lane) => (
          <div
            key={lane}
            className="absolute"
            style={{
              left: `${((lane + 0.5) / LANE_COUNT) * 100}%`,
              top: HIT_LINE_Y,
              width: 56,
              height: 56,
              transform: "translate(-50%, -50%)",
            }}
          >
            <motion.div
              className="absolute inset-0 rounded-full border-[3px]"
              style={{ borderColor: LANE_COLORS[lane] }}
              animate={{ scale: [1, 1.08, 1], opacity: [0.5, 0.85, 0.5] }}
              transition={{ repeat: Infinity, duration: 1 }}
            />
            <AnimatePresence>
              {hitEffects
                .filter((e) => e.lane === lane)
                .map((e) => (
                  <motion.div
                    key={e.id}
                    className="pointer-events-none absolute inset-0"
                  >
                    <motion.div
                      className="absolute inset-0 rounded-full border-4"
                      style={{ borderColor: RESULT_COLOR[e.result] }}
                      initial={{ scale: 0.6, opacity: 1 }}
                      animate={{ scale: 2, opacity: 0 }}
                      transition={{ duration: 0.45, ease: "easeOut" }}
                      onAnimationComplete={() => removeHitEffect(e.id)}
                    />
                    <motion.div
                      className="absolute left-1/2 whitespace-nowrap text-xs font-extrabold"
                      style={{ color: RESULT_COLOR[e.result], bottom: "100%" }}
                      initial={{ opacity: 1, y: 0, x: "-50%" }}
                      animate={{ opacity: 0, y: -22, x: "-50%" }}
                      transition={{ duration: 0.5 }}
                    >
                      {RESULT_LABEL[e.result]}
                    </motion.div>
                  </motion.div>
                ))}
            </AnimatePresence>
          </div>
        ))}
      </div>

      {/* tap buttons */}
      <div className="flex w-full max-w-md gap-3">
        {Array.from({ length: LANE_COUNT }).map((_, lane) => (
          <button
            key={lane}
            onPointerDown={() => handleLane(lane)}
            className="flex-1 rounded-2xl border-[3px] border-ink py-5 text-2xl font-extrabold transition-transform active:translate-y-0.5"
            style={{
              background:
                flashLane === lane ? LANE_SHADOWS[lane] : LANE_COLORS[lane],
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

  return (
    <div className="relative h-full overflow-hidden">
      {/* Full-bleed Jangles-world backdrop, mirroring the Colour Mix treatment */}
      <AnimatePresence mode="wait">
        <motion.img
          key={backgroundImage}
          src={asset(`/${backgroundImage}`)}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
        />
      </AnimatePresence>
      <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/25 to-black/50" />

      {/* The screen, floating centred over the backdrop */}
      <div className="relative z-10 flex h-full items-center justify-center overflow-y-auto px-4 py-6">
        <div
          className="w-full max-w-3xl rounded-[2rem] border-[3px] border-ink bg-paper/95 backdrop-blur-sm shadow-2xl"
          style={{ borderBottomWidth: 8, borderRightWidth: 6 }}
        >
          {body}
        </div>
      </div>
    </div>
  );
}
