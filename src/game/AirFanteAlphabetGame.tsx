import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { asset } from "@/lib/asset";
import { useScore } from "@/hooks/use-score";
import { useAuth } from "@/lib/auth-context";
import { burstCorrect, burstFinale } from "@/game/confetti";

// ── NATO phonetic alphabet ─────────────────────────────────────────────────────
type NatoEntry = { letter: string; word: string; accept: string[] };

const NATO: NatoEntry[] = [
  { letter: "A", word: "Alpha",    accept: ["alpha", "alfa"] },
  { letter: "B", word: "Bravo",    accept: ["bravo", "brava"] },
  { letter: "C", word: "Charlie",  accept: ["charlie", "charley", "charly"] },
  { letter: "D", word: "Delta",    accept: ["delta"] },
  { letter: "E", word: "Echo",     accept: ["echo", "ecco"] },
  { letter: "F", word: "Foxtrot",  accept: ["foxtrot", "fox trot"] },
  { letter: "G", word: "Golf",     accept: ["golf", "gulf"] },
  { letter: "H", word: "Hotel",    accept: ["hotel"] },
  { letter: "I", word: "India",    accept: ["india"] },
  { letter: "J", word: "Juliett",  accept: ["juliett", "juliet", "juliette", "julia"] },
  { letter: "K", word: "Kilo",     accept: ["kilo", "kylo", "keylo"] },
  { letter: "L", word: "Lima",     accept: ["lima", "leema"] },
  { letter: "M", word: "Mike",     accept: ["mike", "mic", "mick", "mikey"] },
  { letter: "N", word: "November", accept: ["november"] },
  { letter: "O", word: "Oscar",    accept: ["oscar"] },
  { letter: "P", word: "Papa",     accept: ["papa", "poppa", "pappa"] },
  { letter: "Q", word: "Quebec",   accept: ["quebec", "kebec", "cubec"] },
  { letter: "R", word: "Romeo",    accept: ["romeo"] },
  { letter: "S", word: "Sierra",   accept: ["sierra", "siera", "ciara"] },
  { letter: "T", word: "Tango",    accept: ["tango", "tengo"] },
  { letter: "U", word: "Uniform",  accept: ["uniform"] },
  { letter: "V", word: "Victor",   accept: ["victor", "victer"] },
  { letter: "W", word: "Whiskey",  accept: ["whiskey", "whisky"] },
  { letter: "X", word: "X-ray",    accept: ["x-ray", "xray", "x ray"] },
  { letter: "Y", word: "Yankee",   accept: ["yankee", "yankees", "yanky"] },
  { letter: "Z", word: "Zulu",     accept: ["zulu", "zoolu"] },
];

const ROUNDS = 8;
const LETTERS_PER_CALL_SIGN = 3;
const POINTS_PER_LETTER = 10;
const MAX_LISTEN_MS = 10000;

type Difficulty = "rookie" | "master";
type Phase = "select" | "playing" | "over";
type RoundResult = "correct" | "wrong" | null;
type MicState = "idle" | "listening" | "processing";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildRounds(): NatoEntry[][] {
  const rounds: NatoEntry[][] = [];
  let pool = shuffle(NATO);
  for (let i = 0; i < ROUNDS; i++) {
    if (pool.length < LETTERS_PER_CALL_SIGN) pool = shuffle(NATO);
    rounds.push(pool.splice(0, LETTERS_PER_CALL_SIGN));
  }
  return rounds;
}

// Checks that each expected phonetic word (or an accepted variant) appears in
// the transcript, in call-sign order.
function matchesCallSign(transcript: string, letters: NatoEntry[]): boolean {
  const t = " " + transcript.toLowerCase().replace(/[^a-z]+/g, " ") + " ";
  let pos = 0;
  for (const entry of letters) {
    let best = -1;
    for (const alt of entry.accept) {
      const needle = " " + alt.replace(/[^a-z]+/g, " ") + " ";
      const idx = t.indexOf(needle, pos);
      if (idx !== -1 && (best === -1 || idx < best)) best = idx;
    }
    if (best === -1) return false;
    pos = best + 1;
  }
  return true;
}

