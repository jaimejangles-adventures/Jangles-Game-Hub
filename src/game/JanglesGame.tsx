import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import "./jangles-juke-box.css";
import { WaveformVisualizer } from "./WaveformVisualizer";
import { AnimatePresence, motion, useMotionValue } from "framer-motion";
import { Player } from "@lottiefiles/react-lottie-player";
import toast, { Toaster } from "react-hot-toast";
import { FACTS, PALETTE, flagCdnUrl, type Fact } from "./data/facts";
import { OpenMoji } from "./OpenMoji";
import { burstCorrect, burstFinale } from "./confetti";
import { useStamps } from "@/hooks/useStamps";
import { playCorrectExclamation, playIncorrectExclamation } from "./exclamations";
import { CountdownBar, WRONG_MS } from "./WrongFeedback";
import { asset } from "@/lib/asset";
import { useScore } from "@/hooks/use-score";
import { useAuth } from "@/lib/auth-context";
import { Leaderboard } from "@/components/leaderboard";

const LOTTIE = {
  sparkle: "https://assets2.lottiefiles.com/packages/lf20_obhph3sh.json",
  flame: "https://assets10.lottiefiles.com/packages/lf20_4kx2q32n.json",
  fireworks: "https://assets3.lottiefiles.com/packages/lf20_u4yrau.json",
};

// ──────────────────────────────────────────────────────────────────────────────
// Pure logic (ported from original index.html — behaviour preserved)
// ──────────────────────────────────────────────────────────────────────────────
function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function pickChoices(correct: Fact, all: Fact[]): Fact[] {
  const choices: Fact[] = [correct];
  shuffle(all.filter((f) => f.country !== correct.country)).forEach((f) => {
    if (choices.length < 4) choices.push(f);
  });
  return shuffle(choices);
}

