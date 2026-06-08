import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { burstCorrect, burstFinale } from "@/game/confetti";
import { playCorrectExclamation, playIncorrectExclamation } from "./exclamations";
import { useScore } from "@/hooks/use-score";
import { useAuth } from "@/lib/auth-context";
import { Leaderboard } from "@/components/leaderboard";
import findFoxyMusic from "../../MUSIC FOR GAMES/FIND_FOXY_1.wav";

import foxyLogo from "../../FOXY/FOX 1.png";

import {
  FIND_FOXY_CORRECT_CUES,
  FIND_FOXY_COUNTRIES,
  FIND_FOXY_FLAGS,
  FIND_FOXY_LEVEL_LABELS,
  type FindFoxyCountry,
  type FindFoxyDifficulty,
} from "./find-foxy-data";
import { useStamps } from "@/hooks/useStamps";
import "./find-foxy.css";
import { asset } from "@/lib/asset";

type GamePhase = "setup" | "playing" | "passport" | "win";


const CASEY_IMAGES = ["/art/characters.jpg", "/art/characters.jpg", "/art/characters.jpg", "/art/characters.jpg"];
const TOTAL_STOPS = FIND_FOXY_COUNTRIES.length;

const COUNTRY_MUSIC: Record<string, string> = {
  "Argentina":      "/music/ARGENTINA DRUMS AND HORNS_1.2.wav",
  "Australia":      "/music/Jamie Jangles_Daniel_Australia.wav",
  "Barbados":       "/music/BARBADOS_2.wav",
  "France":         "/music/FRANCE.wav",
  "Ghana":          "/music/GHANA.wav",
  "Indonesia":      "/music/INDONESIA.wav",
  "Italy":          "/music/ITALY.wav",
  "Jamaica":        "/music/JAMAICA.wav",
  "Japan":          "/music/JAPAN.wav",
  "Kenya":          "/music/KENYA.wav",
  "Mexico":         "/music/MEXICO.wav",
  "Nepal":          "/music/NEPAL.wav",
  "Peru":           "/music/PERU.wav",
  "South Africa":   "/music/SOUTH AFRICA_1.2.wav",
  "South Korea":    "/music/SOUTH KOREA.wav",
  "Spain":          "/music/SPAIN1.2.wav",
  "Sri Lanka":      "/music/SRI LANKA_1.1.wav",
  "Switzerland":    "/music/SWITZERLAND.wav",
  "United Kingdom": "/music/UK.wav",
  "USA":            "/music/NEW ORLEANS.wav",
};
function generateClouds(count = 9) {
  const used: number[] = [];
  return Array.from({ length: count }, () => {
    let top: number;
    let tries = 0;
    do {
      top = 4 + Math.random() * 78;
      tries++;
    } while (tries < 30 && used.some((t) => Math.abs(t - top) < 9));
    used.push(top);
    return {
      top: `${top.toFixed(1)}%`,
      width: `${(4 + Math.random() * 7).toFixed(1)}rem`,
      duration: Math.round(55 + Math.random() * 55),
      delay: -Math.round(Math.random() * 65),
    };
  });
}

const CLOUDS = generateClouds();

function shuffle<T>(values: T[]) {
  const next = [...values];
  for (let index = next.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [next[index], next[swapIndex]] = [next[swapIndex], next[index]];
  }
  return next;
}


function cueQueue(previous: string[]) {
  return shuffle(previous);
}

function playTone() {
  if (typeof window === "undefined") return;
  const AudioContextCtor = window.AudioContext ?? (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioContextCtor) return;
  const audioContext = new AudioContextCtor();
  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();
  oscillator.type = "triangle";
  oscillator.frequency.setValueAtTime(660, audioContext.currentTime);
  oscillator.frequency.linearRampToValueAtTime(880, audioContext.currentTime + 0.18);
  gain.gain.setValueAtTime(0.001, audioContext.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.06, audioContext.currentTime + 0.04);
  gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.28);
  oscillator.connect(gain);
  gain.connect(audioContext.destination);
  oscillator.start();
  oscillator.stop(audioContext.currentTime + 0.3);
  void audioContext.resume().catch(() => undefined);
}