// ── Radio audio engine ─────────────────────────────────────────────────────────
let audioCtx: AudioContext | null = null;
function getCtx(): AudioContext {
  if (!audioCtx) {
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    audioCtx = new Ctor();
  }
  return audioCtx;
}

function makeDistortionCurve(amount: number): Float32Array<ArrayBuffer> {
  const n = 256;
  const curve = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const x = (i * 2) / n - 1;
    curve[i] = ((3 + amount) * x * 20 * (Math.PI / 180)) / (Math.PI + amount * Math.abs(x));
  }
  return curve;
}

// Very soft, short radio key click — kept quiet so it never reads as a drum hit.
function playKeyClick(delaySec = 0) {
  const ctx = getCtx();
  void ctx.resume();
  const dur = 0.035;
  const buf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * dur), ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
  const src = ctx.createBufferSource();
  src.buffer = buf;
  const bp = ctx.createBiquadFilter();
  bp.type = "bandpass";
  bp.frequency.value = 2400;
  bp.Q.value = 1.4;
  const gain = ctx.createGain();
  gain.gain.value = 0.05;
  src.connect(bp);
  bp.connect(gain);
  gain.connect(ctx.destination);
  src.start(ctx.currentTime + delaySec);
}

// Plays a recorded clip through a walkie-talkie chain: narrow bandpass,
// a touch of overdrive, and a quiet static bed underneath.
async function playThroughRadio(blob: Blob): Promise<void> {
  const ctx = getCtx();
  await ctx.resume();
  const buf = await ctx.decodeAudioData(await blob.arrayBuffer());

  playKeyClick(0);

  const src = ctx.createBufferSource();
  src.buffer = buf;
  const hp = ctx.createBiquadFilter();
  hp.type = "highpass";
  hp.frequency.value = 400;
  const lp = ctx.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.value = 2600;
  const shaper = ctx.createWaveShaper();
  shaper.curve = makeDistortionCurve(16);
  const gain = ctx.createGain();
  gain.gain.value = 1.6;
  src.connect(hp);
  hp.connect(lp);
  lp.connect(shaper);
  shaper.connect(gain);
  gain.connect(ctx.destination);

  const staticDur = buf.duration + 0.2;
  const nbuf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * staticDur), ctx.sampleRate);
  const ndata = nbuf.getChannelData(0);
  for (let i = 0; i < ndata.length; i++) ndata[i] = Math.random() * 2 - 1;
  const noise = ctx.createBufferSource();
  noise.buffer = nbuf;
  const ngain = ctx.createGain();
  ngain.gain.value = 0.008;
  noise.connect(ngain);
  ngain.connect(ctx.destination);

  const t0 = ctx.currentTime + 0.1;
  noise.start(t0);
  src.start(t0 + 0.05);

  await new Promise<void>((resolve) => {
    src.onended = () => resolve();
  });
}

// Tower voice — plain TTS, no static bursts.
function towerSay(text: string, onEnd?: () => void) {
  if (!window.speechSynthesis) {
    onEnd?.();
    return;
  }
  window.speechSynthesis.cancel();
  const utt = new SpeechSynthesisUtterance(text);
  utt.rate = 0.92;
  utt.pitch = 0.85;
  if (onEnd) {
    utt.onend = onEnd;
    utt.onerror = onEnd;
  }
  window.speechSynthesis.speak(utt);
}

// ── Speech recognition (Chrome/Edge webkit prefix) ─────────────────────────────
type SpeechRecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  onresult: ((event: { resultIndex: number; results: ArrayLike<{ isFinal: boolean; 0: { transcript: string } }> }) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
};