function fmtTime(seconds: number): string {
  if (!Number.isFinite(seconds)) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

const palette = PALETTE;
const colorAt = (i: number) => palette[i % palette.length];

function buildTimedClues(round: Fact): string[] {
  return round.clues;
}

function musicFlagStyle(flag: string): React.CSSProperties | undefined {
  if (flag === "🇳🇵") return undefined;
  return { border: "2px solid #1a1a1a" };
}

function musicFlagClassName(flag: string, size: "small" | "medium"): string {
  if (flag === "🇳🇵") {
    return size === "medium"
      ? "h-8 w-auto max-w-12 object-contain"
      : "h-6 w-auto max-w-9 object-contain";
  }
  return size === "medium" ? "h-8 w-12 rounded-sm object-cover" : "h-6 w-9 rounded-sm object-cover";
}

// ──────────────────────────────────────────────────────────────────────────────
// Faded character backdrop — shown on boot + play screens
// ──────────────────────────────────────────────────────────────────────────────
const BG_CHARACTERS = [
  "/characters/guitar-jaime-jeff.png",
  "/characters/horns-jaime-jeff.png",
  "/characters/guitar2-jaime-jeff.png",
];
const BG_INSTANCES = [
  { src: BG_CHARACTERS[0], top: "2%",  left: "1%",   height: 180, rotate: -8  },
  { src: BG_CHARACTERS[1], top: "5%",  left: "72%",  height: 160, rotate: 6   },
  { src: BG_CHARACTERS[2], top: "1%",  left: "38%",  height: 170, rotate: -4  },
  { src: BG_CHARACTERS[0], top: "38%", left: "-2%",  height: 200, rotate: 10  },
  { src: BG_CHARACTERS[1], top: "35%", left: "80%",  height: 175, rotate: -7  },
  { src: BG_CHARACTERS[2], top: "55%", left: "45%",  height: 165, rotate: 5   },
  { src: BG_CHARACTERS[0], top: "68%", left: "18%",  height: 190, rotate: -5  },
  { src: BG_CHARACTERS[1], top: "72%", left: "62%",  height: 180, rotate: 8   },
  { src: BG_CHARACTERS[2], top: "82%", left: "-1%",  height: 170, rotate: -9  },
  { src: BG_CHARACTERS[0], top: "80%", left: "78%",  height: 185, rotate: 4   },
  { src: BG_CHARACTERS[1], top: "20%", left: "25%",  height: 155, rotate: -6  },
  { src: BG_CHARACTERS[2], top: "50%", left: "88%",  height: 160, rotate: 7   },
];
function BackgroundCircles() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[1] overflow-hidden">
      {BG_INSTANCES.map((c, i) => (
        <img
          key={i}
          src={c.src}
          alt=""
          style={{
            position: "absolute",
            top: c.top,
            left: c.left,
            height: c.height,
            width: "auto",
            transform: `rotate(${c.rotate}deg)`,
            opacity: 0.22,
            filter: "sepia(40%) saturate(70%) brightness(0.97)",
            objectFit: "contain",
          }}
        />
      ))}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Coastal beach scene backdrop — rendered inside the player card (absolute)
// ──────────────────────────────────────────────────────────────────────────────
function StorybookScene() {
  return (
    <div aria-hidden className="jjb-scene">
      <div className="jjb-cloud jjb-cloud-left" />
      <div className="jjb-cloud jjb-cloud-right" />
      <div className="jjb-hills" />
      <div className="jjb-sea" />
      <div className="jjb-sand" />
      <div className="jjb-house">
        <div className="jjb-house-roof" />
        <div className="jjb-house-upper">
          <span className="jjb-house-win" /><span className="jjb-house-win" /><span className="jjb-house-win" />
        </div>
        <div className="jjb-house-lower">
          <span className="jjb-house-win" /><span className="jjb-house-win" />
        </div>
      </div>
      <div className="jjb-palm jjb-palm-1" />
      <div className="jjb-palm jjb-palm-2" />
      <div className="jjb-plants jjb-plants-left" />
      <div className="jjb-plants jjb-plants-right" />
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// JANGLES JUKE BOX coloured title
// ──────────────────────────────────────────────────────────────────────────────
const TITLE_WORDS = [
  [["J","pink"],["A","yellow"],["N","blue"],["G","purple lowered"],["L","green"],["E","orange"],["S","red"]],
  [["J","blue"],["U","yellow"],["K","purple"],["E","green"]],
  [["B","orange"],["O","blue"],["X","pink"]],
] as const;

function JanglesJukeBoxTitle() {
  return (
    <h1 className="jjb-title" aria-label="Jangles Juke Box">
      {TITLE_WORDS.map((word, wi) => (
        <span className="jjb-title-word" key={wi}>
          {word.map(([letter, cls], li) => (
            <span className={`jjb-letter ${cls}`} key={`${letter}-${li}`}>{letter}</span>
          ))}
        </span>
      ))}
    </h1>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Multicolour chunky text
// ──────────────────────────────────────────────────────────────────────────────
function Multicolor({ text, className = "", offset = 0 }: { text: string; className?: string; offset?: number }) {
  return (
    <span className={`chunky-text ${className}`}>
      {[...text].map((ch, i) => (
        <span key={i} style={{ color: ch === " " ? "transparent" : colorAt(i + offset) }}>
          {ch}
        </span>
      ))}
    </span>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Toast helpers
// ──────────────────────────────────────────────────────────────────────────────
function blockToastStyle(c: string): React.CSSProperties {
  return {
    background: c,
    color: "#1a1a1a",
    border: "3px solid #1a1a1a",
    borderBottomWidth: 6,
    borderRightWidth: 5,
    borderRadius: 14,
    fontFamily: '"Baloo 2", system-ui, sans-serif',
    fontWeight: 800,
    padding: "10px 14px",
    boxShadow: "none",
  };
}

function showCorrectToast(points = 1) {
  const label = points === 3 ? "⚡ Fast! +3 pts" : points === 2 ? "+2 pts" : "+1 pt";
  toast.custom(() => (
    <div style={blockToastStyle("#22C55E")} className="flex items-center gap-3">
      <OpenMoji name="check" size={28} />
      <span>Nice match! {label}</span>
    </div>
  ));
}
function showWrongToast(correctCountry: string) {
  toast.custom(() => (
    <div style={blockToastStyle("#EF4444")}>
      <div className="flex items-center gap-3">
        <OpenMoji name="cross" size={28} />
        <span>Not quite — it was {correctCountry}.</span>
      </div>
      <CountdownBar ms={WRONG_MS} color="rgba(0,0,0,0.3)" />
    </div>
  ));
}
function showStreakToast(streak: number) {
  toast.custom(() => (
    <div style={blockToastStyle("#FBBF24")} className="flex items-center gap-3">
      <OpenMoji name="fire" size={28} />
      <span>{streak} in a row!</span>
    </div>
  ));
}

// ──────────────────────────────────────────────────────────────────────────────
// Main game
// ──────────────────────────────────────────────────────────────────────────────
type Phase = "boot" | "play" | "result";
type View = "play" | "facts";
type RoundStatus = "pending" | "correct" | "wrong";

export function JanglesGame({ onComplete }: { onComplete?: () => void } = {}) {
  const { user, openAuthModal } = useAuth();
  const { saveScore, saving, saved, reset: resetScore } = useScore("music-match");

  const [view, setView] = useState<View>("play");
  const [phase, setPhase] = useState<Phase>("boot");
  const [rounds, setRounds] = useState<Fact[]>([]);
  const [choicesByRound, setChoicesByRound] = useState<Fact[][]>([]);
  const [roundStatuses, setRoundStatuses] = useState<RoundStatus[]>([]);
  const [currentRound, setCurrentRound] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [missedThisRound, setMissedThisRound] = useState(false);
  const [wrongPicks, setWrongPicks] = useState<Set<string>>(new Set());
  const [showSparkle, setShowSparkle] = useState(false);
  const [showFlame, setShowFlame] = useState(false);
  const [collectedCountries, setCollectedCountries] = useState<Fact[]>([]);
  const [passportModalOpen, setPassportModalOpen] = useState(false);
  const [, addStamps] = useStamps();

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioErr, setAudioErr] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [hasStartedRound, setHasStartedRound] = useState(false);
  const [lastEarnedPoints, setLastEarnedPoints] = useState(0);

  const round = rounds[currentRound];
  const choices = choicesByRound[currentRound] ?? [];
  const isLast = currentRound === rounds.length - 1;

  // ── Game flow ──
  const startGame = useCallback(() => {
    resetScore();
    const r = shuffle(FACTS.filter((f) => f.audio));
    const c = r.map((round) => pickChoices(round, FACTS));
    setRounds(r);
    setChoicesByRound(c);
    setRoundStatuses(r.map(() => "pending"));
    setCurrentRound(0);
    setScore(0);
    setStreak(0);
    setAnswered(false);
    setMissedThisRound(false);
    setWrongPicks(new Set());
    setAudioErr(null);
    setHasStartedRound(false);
    setCollectedCountries([]);
    setPhase("play");
  }, [resetScore]);

  const resetToBoot = useCallback(() => {
    setPhase("boot");
    setRounds([]);
    setRoundStatuses([]);
    setCurrentRound(0);
    setScore(0);
    setStreak(0);
    setAnswered(false);
    setMissedThisRound(false);
    setWrongPicks(new Set());
    setCollectedCountries([]);
  }, []);

  const handlePick = useCallback(
    (country: string) => {
      if (answered || !round) return;
      const isCorrect = country === round.country;
      if (!isCorrect) {
        setMissedThisRound(true);
        setStreak(0);
        setWrongPicks((s) => new Set(s).add(country));
        showWrongToast(round.country);
        playIncorrectExclamation();
        return;
      }
      setAnswered(true);
      setRoundStatuses((statuses) =>
        statuses.map((status, index) =>
          index === currentRound ? (missedThisRound ? "wrong" : "correct") : status,
        ),
      );
      if (!missedThisRound) {
        setCollectedCountries((prev) => [...prev, round]);
      }
      playCorrectExclamation();
      const earnedPoints = missedThisRound ? 0
        : currentTime <= 3 ? 3
        : currentTime <= 6 ? 2
        : 1;
      setLastEarnedPoints(earnedPoints);
      if (!missedThisRound) {
        const newScore = score + earnedPoints;
        const newStreak = streak + 1;
        setScore(newScore);
        setStreak(newStreak);
        burstCorrect();
        setShowSparkle(true);
        window.setTimeout(() => setShowSparkle(false), 1400);
        showCorrectToast(earnedPoints);
        if (newStreak > 0 && newStreak % 5 === 0) {
          showStreakToast(newStreak);
          setShowFlame(true);
          window.setTimeout(() => setShowFlame(false), 1600);
        }
      } else {
        showCorrectToast(0);
      }
    },
    [answered, currentRound, round, missedThisRound, score, streak, currentTime],
  );

  const goNext = useCallback(() => {
    if (currentRound >= rounds.length - 1) {
      setPhase("result");
      addStamps(score);
      burstFinale();
      onComplete?.();
      return;
    }
    setCurrentRound((i) => i + 1);
    setAnswered(false);
    setMissedThisRound(false);
    setWrongPicks(new Set());
    setAudioErr(null);
    setCurrentTime(0);
    setDuration(0);
    setHasStartedRound(false);
  }, [currentRound, rounds.length, score, addStamps]);

  // Save score when game finishes
  useEffect(() => {
    if (phase === "result" && score > 0) saveScore(score);
  }, [phase, score, saveScore]);

  // ── Audio side effects ──
  useEffect(() => {
    const a = audioRef.current;
    if (!a || !round) return;
    a.src = asset("/"  + encodeURI(round.audio));
    a.load();
    setIsPlaying(false);
  }, [round]);

  // Loop the clip while the passport is showing so music keeps playing
  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    a.loop = answered;
  }, [answered]);

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    const onTime = () => {
      setCurrentTime(a.currentTime);
      setDuration(a.duration || 0);
    };
    const onMeta = () => setDuration(a.duration || 0);
    const onEnd = () => setIsPlaying(false);
    const onErr = () =>
      setAudioErr(round ? `The music file for ${round.country} could not load.` : "Audio failed to load.");
    a.addEventListener("timeupdate", onTime);
    a.addEventListener("loadedmetadata", onMeta);
    a.addEventListener("ended", onEnd);
    a.addEventListener("error", onErr);
    return () => {
      a.removeEventListener("timeupdate", onTime);
      a.removeEventListener("loadedmetadata", onMeta);
      a.removeEventListener("ended", onEnd);
      a.removeEventListener("error", onErr);
    };
  }, [round]);

  const togglePlay = useCallback(async () => {
    const a = audioRef.current;
    if (!a) return;
    if (a.paused) {
      try {
        await a.play();
        setIsPlaying(true);
        setHasStartedRound(true);
        setAudioErr(null);
      } catch {
        setAudioErr("This music could not start. Tap the play button again.");
      }
    } else {
      a.pause();
      setIsPlaying(false);
    }
  }, []);

  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    const a = audioRef.current;
    if (!a || !Number.isFinite(a.duration)) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    a.currentTime = ratio * a.duration;
  };


  const isPlayView = view !== "facts" && phase === "play";

  return (
    <div
      className="relative text-ink"
      style={{
        flex: "1 1 0",
        minHeight: 0,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        background: (isPlayView || phase === "boot") ? "#c2e8f5" : undefined,
      }}
    >
      <BackgroundCircles />
      <div className="relative z-[2]" style={{ display: "flex", flexDirection: "column", flex: "1 1 0", minHeight: 0 }}>
      <Toaster position="top-center" toastOptions={{ duration: WRONG_MS }} />

      {/* Lottie overlays */}
      <AnimatePresence>
        {showSparkle && (
          <motion.div
            key="sparkle"
            className="pointer-events-none fixed inset-0 z-40 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Player autoplay keepLastFrame={false} src={LOTTIE.sparkle} style={{ height: 320, width: 320 }} />
          </motion.div>
        )}
        {showFlame && (
          <motion.div
            key="flame"
            className="pointer-events-none fixed bottom-6 left-1/2 z-40 -translate-x-1/2"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
          >
            <Player autoplay keepLastFrame={false} src={LOTTIE.flame} style={{ height: 160, width: 160 }} />
          </motion.div>
        )}
      </AnimatePresence>

      <header className="mx-auto flex max-w-5xl items-center gap-3 px-4 pt-3 sm:pt-4" style={{ flexShrink: 0 }}>
          {phase !== "boot" && (
            <nav className="flex gap-2">
              <TabButton active={view === "play"} onClick={() => setView("play")} color="#FF4EAB">
                <OpenMoji name="music" size={20} /> Play
              </TabButton>
              <TabButton active={view === "facts"} onClick={() => setView("facts")} color="#3B82F6">
                <OpenMoji name="globe" size={20} /> Facts
              </TabButton>
            </nav>
          )}
        {phase === "play" && (
          <div className="flex flex-1 flex-wrap items-center gap-2">
            <StopsPanel roundIndex={currentRound} total={rounds.length} roundStatuses={roundStatuses} />
            <StatChip icon="🎫" value={`${score}/${rounds.length}`} bg="#FFF8E0" color="#1a1a1a" />
            {streak > 0 && <StatChip icon="🔥" value={String(streak)} bg="#FFECEC" color="#EF4444" />}
            <button
              type="button"
              onClick={() => setPassportModalOpen(true)}
              className="rounded-full border-[2px] border-ink px-4 py-1 text-sm font-bold transition-transform active:scale-95 ml-auto"
              style={{ background: "#1C3054", color: "#FFD700", borderBottomWidth: 4, borderRightWidth: 3, cursor: "pointer" }}
            >
              🛂 {collectedCountries.length} stamps
            </button>
          </div>
        )}
      </header>

      <main className="mx-auto max-w-5xl px-4 pb-4 pt-2 sm:pb-6 sm:pt-3" style={{ flex: "1 1 0", minHeight: 0, display: "flex", flexDirection: "column" }}>
        {view === "facts" ? (
          <FactsView onResetGame={resetToBoot} />
        ) : phase === "boot" ? (
          <BootScreen onStart={startGame} />
        ) : phase === "result" ? (
          <div className="flex flex-col gap-4">
            <ResultScreen
              score={score}
              total={rounds.length * 3}
              onReplay={startGame}
              onLearn={() => setView("facts")}
            />
            {/* Leaderboard */}
            <div className="mx-auto w-full max-w-md rounded-[2rem] border-[3px] border-ink p-4" style={{ background: "#1a1a2e", borderBottomWidth: 6, borderRightWidth: 5 }}>
              <div className="text-[0.6rem] font-extrabold uppercase tracking-[0.2em] text-gray-500 mb-1">🏆 Top Scores — Music Match</div>
              {user ? (
                <p className="text-xs font-bold mb-2" style={{ color: saving ? "#9ca3af" : saved ? "#4ade80" : "transparent" }}>
                  {saving ? "Saving score…" : "✓ Score saved to leaderboard"}
                </p>
              ) : (
                <button onClick={() => openAuthModal("sign-up")} className="text-xs font-bold text-yellow-400 underline hover:text-yellow-300 mb-2 block">
                  🏆 Sign in to save your score
                </button>
              )}
              <Leaderboard gameSlug="music-match" limit={5} theme="dark" />
            </div>
          </div>
        ) : (
          <PlayScreen
            round={round}
            choices={choices}
            roundIndex={currentRound}
            totalRounds={rounds.length}
            roundStatuses={roundStatuses}
            score={score}
            streak={streak}
            answered={answered}
            missedThisRound={missedThisRound}
            wrongPicks={wrongPicks}
            isLast={isLast}
            onPick={handlePick}
            onNext={goNext}
            onTryAgain={() => {/* enabling automatic via wrongPicks set */}}
            isPlaying={isPlaying}
            togglePlay={togglePlay}
            currentTime={currentTime}
            duration={duration}
            audioErr={audioErr}
            seek={seek}
            hasStartedRound={hasStartedRound}
            lastEarnedPoints={lastEarnedPoints}
            audioRef={audioRef}
          />
        )}
      </main>

      <audio ref={audioRef} preload="auto" playsInline />

      {/* Passport modal */}
      {passportModalOpen && (
        <div
          style={{
            position: "fixed", inset: 0, zIndex: 90,
            display: "grid", placeItems: "center",
            padding: "1rem",
            background: "rgba(10,20,50,0.72)",
            backdropFilter: "blur(4px)",
          }}
          onClick={() => setPassportModalOpen(false)}
        >
          <div onClick={(e) => e.stopPropagation()} style={{ width: "min(26rem, 94vw)", maxHeight: "85dvh", overflowY: "auto" }}>
            <MusicPassportCollection countries={collectedCountries} onClose={() => setPassportModalOpen(false)} />
          </div>
        </div>
      )}
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Subcomponents
// ──────────────────────────────────────────────────────────────────────────────
function StatChip({ icon, value, bg, color }: { icon: string; value: string; bg: string; color: string }) {
  return (
    <div
      className="flex items-center gap-1 rounded-full px-2.5 py-1 text-sm font-black"
      style={{ background: bg, color, border: "3px solid #1a1a1a", borderBottomWidth: 5, borderRightWidth: 4 }}
    >
      <span>{icon}</span>
      <span>{value}</span>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  color,
  children,
}: {
  active: boolean;
  onClick: () => void;
  color: string;
  children: React.ReactNode;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={{ y: 3 }}
      className="block-btn flex items-center gap-2 !py-2 !px-3 text-sm sm:text-base"
      style={{ ["--c" as string]: active ? color : "#FFFBF0", opacity: active ? 1 : 0.85 }}
    >
      {children}
    </motion.button>
  );
}

function BootScreen({ onStart }: { onStart: () => void }) {
  const [isDragging, setIsDragging] = useState(false);
  const rotation = useMotionValue(0);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const lastScratchRef = useRef(0);
  const rafRef = useRef<number>(0);
  const lastPtrXRef = useRef(0);

  // Auto-spin when not dragging
  useEffect(() => {
    if (isDragging) {
      cancelAnimationFrame(rafRef.current);
      return;
    }
    const tick = () => {
      rotation.set(rotation.get() + 0.667); // ~9s per revolution at 60fps
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [isDragging, rotation]);

  function playScratch(speed: number) {
    const now = Date.now();
    if (now - lastScratchRef.current < 60 || speed < 1.5) return;
    lastScratchRef.current = now;
    if (!audioCtxRef.current) audioCtxRef.current = new AudioContext();
    const ctx = audioCtxRef.current;
    if (ctx.state === "suspended") ctx.resume();
    const dur = 0.1;
    const buf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * dur), ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) {
      d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 1.5) * 0.55;
    }
    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.playbackRate.value = Math.max(0.6, Math.min(0.6 + speed * 0.07, 2.8));
    const filt = ctx.createBiquadFilter();
    filt.type = "bandpass";
    filt.frequency.value = 1200;
    filt.Q.value = 2;
    const gain = ctx.createGain();
    gain.gain.value = 0.45;
    src.connect(filt);
    filt.connect(gain);
    gain.connect(ctx.destination);
    src.start();
  }

  const FLAGS = ["🇦🇷","🇦🇺","🇧🇧","🇫🇷","🇬🇭","🇮🇩","🇮🇹","🇯🇲","🇯🇵","🇰🇪","🇲🇽","🇳🇵","🇵🇪","🇿🇦","🇰🇷","🇪🇸","🇱🇰","🇨🇭","🇬🇧","🇺🇸"];

  const STEP_COLORS = ["#FF4EAB", "#3B82F6", "#22C55E", "#FB923C"];

  return (
    <section
      className="flex flex-col items-center justify-center gap-4 px-6 py-6 text-center"
      style={{ height: "calc(100dvh - 156px)", overflow: "hidden" }}
    >
      {/* Vinyl record — draggable, scratches on interaction */}
      <motion.div
        className="w-[320px] sm:w-[400px]"
        style={{
          rotate: rotation,
          aspectRatio: "1 / 1",
          borderRadius: "50%",
          position: "relative",
          cursor: isDragging ? "grabbing" : "grab",
          background: `
            radial-gradient(circle at 42% 38%, rgba(255,255,255,0.07) 0%, transparent 45%),
            repeating-radial-gradient(circle at 50% 50%,
              #0d0d0d 0px, #0d0d0d 2px,
              #1e1e1e 2px, #1e1e1e 4px,
              #141414 4px, #141414 5.5px)
          `,
          boxShadow: "0 10px 40px rgba(0,0,0,0.45), inset 0 0 0 2px rgba(255,255,255,0.04)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          userSelect: "none",
          touchAction: "none",
        }}
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId);
          setIsDragging(true);
          lastPtrXRef.current = e.clientX;
        }}
        onPointerMove={(e) => {
          if (!isDragging) return;
          const dx = e.clientX - lastPtrXRef.current;
          lastPtrXRef.current = e.clientX;
          rotation.set(rotation.get() + dx * 0.9);
          playScratch(Math.abs(dx));
        }}
        onPointerUp={() => setIsDragging(false)}
        onPointerCancel={() => setIsDragging(false)}
      >
        {/* Label sticker */}
        <div style={{
          width: "72%", height: "72%",
          borderRadius: "50%",
          background: "#FFF3CD",
          border: "3px solid rgba(0,0,0,0.15)",
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "inset 0 0 12px rgba(0,0,0,0.1)",
        }}>
          <img
            src={asset("/art/jangles international orchestra (WHITE BACKGROUND).png.jpg")}
            alt="Jangles International Orchestra"
            style={{ width: "90%", height: "90%", objectFit: "contain", display: "block", mixBlendMode: "multiply" }}
          />
        </div>
        {/* Spindle hole */}
        <div style={{
          position: "absolute", top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          width: 12, height: 12, borderRadius: "50%",
          background: "#d6cbb8", border: "1px solid #888",
          zIndex: 2,
        }} />
      </motion.div>
      {/* How-to-play pill */}
      <div style={{
        background: "#89D8F0",
        border: "3px solid #1a1a1a",
        borderBottomWidth: 5,
        borderRightWidth: 4,
        borderRadius: "1.25rem",
        padding: "0.4rem 0.75rem",
        maxWidth: 360,
        width: "100%",
        textAlign: "left",
      }}>
        <div style={{ fontSize: "0.72rem", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.25rem" }}>
          🎶 How to Play
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.2rem", marginBottom: "0.3rem" }}>
          {[
            { n: "1", emoji: "▶️", text: "Press play to hear a music clip" },
            { n: "2", emoji: "🔍", text: "Read the clues as they unlock" },
            { n: "3", emoji: "🌍", text: "Pick the right country from 4 options" },
            { n: "4", emoji: "⚡", text: <>Guess fast to earn <strong>bonus points!</strong></> },
          ].map(({ n, emoji, text }, i) => (
            <div key={n} style={{ display: "flex", alignItems: "center", gap: "0.45rem", fontSize: "0.82rem", fontWeight: 700 }}>
              <span style={{
                background: STEP_COLORS[i],
                color: "#fff",
                borderRadius: "9999px",
                width: "1.25rem",
                height: "1.25rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "0.68rem",
                fontWeight: 900,
                flexShrink: 0,
              }}>{n}</span>
              <span style={{ fontSize: "0.95rem", flexShrink: 0 }}>{emoji}</span>
              <span>{text}</span>
            </div>
          ))}
        </div>
        <div style={{ borderTop: "2px dashed rgba(0,0,0,0.12)", paddingTop: "0.4rem", display: "flex", flexDirection: "column", gap: "0.25rem" }}>
          {[FLAGS.slice(0, 10), FLAGS.slice(10)].map((row, ri) => (
            <div key={ri} style={{ display: "flex", justifyContent: "space-between" }}>
              {row.map((f) => <span key={f} style={{ fontSize: "1.05rem", lineHeight: 1 }}>{f}</span>)}
            </div>
          ))}
        </div>
      </div>

      <motion.button
        type="button"
        onClick={onStart}
        whileTap={{ y: 3 }}
        whileHover={{ scale: 1.03 }}
        className="block-btn !px-8 !py-2.5 !text-xl sm:!px-10 sm:!py-3 sm:!text-2xl"
        style={{ ["--c" as string]: "#FF4EAB", color: "#fff" }}
      >
        Start Game
      </motion.button>
    </section>
  );
}

function StopsPanel({
  roundIndex,
  total,
  roundStatuses,
}: {
  roundIndex: number;
  total: number;
  roundStatuses: RoundStatus[];
}) {
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: total }, (_, index) => {
        const status = roundStatuses[index] ?? "pending";
        const isCurrent = index === roundIndex;
        const background =
          status === "correct"
            ? "#22C55E"
            : status === "wrong"
              ? "#EF4444"
              : isCurrent
                ? "#FBBF24"
                : "#fff";
        return (
          <div
            key={index}
            className="h-4 w-4 rounded-full"
            style={{ background, border: "3px solid #1a1a1a", borderBottomWidth: 4, borderRightWidth: 4 }}
            aria-label={`Stop ${index + 1} ${status}`}
          />
        );
      })}
    </div>
  );
}