export function FindFoxyGame() {
  const { user, openAuthModal } = useAuth();
  const { saveScore, saving, saved, reset: resetScore } = useScore("find-foxy");

  const [phase, setPhase] = useState<GamePhase>("setup");
  const [difficulty, setDifficulty] = useState<FindFoxyDifficulty>("beginner");
  const [playerName, setPlayerName] = useState("Explorer");
  const [order, setOrder] = useState<number[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [stamps, setStamps] = useState(0);
  const [, addGlobalStamps] = useStamps();
  const [revealedClueCount, setRevealedClueCount] = useState(0);
  const [locked, setLocked] = useState(false);
  const [wrongChoice, setWrongChoice] = useState<string | null>(null);
  const [answers, setAnswers] = useState<string[]>([]);
  const [cueText, setCueText] = useState<string | null>(null);
  const [cueStack, setCueStack] = useState<string[]>([]);
  const planeXRef = useRef(5);
  const planeYRef = useRef(20);
  const planeVelXRef = useRef(0.05);
  const planeVelYRef = useRef(0);
  const planeElRef = useRef<HTMLDivElement | null>(null);
  const keysRef = useRef({ left: false, right: false, up: false, down: false });
  const rafRef = useRef<number | null>(null);
  const bgMusicRef = useRef<HTMLAudioElement | null>(null);
  const countryMusicRef = useRef<HTMLAudioElement | null>(null);

  function stopCountryMusic() {
    if (countryMusicRef.current) {
      countryMusicRef.current.pause();
      countryMusicRef.current = null;
    }
  }

  const currentCountry = phase === "setup" ? null : FIND_FOXY_COUNTRIES[order[currentIndex]];
  const currentLevel = currentCountry ? currentCountry[difficulty] : null;

  useEffect(() => {
    if (!currentCountry) return;
    const optionSet = shuffle([currentCountry.name, ...shuffle(currentCountry.distractors).slice(0, 3)]);
    setAnswers(optionSet);
    setLocked(false);
    setWrongChoice(null);
    setCueText(null);
    setRevealedClueCount(0);
  }, [currentCountry]);

  useEffect(() => {
    if (phase !== "playing" || locked || !currentLevel) return;
    const maxClues = currentLevel.clues.length;
    if (revealedClueCount >= maxClues) return;
    const delay = revealedClueCount === 0 ? 5000 : 3000;
    const id = window.setTimeout(() => {
      setRevealedClueCount((n) => Math.min(n + 1, maxClues));
    }, delay);
    return () => window.clearTimeout(id);
  }, [phase, locked, revealedClueCount, currentLevel]);

  useEffect(() => {
    if (phase === "passport") {
      bgMusicRef.current?.pause();
      return;
    }
    if (!bgMusicRef.current) {
      const audio = new Audio(findFoxyMusic);
      audio.loop = true;
      audio.volume = 0.35;
      bgMusicRef.current = audio;
    }
    bgMusicRef.current.play().catch(() => undefined);
    return () => {
      bgMusicRef.current?.pause();
    };
  }, [phase]);

  useEffect(() => {
    function onKey(e: KeyboardEvent, down: boolean) {
      if (e.key === "ArrowLeft")  { keysRef.current.left  = down; if (down) e.preventDefault(); }
      if (e.key === "ArrowRight") { keysRef.current.right = down; if (down) e.preventDefault(); }
      if (e.key === "ArrowUp")    { keysRef.current.up    = down; if (down) e.preventDefault(); }
      if (e.key === "ArrowDown")  { keysRef.current.down  = down; if (down) e.preventDefault(); }
    }
    const onDown = (e: KeyboardEvent) => onKey(e, true);
    const onUp   = (e: KeyboardEvent) => onKey(e, false);
    window.addEventListener("keydown", onDown);
    window.addEventListener("keyup",   onUp);

    const MIN_SPEED = 0.05;

    function tick() {
      const { left, right, up, down } = keysRef.current;
      const accel = 0.026;
      const friction = 0.96;
      const maxSpeed = 0.189;

      if (right)      planeVelXRef.current = Math.min(planeVelXRef.current + accel, maxSpeed);
      else if (left)  planeVelXRef.current = Math.max(planeVelXRef.current - accel, -maxSpeed);
      else            planeVelXRef.current *= friction;

      // Always keep moving forward — enforce minimum speed in current direction
      if (planeVelXRef.current >= 0 && planeVelXRef.current < MIN_SPEED)  planeVelXRef.current = MIN_SPEED;
      if (planeVelXRef.current < 0  && planeVelXRef.current > -MIN_SPEED) planeVelXRef.current = -MIN_SPEED;

      if (up)         planeVelYRef.current = Math.min(planeVelYRef.current + accel, maxSpeed);
      else if (down)  planeVelYRef.current = Math.max(planeVelYRef.current - accel, -maxSpeed);
      else            planeVelYRef.current *= friction;

      planeXRef.current += planeVelXRef.current;
      // Wrap off-screen left/right
      if (planeXRef.current > 105)  planeXRef.current = -15;
      if (planeXRef.current < -15)  planeXRef.current = 105;

      planeYRef.current = Math.max(4, Math.min(72, planeYRef.current + planeVelYRef.current));

      const el = planeElRef.current;
      if (el) {
        const img = el.querySelector("img") as HTMLImageElement | null;
        if (planeVelXRef.current > 0.05 && img) img.style.transform = "scaleX(-1)";
        else if (planeVelXRef.current < -0.05 && img) img.style.transform = "scaleX(1)";
        el.style.left = `${planeXRef.current}%`;
        el.style.bottom = `${planeYRef.current}%`;
      }
      rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener("keydown", onDown);
      window.removeEventListener("keyup",   onUp);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const completion = useMemo(
    () => Array.from({ length: TOTAL_STOPS }, (_, index) => index < stamps),
    [stamps],
  );

  function startGame(nextDifficulty: FindFoxyDifficulty) {
    setDifficulty(nextDifficulty);
    setPlayerName("Explorer");
    setOrder(shuffle(FIND_FOXY_COUNTRIES.map((_, index) => index)));
    setCurrentIndex(0);
    setScore(0);
    setStreak(0);
    setStamps(0);
    setLocked(false);
    setWrongChoice(null);
    setCueText(null);
    setCueStack(cueQueue(FIND_FOXY_CORRECT_CUES));
    setPhase("playing");
  }

  function handleAnswer(choice: string) {
    if (!currentCountry || locked) return;
    setLocked(true);
    if (choice === currentCountry.name) {
      const streakBonus = streak >= 2 ? 5 : 0;
      setStamps((value) => value + 1);
      addGlobalStamps(1);
      setScore((value) => value + 10 + streakBonus);
      setStreak((value) => value + 1);
      setCueStack((previous) => {
        const nextQueue = previous.length === 0 ? cueQueue(FIND_FOXY_CORRECT_CUES) : [...previous];
        const [nextCue, ...rest] = nextQueue;
        setCueText(nextCue ?? null);
        return rest;
      });
      playTone();
      burstCorrect();
      const countryName = currentCountry.name;
      window.setTimeout(() => {
        setPhase("passport");
        playCorrectExclamation();
        bgMusicRef.current?.pause();
        stopCountryMusic();
        const musicSrc = COUNTRY_MUSIC[countryName];
        if (musicSrc) {
          const audio = new Audio(musicSrc);
          audio.volume = 0.65;
          countryMusicRef.current = audio;
          audio.play().catch(() => undefined);
        }
      }, 500);
      return;
    }

    setWrongChoice(choice);
    setStreak(0);
    playIncorrectExclamation();
  }

  function handlePassportNext() {
    stopCountryMusic();
    bgMusicRef.current?.play().catch(() => undefined);
    if (currentIndex >= TOTAL_STOPS - 1) {
      setPhase("win");
      burstFinale();
      return;
    }
    setCurrentIndex((value) => value + 1);
    setPhase("playing");
  }

  useEffect(() => {
    if (phase === "win" && score > 0) saveScore(score);
  }, [phase, score, saveScore]);

  function resetGame() {
    resetScore();
    stopCountryMusic();
    setPhase("setup");
    setScore(0);
    setStreak(0);
    setStamps(0);
    setCurrentIndex(0);
    setWrongChoice(null);
    setLocked(false);
    setCueText(null);
  }

  return (
    <section className="find-foxy">
      <div
        className="find-foxy__sky"
        onPointerDown={(e) => {
          const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
          if (e.clientX < rect.left + rect.width / 2) keysRef.current.left = true;
          else keysRef.current.right = true;
        }}
        onPointerUp={() => { keysRef.current.left = false; keysRef.current.right = false; }}
        onPointerLeave={() => { keysRef.current.left = false; keysRef.current.right = false; }}
        style={{ cursor: "ew-resize" }}
      >
        <div className="find-foxy__rainbow" />
        <div
          ref={planeElRef}
          className="find-foxy__plane-wrap"
          style={{ bottom: "20%", left: "5%", position: "absolute", zIndex: 0, pointerEvents: "none", userSelect: "none", filter: "drop-shadow(0 10px 18px rgba(27,42,107,0.2))" }}
        >
          <img
            src={asset("/characters/air-fante-plane.png")}
            alt=""
            style={{ width: "13rem", display: "block", transform: "scaleX(-1)" }}
          />
        </div>
        {CLOUDS.map((cloud, index) => (
          <div
            key={index}
            className="find-foxy__cloud"
            style={{
              top: cloud.top,
              width: cloud.width,
              animationDuration: `${cloud.duration}s`,
              animationDelay: `${cloud.delay}s`,
            }}
          />
        ))}
      </div>
      <div className="find-foxy__content">
        <header className="find-foxy__header">
          <div className="find-foxy__tagline">Find Foxy!</div>
        </header>

        {phase === "setup" && (
          <section className="find-foxy__panel">
            <div className="find-foxy__intro">
              <div className="find-foxy__casey-wrap">
                <div className="find-foxy__casey-stack">
                  <img src={asset("/characters/FOX 3.png")} alt="Foxy" style={{ width: "9rem", display: "block" }} />
                </div>
                <div className="find-foxy__bubble-stack">
                  <div className="find-foxy__bubble-big">🚨 FOXY IS MISSING!</div>
                  <div className="find-foxy__bubble-gold">Collect all 20 Jangles Pass stamps to save the day! 🌍✈️</div>
                </div>
              </div>

              <div>
                <div className="find-foxy__section-label">Choose your level!</div>
                <div className="find-foxy__difficulty-grid">
                  <button className="find-foxy__difficulty" data-tone="beginner" onClick={() => startGame("beginner")}>
                    <span className="find-foxy__difficulty-icon">🌱</span>
                    <span>
                      <span className="find-foxy__difficulty-title">Beginner Explorer</span>
                      <span className="find-foxy__difficulty-copy">Simple clues for young adventurers.</span>
                    </span>
                  </button>
                  <button className="find-foxy__difficulty" data-tone="intermediate" onClick={() => startGame("intermediate")}>
                    <span className="find-foxy__difficulty-icon">🗺️</span>
                    <span>
                      <span className="find-foxy__difficulty-title">World Traveller</span>
                      <span className="find-foxy__difficulty-copy">Trickier. Use what you know.</span>
                    </span>
                  </button>
                  <button className="find-foxy__difficulty" data-tone="advanced" onClick={() => startGame("advanced")}>
                    <span className="find-foxy__difficulty-icon">🏆</span>
                    <span>
                      <span className="find-foxy__difficulty-title">Jangles Champion</span>
                      <span className="find-foxy__difficulty-copy">Capitals, facts, harder clues.</span>
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}

        {phase !== "setup" && currentCountry && currentLevel && (
          <section className="find-foxy__stat-row">
            <div className="find-foxy__stat-chip find-foxy__stat-chip--stamps">
              <span className="find-foxy__stat-icon">🎫</span>
              <span className="find-foxy__stat-value">{stamps}</span>
              <span className="find-foxy__stat-of">/{TOTAL_STOPS}</span>
            </div>
            <div className="find-foxy__stat-chip find-foxy__stat-chip--streak">
              <span className="find-foxy__stat-icon">🔥</span>
              <span className="find-foxy__stat-value">{streak}</span>
            </div>
            <div className="find-foxy__stat-chip find-foxy__stat-chip--level">
              <span className="find-foxy__stat-icon">
                {difficulty === "beginner" ? "🌱" : difficulty === "intermediate" ? "🗺️" : "🏆"}
              </span>
              <span className="find-foxy__stat-label">{FIND_FOXY_LEVEL_LABELS[difficulty]}</span>
            </div>
          </section>
        )}

        {(phase === "playing" || phase === "passport") && currentCountry && currentLevel && (
          <section className="find-foxy__game-card">
            <div className="find-foxy__destination">Destination {currentIndex + 1} of {TOTAL_STOPS}</div>
            <div className="find-foxy__question-block">
              <div className="find-foxy__question-eyebrow">
                Where did Casey send Foxy?
                <img src={asset("/characters/FOX 3.png")} alt="Foxy" style={{ height: "2.2em", verticalAlign: "middle", marginLeft: "0.35em" }} />
              </div>
              <div className="find-foxy__casey-row">
                <div className="find-foxy__casey-stack">
                  <img
                    className="find-foxy__casey-photo find-foxy__casey-photo--small"
                    src={CASEY_IMAGES[currentIndex % CASEY_IMAGES.length]}
                    alt="Casey Bea Jangles"
                  />
                </div>
                <div className="find-foxy__speech find-foxy__speech--question">
                  <div className="find-foxy__casey-copy">{currentLevel.casey}</div>
                  {cueText && !locked && <div className="find-foxy__cue">🎉 {cueText}</div>}
                </div>
              </div>
            </div>

            <div className="grid gap-1.5 sm:gap-2">
              {currentLevel.clues.map((clue, i) => (
                <motion.div
                  key={`${currentCountry.name}-${i}`}
                  initial={false}
                  animate={i < revealedClueCount ? { opacity: 1, x: 0 } : { opacity: 0, x: -12 }}
                  transition={{ duration: 0.32 }}
                  className="grid items-start gap-2 rounded-xl bg-[#FFFBF0] px-3 py-2 text-sm font-bold leading-snug"
                  style={{ gridTemplateColumns: "auto 1fr", border: "2px solid #1a1a1a", borderLeft: "4px solid #FBBF24" }}
                >
                  <span className="text-base leading-snug">{clue.e}</span>
                  <span>{clue.t}</span>
                </motion.div>
              ))}
            </div>

            <div className="find-foxy__section-label mt-2">🌍 Which country is Foxy hiding in?</div>
            <div className="find-foxy__answers">
              {answers.map((answer) => {
                const isCorrect = locked && !wrongChoice && answer === currentCountry.name;
                const isWrong = wrongChoice === answer;
                return (
                  <button
                    key={answer}
                    className={`find-foxy__answer${isCorrect ? " is-correct" : ""}${isWrong ? " is-wrong" : ""}`}
                    disabled={locked && !wrongChoice}
                    onClick={() => handleAnswer(answer)}
                  >
                    <span className="find-foxy__answer-flag">{FIND_FOXY_FLAGS[answer] ?? "🌍"}</span>
                    {answer}
                  </button>
                );
              })}
            </div>

            {wrongChoice && (
              <motion.div
                className="find-foxy__try-again-wrap"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.15 }}
              >
                <motion.button
                  className="find-foxy__try-again-btn"
                  initial={{ scale: 0.7 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 420, damping: 18 }}
                  onClick={() => { setLocked(false); setWrongChoice(null); }}
                >
                  <div className="find-foxy__try-again-oops">Oops! Not that one!</div>
                  Try Again!
                </motion.button>
              </motion.div>
            )}
          </section>
        )}

        {phase === "passport" && currentCountry && (
          <motion.div
            className="find-foxy__overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
          >
            <div className="find-foxy__passport-book">
              <div className="find-foxy__passport-cover">
                <img className="find-foxy__passport-logo" src={foxyLogo} alt="Find Foxy" />
                <div className="find-foxy__passport-title">Jangles Pass</div>
                <div className="find-foxy__passport-subtitle">World Tour ✈ Official</div>
              </div>
              <div className="find-foxy__passport-page">
                <div className="find-foxy__passport-header">
                  <div className="find-foxy__page-number">Entry {currentIndex + 1} of {TOTAL_STOPS}</div>
                  <span className="find-foxy__country-flag">{FIND_FOXY_FLAGS[currentCountry.name]}</span>
                  <div className="find-foxy__country-name">{currentCountry.name}</div>
                </div>
                <div className="find-foxy__stamp">
                  <div className="find-foxy__stamp-top">Jangles Pass</div>
                  <div className="find-foxy__stamp-emoji">✈️</div>
                  <div className="find-foxy__passport-found">Found!</div>
                  <div className="find-foxy__stamp-number">{currentIndex + 1} / {TOTAL_STOPS}</div>
                </div>
                <div className="find-foxy__passport-fact">{currentCountry.fact}</div>
                <button className="find-foxy__passport-next" onClick={handlePassportNext}>
                  {currentIndex === TOTAL_STOPS - 1 ? "See My Full Jangles Pass! 🎉" : "Board the Plane! ✈"}
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {phase === "win" && (
          <div className="find-foxy__overlay">
            <div className="find-foxy__full-passport">
              <div className="find-foxy__full-passport-cover">
                <img className="find-foxy__passport-logo" src={foxyLogo} alt="Find Foxy" />
                <div className="find-foxy__full-passport-title">Jangles Pass</div>
                <div className="find-foxy__full-passport-name">{playerName}</div>
                <div className="find-foxy__full-passport-subtitle">World Tour ✈ Complete</div>
                <div className="find-foxy__full-score-pill">
                  <span className="find-foxy__full-score-val">{score}</span>
                  <span className="find-foxy__full-score-lbl">stars</span>
                </div>
              </div>

              <div className="find-foxy__full-passport-pages">
                <div className="find-foxy__full-pages-header">
                  <span>🎉 All {order.length} stamps collected!</span>
                </div>

                <div className="find-foxy__full-stamp-grid">
                  {order.map((countryIdx, visitIdx) => {
                    const country = FIND_FOXY_COUNTRIES[countryIdx];
                    return (
                      <div
                        key={country.name}
                        className="find-foxy__full-stamp-card"
                        style={{ animationDelay: `${visitIdx * 0.04}s` }}
                      >
                        <div className="find-foxy__full-stamp-circle">
                          <span className="find-foxy__full-stamp-flag">{FIND_FOXY_FLAGS[country.name] ?? "🌍"}</span>
                        </div>
                        <div className="find-foxy__full-stamp-num">#{visitIdx + 1}</div>
                        <div className="find-foxy__full-stamp-name">{country.name}</div>
                      </div>
                    );
                  })}
                </div>

                {/* Leaderboard */}
                <div style={{ background: "#1a1a2e", borderRadius: "1rem", border: "2px solid #333", padding: "1rem", marginBottom: "0.5rem", textAlign: "left" }}>
                  <div style={{ fontSize: "0.6rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.2em", color: "#6b7280", marginBottom: "0.25rem" }}>🏆 Top Scores — Find Foxy</div>
                  {user ? (
                    <p style={{ fontSize: "0.75rem", fontWeight: 700, marginBottom: "0.5rem", color: saving ? "#9ca3af" : saved ? "#4ade80" : "transparent" }}>
                      {saving ? "Saving score…" : "✓ Score saved to leaderboard"}
                    </p>
                  ) : (
                    <button onClick={() => openAuthModal("sign-up")} style={{ fontSize: "0.75rem", fontWeight: 700, color: "#facc15", textDecoration: "underline", marginBottom: "0.5rem", display: "block", background: "none", border: "none", cursor: "pointer" }}>
                      🏆 Sign in to save your score
                    </button>
                  )}
                  <Leaderboard gameSlug="find-foxy" limit={5} theme="dark" />
                </div>

                <button className="find-foxy__play-again" onClick={resetGame}>
                  Fly Again!
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