function getSpeechRecognitionCtor(): (new () => SpeechRecognitionLike) | null {
  const w = window as unknown as {
    SpeechRecognition?: new () => SpeechRecognitionLike;
    webkitSpeechRecognition?: new () => SpeechRecognitionLike;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

// ── Alphabet reference chart (shown on Rookie) ─────────────────────────────────
function NatoChart() {
  return (
    <div className="w-full max-w-2xl rounded-2xl border-2 border-sky-700/50 bg-white/90 px-2 py-2 mb-3 shadow-sm">
      <div className="grid grid-cols-4 sm:grid-cols-7 gap-x-1 gap-y-0.5">
        {NATO.map((n) => (
          <div key={n.letter} className="flex items-baseline gap-1 justify-center whitespace-nowrap text-[10px] sm:text-xs leading-tight">
            <span className="font-black text-sky-700">{n.letter}</span>
            <span className="font-semibold text-gray-600">{n.word}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Component ──────────────────────────────────────────────────────────────────
export function AirFanteAlphabetGame() {
  const [phase, setPhase] = useState<Phase>("select");
  const [difficulty, setDifficulty] = useState<Difficulty>("rookie");
  const [rounds, setRounds] = useState<NatoEntry[][]>([]);
  const [roundIdx, setRoundIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [micState, setMicState] = useState<MicState>("idle");
  const [result, setResult] = useState<RoundResult>(null);
  const [heard, setHeard] = useState("");
  const [micError, setMicError] = useState("");
  const [hasRecording, setHasRecording] = useState(false);
  const [radioPlaying, setRadioPlaying] = useState(false);

  const speechSupported = getSpeechRecognitionCtor() !== null;

  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const blobRef = useRef<Blob | null>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const transcriptRef = useRef("");
  const holdingRef = useRef(false);
  const recognitionDoneRef = useRef(true);
  const recorderDoneRef = useRef(true);
  const gradedRef = useRef(false);
  const listenTimeoutRef = useRef<number>(0);
  const micButtonRef = useRef<HTMLButtonElement>(null);

  const { user } = useAuth();
  const { saveScore } = useScore("air-fante-alphabet");

  const callSign = rounds[roundIdx] ?? [];

  useEffect(() => {
    if (phase === "over" && user && score > 0) saveScore(score);
  }, [phase, user, score, saveScore]);

  // Clean up mic + speech on unmount
  useEffect(() => {
    return () => {
      holdingRef.current = false;
      recognitionRef.current?.abort();
      streamRef.current?.getTracks().forEach((t) => t.stop());
      window.speechSynthesis?.cancel();
      window.clearTimeout(listenTimeoutRef.current);
    };
  }, []);

  const startGame = useCallback(async (diff: Difficulty) => {
    setMicError("");
    try {
      if (!streamRef.current && navigator.mediaDevices?.getUserMedia) {
        streamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
      }
    } catch {
      setMicError("Jangles Tower needs your microphone! Allow the mic and try again.");
      return;
    }
    setDifficulty(diff);
    setRounds(buildRounds());
    setRoundIdx(0);
    setScore(0);
    setResult(null);
    setHeard("");
    setHasRecording(false);
    setPhase("playing");
    towerSay("Jangles Tower to Air Fante. Read back your call sign. Over.");
  }, []);

  const grade = useCallback(() => {
    if (gradedRef.current) return;
    if (!recognitionDoneRef.current || !recorderDoneRef.current) return;
    gradedRef.current = true;
    window.clearTimeout(listenTimeoutRef.current);

    const letters = rounds[roundIdx] ?? [];
    const transcript = transcriptRef.current.trim();
    setHeard(transcript);
    setHasRecording(blobRef.current !== null);
    setMicState("idle");

    const words = letters.map((l) => l.word).join(", ");
    if (transcript && matchesCallSign(transcript, letters)) {
      setResult("correct");
      setScore((s) => s + letters.length * POINTS_PER_LETTER);
      burstCorrect();
      const clip = blobRef.current;
      if (clip) {
        setRadioPlaying(true);
        void playThroughRadio(clip)
          .catch(() => {})
          .finally(() => setRadioPlaying(false));
      }
    } else {
      setResult("wrong");
      towerSay(transcript ? `Negative. That call sign reads: ${words}. Over.` : `Say again? Tower could not hear you. That call sign reads: ${words}. Over.`);
    }
  }, [rounds, roundIdx]);

  const stopListening = useCallback(() => {
    if (!holdingRef.current) return;
    holdingRef.current = false;
    setMicState("processing");
    playKeyClick(0);
    try {
      recognitionRef.current?.stop();
    } catch {
      recognitionDoneRef.current = true;
    }
    const rec = recorderRef.current;
    if (rec && rec.state !== "inactive") rec.stop();
    else recorderDoneRef.current = true;
    // Safety net in case onend never fires
    window.clearTimeout(listenTimeoutRef.current);
    listenTimeoutRef.current = window.setTimeout(() => {
      recognitionDoneRef.current = true;
      recorderDoneRef.current = true;
      grade();
    }, 3000);
  }, [grade]);

  const startListening = useCallback((e?: React.PointerEvent<HTMLButtonElement>) => {
    if (micState !== "idle" || result !== null) return;
    const Ctor = getSpeechRecognitionCtor();
    if (!Ctor) return;
    // Keep receiving pointer events even if the pointer drifts off the button
    // (e.g. when the button scales up under the finger).
    if (e) {
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch {}
    }
    window.speechSynthesis?.cancel();

    transcriptRef.current = "";
    blobRef.current = null;
    chunksRef.current = [];
    gradedRef.current = false;
    holdingRef.current = true;
    recognitionDoneRef.current = false;
    recorderDoneRef.current = true;

    const makeRecognition = () => {
      const recognition = new Ctor();
      recognition.lang = "en-US";
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.maxAlternatives = 3;
      recognition.onresult = (event) => {
        let finals = "";
        for (let i = 0; i < event.results.length; i++) {
          const r = event.results[i];
          if (r.isFinal) finals += " " + r[0].transcript;
        }
        // Fall back to interim text so a fast release still counts
        if (!finals.trim()) {
          for (let i = 0; i < event.results.length; i++) finals += " " + event.results[i][0].transcript;
        }
        const text = finals.trim();
        if (text) transcriptRef.current = text;
      };
      recognition.onend = () => {
        // Chrome ends recognition on its own after silence or hiccups —
        // restart it as long as the kid is still holding the mic.
        if (holdingRef.current) {
          try {
            const next = makeRecognition();
            recognitionRef.current = next;
            next.start();
            return;
          } catch {}
        }
        recognitionDoneRef.current = true;
        grade();
      };
      recognition.onerror = () => {};
      return recognition;
    };

    const recognition = makeRecognition();
    recognitionRef.current = recognition;

    const stream = streamRef.current;
    if (stream && typeof MediaRecorder !== "undefined") {
      try {
        const recorder = new MediaRecorder(stream);
        recorder.ondataavailable = (ev) => {
          if (ev.data.size > 0) chunksRef.current.push(ev.data);
        };
        recorder.onstop = () => {
          blobRef.current = new Blob(chunksRef.current, { type: recorderRef.current?.mimeType || "audio/webm" });
          recorderDoneRef.current = true;
          grade();
        };
        recorder.start();
        recorderRef.current = recorder;
        recorderDoneRef.current = false;
      } catch {
        recorderRef.current = null;
      }
    }

    playKeyClick(0);
    recognition.start();
    setMicState("listening");

    window.clearTimeout(listenTimeoutRef.current);
    listenTimeoutRef.current = window.setTimeout(() => stopListening(), MAX_LISTEN_MS);
  }, [micState, result, grade, stopListening]);

  // Hold the spacebar as an alternative to holding down the mic button.
  // (A held mouse/trackpad press can trigger macOS's own "Look Up" gesture
  // and pop open Dictionary — the spacebar has no such conflict.)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code !== "Space" || e.repeat || phase !== "playing") return;
      const active = document.activeElement;
      const isMicButton = active === micButtonRef.current;
      const isOtherControl =
        active instanceof HTMLElement && ["BUTTON", "INPUT", "TEXTAREA", "SELECT", "A"].includes(active.tagName) && !isMicButton;
      if (isOtherControl) return;
      e.preventDefault();
      startListening();
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code !== "Space") return;
      e.preventDefault();
      stopListening();
    };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [phase, startListening, stopListening]);

  const hearCallSign = useCallback(() => {
    const words = callSign.map((l) => l.word).join(", ");
    towerSay(`Your call sign is: ${words}. Over.`);
  }, [callSign]);

  const replayRecording = useCallback(() => {
    const clip = blobRef.current;
    if (!clip || radioPlaying) return;
    setRadioPlaying(true);
    void playThroughRadio(clip)
      .catch(() => {})
      .finally(() => setRadioPlaying(false));
  }, [radioPlaying]);

  const nextRound = useCallback(() => {
    window.speechSynthesis?.cancel();
    if (roundIdx + 1 >= rounds.length) {
      burstFinale();
      setPhase("over");
      return;
    }
    setRoundIdx((i) => i + 1);
    setResult(null);
    setHeard("");
    setHasRecording(false);
    blobRef.current = null;
  }, [roundIdx, rounds.length]);

  const answerByTap = useCallback(
    (correct: boolean) => {
      if (result !== null) return;
      const letters = rounds[roundIdx] ?? [];
      const words = letters.map((l) => l.word).join(", ");
      if (correct) {
        setResult("correct");
        setScore((s) => s + letters.length * POINTS_PER_LETTER);
        burstCorrect();
      } else {
        setResult("wrong");
        towerSay(`Negative. That call sign reads: ${words}. Over.`);
      }
    },
    [result, rounds, roundIdx],
  );

  // Tap-to-answer fallback choices for browsers without SpeechRecognition
  const [choices, setChoices] = useState<{ words: string; correct: boolean }[]>([]);
  useEffect(() => {
    if (speechSupported || callSign.length === 0) return;
    const correctWords = callSign.map((l) => l.word).join(" · ");
    const wrongs: string[] = [];
    while (wrongs.length < 2) {
      const fake = shuffle(NATO).slice(0, callSign.length).map((l) => l.word).join(" · ");
      if (fake !== correctWords && !wrongs.includes(fake)) wrongs.push(fake);
    }
    setChoices(shuffle([{ words: correctWords, correct: true }, ...wrongs.map((w) => ({ words: w, correct: false }))]));
  }, [speechSupported, callSign]);

  // ── Screens ──────────────────────────────────────────────────────────────────
  if (phase === "select") {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-10" style={{ background: "linear-gradient(#4ac8ff, #cdefff)" }}>
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <img src={asset("/characters/air-fante-plane.png")} alt="Air Fante" className="w-52 mx-auto mb-3 drop-shadow-lg" />
          <h1 className="text-4xl font-black text-white drop-shadow-md tracking-tight">Air Fante Alphabet</h1>
          <p className="text-sky-900 mt-2 text-lg font-semibold">Read the plane's call sign over the radio — like a real pilot! 📻</p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-xl">
          {(
            [
              { diff: "rookie" as const, title: "Rookie Pilot", desc: "The alphabet chart is on screen to help you read it back!", emoji: "🛩️" },
              { diff: "master" as const, title: "Captain", desc: "No chart — a true Captain knows the code by heart!", emoji: "✈️" },
            ]
          ).map(({ diff, title, desc, emoji }) => (
            <motion.button
              key={diff}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => void startGame(diff)}
              className="flex flex-col items-center gap-2 py-8 px-4 rounded-2xl border-2 border-b-4 border-sky-700 bg-white shadow-md cursor-pointer select-none"
            >
              <span className="text-5xl">{emoji}</span>
              <span className="font-black text-gray-800 text-xl">{title}</span>
              <span className="text-gray-500 text-sm">{desc}</span>
            </motion.button>
          ))}
        </div>

        {micError && <p className="mt-6 max-w-md text-center font-bold text-red-600 bg-white/80 rounded-xl px-4 py-2">{micError}</p>}
        {!speechSupported && (
          <p className="mt-6 max-w-md text-center text-sm font-semibold text-sky-900 bg-white/70 rounded-xl px-4 py-2">
            This browser can't hear your voice — you'll tap the answer instead. For the full radio game, use Chrome!
          </p>
        )}

        <Link to="/" className="mt-8 text-sky-900/70 hover:text-sky-900 text-sm underline">← Back to games</Link>
      </div>
    );
  }

  if (phase === "over") {
    const maxScore = ROUNDS * LETTERS_PER_CALL_SIGN * POINTS_PER_LETTER;
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-10 text-center" style={{ background: "linear-gradient(#4ac8ff, #cdefff)" }}>
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
          <img src={asset("/characters/air-fante-plane.png")} alt="Air Fante" className="w-44 mx-auto mb-4 drop-shadow-lg" />
          <h2 className="text-3xl font-black text-white drop-shadow-md">Flight complete! 🛬</h2>
          <p className="text-6xl font-black text-sky-900 my-4">{score} <span className="text-2xl">/ {maxScore}</span></p>
          <div className="flex gap-3 justify-center">
            <button onClick={() => setPhase("select")} className="rounded-2xl border-2 border-b-4 border-sky-700 bg-white px-6 py-3 font-black text-sky-800 shadow-md hover:-translate-y-0.5 transition-transform">
              Fly again ✈️
            </button>
            <Link to="/" className="rounded-2xl border-2 border-b-4 border-sky-700 bg-sky-600 px-6 py-3 font-black text-white shadow-md hover:-translate-y-0.5 transition-transform">
              Back to games
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  // ── Playing ──────────────────────────────────────────────────────────────────
  return (
    <div className="flex-1 flex flex-col items-center px-4 py-4 overflow-hidden" style={{ background: "linear-gradient(#4ac8ff 0%, #a5e2ff 70%, #cdefff 100%)" }}>
      {/* HUD */}
      <div className="w-full max-w-2xl flex items-center justify-between mb-2">
        <span className="rounded-xl bg-white/80 px-3 py-1 font-black text-sky-800">Plane {roundIdx + 1} / {rounds.length}</span>
        <span className="rounded-xl bg-white/80 px-3 py-1 font-black text-sky-800">⭐ {score}</span>
      </div>

      {/* Plane with call-sign banner */}
      <div className="relative w-full max-w-2xl h-36 sm:h-48">
        <AnimatePresence mode="wait">
          <motion.div
            key={roundIdx}
            initial={{ x: "110%", y: 20 }}
            animate={{ x: "0%", y: 0 }}
            exit={{ x: "-120%", y: -10 }}
            transition={{ type: "spring", stiffness: 60, damping: 14 }}
            className="absolute inset-0 flex items-center justify-center gap-0"
          >
            <div className="flex items-center rounded-xl border-4 border-sky-800 bg-yellow-300 px-4 py-2 shadow-lg -mr-2">
              <span className="font-black text-sky-900 tracking-[0.25em] text-4xl sm:text-5xl">
                {callSign.map((l) => l.letter).join("")}
              </span>
            </div>
            <div className="h-1.5 w-8 bg-sky-800 rounded-full" />
            <motion.img
              src={asset("/characters/air-fante-plane.png")}
              alt="Air Fante plane"
              className="w-40 sm:w-56 drop-shadow-xl"
              animate={{ y: [0, -8, 0] }}
              transition={{ repeat: Infinity, duration: 2.4, ease: "easeInOut" }}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Alphabet chart — Rookie only */}
      {difficulty === "rookie" && <NatoChart />}

      {/* Radio panel */}
      <div className="w-full max-w-2xl rounded-3xl border-4 border-slate-700 bg-slate-800 px-5 py-4 shadow-xl text-center">
        <p className="text-lime-300 font-mono font-bold text-sm sm:text-base mb-3 min-h-6">
          {result === null && micState === "idle" && "📡 Tower: “Air Fante, read back your call sign. Over.”"}
          {micState === "listening" && "🔴 TRANSMITTING… say the call sign!"}
          {micState === "processing" && "📻 Copying your transmission…"}
          {result === "correct" && `✅ ${callSign.map((l) => l.word).join(" · ")} — Loud and clear!`}
          {result === "wrong" && `❌ It reads: ${callSign.map((l) => l.word).join(" · ")}`}
        </p>
        {heard && result !== null && (
          <p className="text-slate-300 text-xs font-mono mb-3">Tower heard: “{heard}”</p>
        )}

        {result === null ? (
          speechSupported ? (
            <div className="flex flex-col items-center gap-2">
              <button
                ref={micButtonRef}
                onPointerDown={startListening}
                onPointerUp={stopListening}
                onPointerCancel={stopListening}
                onContextMenu={(e) => e.preventDefault()}
                className={`select-none touch-none rounded-full border-4 w-24 h-24 sm:w-28 sm:h-28 text-4xl sm:text-5xl shadow-lg transition-transform ${
                  micState === "listening"
                    ? "bg-red-500 border-red-700 scale-110 animate-pulse"
                    : micState === "processing"
                      ? "bg-slate-500 border-slate-600"
                      : "bg-lime-500 border-lime-700 hover:scale-105"
                }`}
              >
                🎙️
              </button>
              <p className="text-slate-300 text-sm font-bold">
                {micState === "listening" ? "Let go when you're done!" : micState === "processing" ? "Stand by…" : "HOLD the mic (or press SPACE) and read it back!"}
              </p>
              <button onClick={hearCallSign} className="text-sky-300 underline text-sm font-semibold">
                🎧 Hear the tower say it
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <p className="text-slate-300 text-sm font-bold mb-1">Tap the right call sign:</p>
              {choices.map((c) => (
                <button
                  key={c.words}
                  onClick={() => answerByTap(c.correct)}
                  className="w-full max-w-sm rounded-xl border-2 border-b-4 border-sky-600 bg-sky-500 py-2.5 font-black text-white hover:-translate-y-0.5 transition-transform"
                >
                  {c.words}
                </button>
              ))}
              <button onClick={hearCallSign} className="text-sky-300 underline text-sm font-semibold mt-1">
                🎧 Hear the tower say it
              </button>
            </div>
          )
        ) : (
          <div className="flex flex-wrap items-center justify-center gap-3">
            {hasRecording && (
              <button
                onClick={replayRecording}
                disabled={radioPlaying}
                className="rounded-xl border-2 border-b-4 border-amber-600 bg-amber-500 px-5 py-2.5 font-black text-white shadow-md hover:-translate-y-0.5 transition-transform disabled:opacity-50"
              >
                📻 {radioPlaying ? "On air…" : "Hear your radio call"}
              </button>
            )}
            <button
              onClick={nextRound}
              className="rounded-xl border-2 border-b-4 border-lime-700 bg-lime-500 px-5 py-2.5 font-black text-white shadow-md hover:-translate-y-0.5 transition-transform"
            >
              {roundIdx + 1 >= rounds.length ? "Land the plane 🛬" : "Next plane ✈️"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