type PlayProps = {
  round: Fact | undefined;
  choices: Fact[];
  roundIndex: number;
  totalRounds: number;
  roundStatuses: RoundStatus[];
  score: number;
  streak: number;
  answered: boolean;
  missedThisRound: boolean;
  wrongPicks: Set<string>;
  isLast: boolean;
  onPick: (country: string) => void;
  onNext: () => void;
  onTryAgain: () => void;
  isPlaying: boolean;
  togglePlay: () => void;
  currentTime: number;
  duration: number;
  audioErr: string | null;
  seek: (e: React.MouseEvent<HTMLDivElement>) => void;
  audioRef: React.RefObject<HTMLAudioElement | null>;
  hasStartedRound: boolean;
  lastEarnedPoints: number;
};

function artistName(src: string): string {
  const filename = (src.split("/").pop() ?? "").replace(/\.(jpg|png|jpeg)$/i, "");
  // e.g. "Juan Manuel Benitez_Argentina" → "Juan Manuel Benitez"
  return filename.replace(/_[^_]+$/, "").replace(/_/g, " ");
}

// ── Music Passport Collection ──────────────────────────────────────────────────

function MusicPassportCollection({ countries, onClose }: { countries: Fact[]; onClose: () => void }) {
  return (
    <div
      className="w-full rounded-[1.75rem] border-[4px] border-ink"
      style={{ background: "#1C3054", borderBottomWidth: 7, borderRightWidth: 6, padding: "1.25rem 1.5rem" }}
    >
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <span style={{ fontSize: 22 }}>🛂</span>
          <span className="text-xl font-extrabold" style={{ color: "#FFD700" }}>My Music Passport</span>
        </div>
        <button
          type="button"
          onClick={onClose}
          style={{ background: "transparent", border: "none", color: "#8899AA", fontSize: 22, cursor: "pointer", lineHeight: 1 }}
          aria-label="Close passport"
        >
          ✕
        </button>
      </div>
      <div className="text-xs mb-4" style={{ color: "#8899AA" }}>
        {countries.length} countr{countries.length !== 1 ? "ies" : "y"} collected on this world tour
      </div>
      {countries.length === 0 ? (
        <div className="text-center py-4 text-sm" style={{ color: "#4a6080" }}>
          No countries collected yet — guess correctly to earn stamps!
        </div>
      ) : (
        <div className="flex flex-wrap gap-3">
          {countries.map((c, i) => {
            const rotation = ((i * 7) % 9) - 4;
            const url = flagCdnUrl(c.flag);
            return (
              <div
                key={`${c.country}-${i}`}
                style={{
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
                  transform: `rotate(${rotation}deg)`,
                }}
              >
                <div style={{ border: "2px solid #4a6080", borderRadius: 6, overflow: "hidden", padding: 2, background: "#fff" }}>
                  {url ? (
                    <img
                      src={url}
                      alt={c.country}
                      style={{ width: 54, height: c.flag === "🇳🇵" ? 42 : 36, objectFit: "cover", display: "block" }}
                    />
                  ) : (
                    <div style={{ width: 54, height: 36, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>
                      {c.flag}
                    </div>
                  )}
                </div>
                <div style={{ color: "#99AABB", fontSize: 9, textAlign: "center", maxWidth: 60, lineHeight: 1.2 }}>
                  {c.country}
                </div>
                <div style={{
                  background: "#FBBF24", border: "1px solid #1a1a1a",
                  borderRadius: "999px", padding: "1px 5px",
                  fontSize: 8, fontWeight: 900, color: "#1a1a1a",
                  textAlign: "center", maxWidth: 64, lineHeight: 1.3,
                }}>
                  {c.style}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function MusicPassportOverlay({
  round,
  earnedPoints,
  isLast,
  onNext,
}: {
  round: Fact;
  earnedPoints: number;
  isLast: boolean;
  onNext: () => void;
}) {
  const pointsLabel =
    earnedPoints === 3 ? "⚡ +3 pts — Lightning fast!"
    : earnedPoints === 2 ? "🎯 +2 pts — Nice timing!"
    : earnedPoints === 1 ? "✅ +1 pt — You got there!"
    : "💪 Correct — keep going!";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: "fixed", inset: 0, zIndex: 80,
        display: "grid", placeItems: "center",
        padding: "1rem",
        background: "rgba(10,20,50,0.78)",
        backdropFilter: "blur(5px)",
      }}
    >
      <motion.div
        initial={{ scale: 0.88, y: 24 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 320, damping: 24 }}
        style={{
          width: "min(22rem, 92vw)",
          maxHeight: "88dvh",
          borderRadius: "0.8rem 0.3rem 0.3rem 0.8rem",
          overflow: "hidden",
          overflowY: "auto",
          fontFamily: '"Baloo 2", system-ui, sans-serif',
          boxShadow: "0 24px 60px rgba(0,0,0,0.5)",
        }}
      >
        {/* Cover */}
        <div style={{
          textAlign: "center",
          padding: "1rem 1rem 0.8rem",
          background: "linear-gradient(180deg,#1e293b,#0f172a)",
          borderBottom: "3px solid #d4a017",
        }}>
          <img
            src={asset("/art/title.png")}
            alt="Jaime Jangles"
            style={{ height: 68, margin: "0 auto 0.1rem", display: "block", objectFit: "contain" }}
          />
          <div style={{ fontSize: "1rem", color: "#d4a017", textTransform: "uppercase", letterSpacing: "0.12em", fontWeight: 900 }}>
            Music Passport
          </div>
        </div>

        {/* Passport page */}
        <div style={{
          background: "#fdf6e3",
          padding: "0.65rem 0.75rem 0.75rem",
          backgroundImage: `
            repeating-linear-gradient(0deg,transparent,transparent 24px,rgba(180,160,100,0.08) 24px,rgba(180,160,100,0.08) 25px),
            repeating-linear-gradient(90deg,transparent,transparent 24px,rgba(180,160,100,0.06) 24px,rgba(180,160,100,0.06) 25px)
          `,
        }}>
          {/* Country + style header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flexWrap: "wrap", gap: "0.4rem", margin: "0.4rem 0 0.5rem" }}>
            <div style={{ fontSize: "1.3rem", fontWeight: 900, color: "#1a3a14" }}>{round.country}</div>
            <span style={{
              display: "inline-block",
              background: "#FBBF24", border: "2px solid #1a1a1a",
              borderBottomWidth: 3, borderRightWidth: 2,
              borderRadius: "999px", padding: "0.1rem 0.6rem",
              fontSize: "0.85rem", fontWeight: 900,
            }}>{round.style}</span>
          </div>

          {/* Musician cards */}
          {(() => {
            const musicians = [round.image, round.image2].filter(Boolean) as string[];
            const isDouble = musicians.length === 2;
            return (
              <div style={{
                display: "flex",
                flexDirection: isDouble ? "row" : "column",
                gap: "0.4rem",
                marginBottom: "0.5rem",
              }}>
                {musicians.map((src, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 22, delay: 0.08 + i * 0.14 }}
                    style={{
                      flex: isDouble ? 1 : undefined,
                      border: "2px solid #1a1a1a",
                      borderBottomWidth: 4, borderRightWidth: 3,
                      borderRadius: "0.75rem",
                      overflow: "hidden",
                      boxShadow: "3px 4px 0 #1a1a1a",
                      background: "#f5f0e8",
                      padding: "4px",
                    }}
                  >
                    <div style={{ overflow: "hidden", borderRadius: "0.45rem" }}>
                      <img
                        src={asset("/" + src)}
                        alt={artistName(src)}
                        onError={(e) => { (e.currentTarget as HTMLImageElement).src = asset("/art/styleimage_a.png"); }}
                        style={{
                          width: "100%",
                          height: "auto",
                          display: "block",
                          objectFit: "contain",
                        }}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            );
          })()}

          {/* Fact */}
          <div style={{
            borderRadius: "0.7rem",
            border: "1px solid rgba(139,105,20,0.25)",
            background: "rgba(26,58,20,0.06)",
            padding: "0.6rem 0.8rem",
            fontSize: "0.95rem",
            fontStyle: "italic",
            color: "#2a2a2a",
            lineHeight: 1.5,
            marginBottom: "0.6rem",
          }}>
            {round.fact}
          </div>

          {/* Points badge */}
          <div style={{
            textAlign: "center", fontSize: "0.95rem", fontWeight: 800,
            color: earnedPoints >= 3 ? "#059669" : earnedPoints >= 2 ? "#d97706" : "#6b7280",
            marginBottom: "0.75rem",
          }}>
            {pointsLabel}
          </div>

          {/* Next button */}
          <button
            onClick={onNext}
            style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem",
              width: "100%",
              background: "#FF4EAB", color: "#fff",
              border: "3px solid #1a1a1a",
              borderBottomWidth: 6, borderRightWidth: 5,
              borderRadius: 14,
              padding: "0.75rem 1.5rem",
              fontSize: "1.1rem", fontWeight: 900,
              cursor: "pointer",
              fontFamily: '"Baloo 2", system-ui, sans-serif',
            }}
          >
            {isLast ? (
              "See Results 🎉"
            ) : (
              <>
                <span>Correct — Next Stop</span>
                <img src={asset("/characters/air-fante-plane.png")} alt="" style={{ height: 28, width: "auto", transform: "scaleX(-1)" }} />
              </>
            )}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function CountdownTimer({ currentTime, hasStarted }: { currentTime: number; hasStarted: boolean }) {
  const TOTAL = 10;
  const timeLeft = Math.max(0, TOTAL - currentTime);
  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  const progress = timeLeft / TOTAL;
  const color = timeLeft > 6 ? "#22C55E" : timeLeft > 3 ? "#FBBF24" : "#EF4444";
  const display = hasStarted ? Math.ceil(timeLeft) : TOTAL;

  return (
    <div style={{ position: "relative", width: 88, height: 88, flexShrink: 0 }}>
      <svg width="88" height="88" style={{ transform: "rotate(-90deg)" }}>
        <circle cx="44" cy="44" r={radius} fill="none" stroke="#e5e5e5" strokeWidth="6" />
        <circle
          cx="44" cy="44" r={radius}
          fill="none"
          stroke={hasStarted ? color : "#e5e5e5"}
          strokeWidth="6"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - (hasStarted ? progress : 1))}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.25s linear, stroke 0.3s" }}
        />
      </svg>
      <div style={{
        position: "absolute", inset: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontWeight: 900, fontSize: 26,
        color: hasStarted ? color : "#aaa",
        fontFamily: '"Baloo 2", system-ui, sans-serif',
      }}>
        {display}
      </div>
    </div>
  );
}

function PlayScreen(p: PlayProps) {
  if (!p.round) return null;
  const revealedClueCount = Math.min(buildTimedClues(p.round).length, Math.floor(p.currentTime / 2));
  const CLUE_EMOJIS = ["🎵", "📖", "💡"];
  const [showPlayHint, setShowPlayHint] = useState(false);

  function handlePickWithHint(country: string) {
    if (p.currentTime === 0 && !p.isPlaying) {
      setShowPlayHint(true);
      setTimeout(() => setShowPlayHint(false), 2500);
      return;
    }
    p.onPick(country);
  }

  return (
    <>
      <section className="flex flex-col gap-2 sm:gap-2.5" style={{ flex: "1 1 0", minHeight: 0, overflow: "hidden" }}>

        {/* ══ Player card — beach scene inside ══ */}
        <div className="jjb-player-card">
          <StorybookScene />

          <div className="jjb-player-content">
            {/* Top bar: STOP · logo · timer */}
            <div className="jjb-top-bar">
              <div className="jjb-stop-badge">STOP {p.roundIndex + 1}</div>
              <div className="jjb-logo-bg">
                <img
                  src={asset("/art/jangles-juke-box-title.png")}
                  alt="Jangles Juke Box"
                  className="jjb-logo"
                />
              </div>
              <CountdownTimer currentTime={p.currentTime} hasStarted={p.hasStartedRound} />
            </div>

            {/* Question + instruction */}
            <h2 className="jjb-question">What country is this music from?</h2>
            <p className="jjb-instruction">
              {p.audioErr ?? (p.missedThisRound
                ? "Not that country. Try another!"
                : "Play the music, then choose one of the four countries.")}
            </p>

            {/* Notebook clues panel */}
            <div className="jjb-clues-wrap">
              <div className="jjb-spiral" aria-hidden>
                {Array.from({ length: 7 }).map((_, i) => (
                  <span key={i} className="jjb-spiral-ring" />
                ))}
              </div>
              <div className="jjb-clues-inner">
                <div className="jjb-clues-label">
                  <span style={{ fontSize: "1.1em" }}>🔍</span>
                  <span>CLUES</span>
                  <span style={{ color: "#e85a74", fontSize: "1.15em" }}>♥</span>
                </div>
                {buildTimedClues(p.round).map((clue, i) => (
                  <motion.div
                    key={clue}
                    initial={false}
                    animate={i < revealedClueCount ? { opacity: 1, x: 0 } : { opacity: 0, x: -14 }}
                    transition={{ duration: 0.35 }}
                    className="jjb-clue-row"
                  >
                    <span>{CLUE_EMOJIS[i] ?? "💡"}</span>
                    <span>{clue}</span>
                  </motion.div>
                ))}
                <span aria-hidden style={{
                  position: "absolute", right: 22, bottom: 16,
                  color: "#f5c032", fontSize: 28,
                  WebkitTextStroke: "2px #c8900c",
                }}>★</span>
              </div>
              <div className="jjb-page-tabs" aria-hidden>
                <span className="jjb-tab" style={{ background: "#e85a74" }}>★</span>
                <span className="jjb-tab" style={{ background: "#4a9fd4" }} />
              </div>
            </div>

            {/* Audio card */}
            <div className="jjb-audio-card">
              <div style={{ position: "relative", flexShrink: 0 }}>
                <motion.button
                  type="button"
                  onClick={p.togglePlay}
                  whileTap={{ scale: 0.92 }}
                  whileHover={{ scale: 1.06 }}
                  className="jjb-play-btn"
                  aria-label={p.isPlaying ? "Pause audio" : "Play audio"}
                >
                  {p.isPlaying
                    ? <span style={{ fontSize: 18, color: "#1a3a5c" }}>❚❚</span>
                    : <span style={{ fontSize: 22, color: "#1a3a5c", marginLeft: 4 }}>▶</span>}
                </motion.button>
                <AnimatePresence>
                  {showPlayHint && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.7, y: 4 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.7, y: 4 }}
                      transition={{ type: "spring", stiffness: 400, damping: 20 }}
                      onClick={p.togglePlay}
                      style={{
                        position: "absolute",
                        bottom: "calc(100% + 7px)",
                        left: "50%",
                        transform: "translateX(-50%)",
                        background: "#FF4EAB",
                        color: "#fff",
                        border: "3px solid #1a1a1a",
                        borderBottomWidth: 5,
                        borderRightWidth: 4,
                        borderRadius: "9999px",
                        padding: "0.3rem 0.75rem",
                        fontSize: "0.78rem",
                        fontWeight: 900,
                        whiteSpace: "nowrap",
                        cursor: "pointer",
                        zIndex: 10,
                      }}
                    >
                      ▶ play here!
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <WaveformVisualizer
                  audioRef={p.audioRef}
                  isPlaying={p.isPlaying}
                  currentTime={p.currentTime}
                  duration={p.duration}
                  onSeek={p.seek}
                />
                <div className="mt-1 flex justify-between font-bold"
                  style={{ color: "#1a3a5c", fontSize: "clamp(12px,1.1vw,18px)" }}>
                  <span>{fmtTime(p.currentTime)}</span>
                  <span>{fmtTime(p.duration)}</span>
                </div>
              </div>
            </div>

            {/* ── Answer grid — inside player card ── */}
            <div className="grid grid-cols-2 gap-2 sm:gap-2.5" style={{ flexShrink: 0 }}>
              {p.choices.map((c, i) => {
                const isWrong = p.wrongPicks.has(c.country);
                return (
                  <motion.button
                    key={c.country}
                    type="button"
                    disabled={isWrong || p.answered}
                    onClick={() => handlePickWithHint(c.country)}
                    whileHover={isWrong || p.answered ? undefined : { y: -4 }}
                    whileTap={isWrong || p.answered ? undefined : { scale: 0.95 }}
                    animate={isWrong ? { x: [-8, 8, -8, 8, 0], backgroundColor: "#EF4444" } : {}}
                    transition={{ duration: 0.4 }}
                    className="block-card flex items-center gap-2 px-3 py-2.5 text-left text-sm sm:gap-3 sm:px-4 sm:py-3 sm:text-base"
                    style={{ ["--c" as string]: isWrong ? "#EF4444" : colorAt(i + p.roundIndex), opacity: isWrong ? 0.7 : 1 }}
                  >
                    {flagCdnUrl(c.flag) && (
                      <img src={flagCdnUrl(c.flag)} alt="" className={musicFlagClassName(c.flag, "medium")} style={musicFlagStyle(c.flag)} />
                    )}
                    <span className="flex-1 font-extrabold">{c.country}</span>
                  </motion.button>
                );
              })}
            </div>

          </div>{/* end jjb-player-content */}
        </div>{/* end jjb-player-card */}

      </section>

      {/* Passport overlay */}
      <AnimatePresence>
        {p.answered && (
          <MusicPassportOverlay
            round={p.round}
            earnedPoints={p.lastEarnedPoints}
            isLast={p.isLast}
            onNext={p.onNext}
          />
        )}
      </AnimatePresence>
    </>
  );
}

function ResultScreen({
  score,
  total,
  onReplay,
  onLearn,
}: {
  score: number;
  total: number;
  onReplay: () => void;
  onLearn: () => void;
}) {
  const percent = total ? Math.round((score / total) * 100) : 0;
  return (
    <section className="flex flex-col items-center gap-6 pt-4 text-center sm:gap-8 sm:pt-8">
      <Player autoplay loop src={LOTTIE.fireworks} style={{ height: 240, width: 240 }} />
      <h2 className="text-3xl sm:text-5xl">
        <Multicolor text="Tour Complete!" />
      </h2>
      <div className="text-6xl sm:text-8xl">
        <Multicolor text={`${score}/${total}`} className="chunky-text-lg" />
      </div>
      <p className="max-w-md text-lg text-ink/80">
        You scored {percent}% of possible points — faster answers earn more!
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <motion.button
          type="button"
          onClick={onReplay}
          whileTap={{ y: 3 }}
          whileHover={{ scale: 1.03 }}
          className="block-btn"
          style={{ ["--c" as string]: "#FF4EAB", color: "#fff" }}
        >
          Play again
        </motion.button>
        <motion.button
          type="button"
          onClick={onLearn}
          whileTap={{ y: 3 }}
          whileHover={{ scale: 1.03 }}
          className="block-btn"
          style={{ ["--c" as string]: "#3B82F6", color: "#fff" }}
        >
          Learn more
        </motion.button>
      </div>
    </section>
  );
}

function FactsView({ onResetGame }: { onResetGame: () => void }) {
  const sorted = useMemo(() => [...FACTS].sort((a, b) => a.country.localeCompare(b.country)), []);
  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-lg">{FACTS.length} tour stops to learn</p>
        <motion.button
          type="button"
          onClick={onResetGame}
          whileTap={{ y: 3 }}
          className="block-btn !text-base !py-2"
          style={{ ["--c" as string]: "#FBBF24" }}
        >
          Reset game
        </motion.button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sorted.map((item, i) => (
          <article
            key={item.country}
            className="block-card overflow-hidden p-0"
            style={{ ["--c" as string]: "#fff" }}
          >
            <div className="relative h-40 bg-paper overflow-hidden">
              <img
                src={asset("/" + item.image)}
                alt={`Artist from ${item.country}`}
                onError={(e) => { (e.currentTarget as HTMLImageElement).src = asset("/art/styleimage_a.png"); }}
                className="h-full w-full object-cover"
              />
              {item.image2 && (
                <img
                  src={asset("/" + item.image2)}
                  alt={`Artist from ${item.country}`}
                  onError={(e) => { (e.currentTarget as HTMLImageElement).src = asset("/art/styleimage_a.png"); }}
                  style={{
                    position: "absolute", bottom: 6, right: 6,
                    width: "38%", height: "auto",
                    border: "2px solid #fff",
                    borderRadius: "0.5rem",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.35)",
                    objectFit: "cover",
                  }}
                />
              )}
            </div>
            <div className="p-4">
              <div>
                <p className="text-sm font-bold text-ink/60 uppercase tracking-wide">{item.city}</p>
                <h2 className="text-xl font-extrabold text-ink">{item.country}</h2>
              </div>
              <span
                className="mt-2 inline-block rounded-full px-3 py-1 text-sm"
                style={{ background: colorAt(i + 2), border: "3px solid #1a1a1a" }}
              >
                {item.style}
              </span>
              <p className="mt-3 text-ink/85">{item.fact}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
