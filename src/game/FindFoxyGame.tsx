import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { burstCorrect, burstFinale } from "@/game/confetti";
import { playCorrectExclamation, playIncorrectExclamation } from "./exclamations";
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
    if (phase === "setup") {
      if (bgMusicRef.current) {
        bgMusicRef.current.pause();
        bgMusicRef.current.currentTime = 0;
      }
      return;
    }
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

  function resetGame() {
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
      <div className="find-foxy__sky">
        <div className="find-foxy__rainbow" />
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
