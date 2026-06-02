import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  useMapContext,
} from "react-simple-maps";
import { burstCorrect, burstFinale } from "@/game/confetti";
import { useStamps } from "@/hooks/useStamps";
import rawData from "@/game/data/world-chase.json";
import "@/game/world-chase.css";

import { playCorrectExclamation, playIncorrectExclamation } from "./exclamations";
import { CountdownBar, WRONG_MS } from "./WrongFeedback";
import { asset } from "@/lib/asset";

// ── Types ─────────────────────────────────────────────────────────────────────

type WorldChaseClue = { emoji: string; text: string };
type WrongOption = { cityId: string; cityName: string; lat: number; lng: number };

type City = {
  cityId: string;
  cityName: string;
  continent: string;
  lat: number;
  lng: number;
  clues: WorldChaseClue[];
  funFact: string;
};

type WorldChaseData = { cities: City[] };

type WorldChasePhase =
  | "briefing"
  | "traveling"
  | "arrived"
  | "guessing"
  | "wrong-guess"
  | "found"
  | "failure";

// ── Constants ─────────────────────────────────────────────────────────────────

const CITIES = (rawData as WorldChaseData).cities;
const ROUTE_LENGTH = 8;
const MAX_MOVES = 14;
const TRAVEL_MS = 1600;
const GEO_URL = "/data/world-110m.json";
const HQ_COORD: [number, number] = [-79.38, 43.65]; // Toronto

const CITY_MUSIC: Record<string, string> = {
  "tokyo":        "/music/JAPAN.wav",
  "london":       "/music/UK.wav",
  "buenos-aires": "/music/ARGENTINA DRUMS AND HORNS_1.2.wav",
  "sydney":       "/music/Jamie Jangles_Daniel_Australia.wav",
  "lima":         "/music/PERU.wav",
  "rome":         "/music/ITALY.wav",
  "seoul":        "/music/SOUTH KOREA.wav",
  "madrid":       "/music/SPAIN1.2.wav",
  "paris":        "/music/FRANCE.wav",
  "nairobi":      "/music/KENYA.wav",
  "cape-town":    "/music/SOUTH AFRICA_1.2.wav",
  "mexico-city":  "/music/MEXICO.wav",
};

type CityInfo = { flag: string; country: string; musicStyle: string; musicFact: string };
const CITY_INFO: Record<string, CityInfo> = {
  "tokyo":        { flag: "🇯🇵", country: "Japan",        musicStyle: "J-Pop & Taiko",       musicFact: "Taiko drumming goes back over 1,000 years and was used to signal armies in battle!" },
  "london":       { flag: "🇬🇧", country: "England",      musicStyle: "Rock & Pop",           musicFact: "London is the birthplace of some of the world's most famous rock bands!" },
  "buenos-aires": { flag: "🇦🇷", country: "Argentina",    musicStyle: "Tango",                musicFact: "Tango was born in Buenos Aires in the late 1800s and is now danced worldwide!" },
  "sydney":       { flag: "🇦🇺", country: "Australia",    musicStyle: "Didgeridoo & Pop",     musicFact: "The didgeridoo is one of the oldest wind instruments on Earth — over 1,500 years old!" },
  "lima":         { flag: "🇵🇪", country: "Peru",         musicStyle: "Andean Folk",          musicFact: "The pan flute (zampoña) has been played in the Andes mountains for thousands of years!" },
  "rome":         { flag: "🇮🇹", country: "Italy",        musicStyle: "Opera & Folk",         musicFact: "Italy invented the piano and opera — two of the most popular musical forms in history!" },
  "seoul":        { flag: "🇰🇷", country: "South Korea",  musicStyle: "K-Pop",                musicFact: "K-Pop groups like BTS have millions of fans in every country on the planet!" },
  "madrid":       { flag: "🇪🇸", country: "Spain",        musicStyle: "Flamenco",             musicFact: "Flamenco is so special that UNESCO listed it as an Intangible Cultural Heritage of Humanity!" },
  "paris":        { flag: "🇫🇷", country: "France",       musicStyle: "Chanson & Accordion",  musicFact: "The accordion is the sound of Paris — street musicians have played it here for over 200 years!" },
  "nairobi":      { flag: "🇰🇪", country: "Kenya",        musicStyle: "Benga & Afropop",      musicFact: "Benga music started in Kenya in the 1940s and blends traditional rhythms with electric guitar!" },
  "cape-town":    { flag: "🇿🇦", country: "South Africa", musicStyle: "Goema",                musicFact: "Goema is a rhythmic music style from Cape Town, rooted in street parades and local cultural traditions!" },
  "mexico-city":  { flag: "🇲🇽", country: "Mexico",       musicStyle: "Mariachi",             musicFact: "Mariachi bands traditionally wear charro suits and sombrero hats when they perform!" },
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Pick ROUTE_LENGTH cities, maximising continent spread, then shuffle order. */
function generateRoute(): City[] {
  const byContinent: Record<string, City[]> = {};
  for (const c of CITIES) {
    if (!byContinent[c.continent]) byContinent[c.continent] = [];
    byContinent[c.continent].push(c);
  }
  const picked: City[] = [];
  const usedIds = new Set<string>();
  // One from each continent first
  for (const cont of shuffle(Object.keys(byContinent))) {
    const choice = shuffle(byContinent[cont])[0];
    picked.push(choice);
    usedIds.add(choice.cityId);
  }
  // Fill remaining slots from leftover cities
  for (const city of shuffle(CITIES)) {
    if (picked.length >= ROUTE_LENGTH) break;
    if (!usedIds.has(city.cityId)) {
      picked.push(city);
      usedIds.add(city.cityId);
    }
  }
  return shuffle(picked);
}

function playTone() {
  if (typeof window === "undefined") return;
  const Ctor =
    window.AudioContext ??
    (window as typeof window & { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;
  if (!Ctor) return;
  const ctx = new Ctor();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "triangle";
  osc.frequency.setValueAtTime(660, ctx.currentTime);
  osc.frequency.linearRampToValueAtTime(880, ctx.currentTime + 0.18);
  gain.gain.setValueAtTime(0.001, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.06, ctx.currentTime + 0.04);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.28);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.3);
  void ctx.resume().catch(() => undefined);
}

// ── Map Contents (inside ComposableMap so useMapContext works) ─────────────────

type MapContentsProps = {
  route: City[];
  stopIndex: number;
  visitedCityIds: string[];
  phase: WorldChasePhase;
  travelingToId: string | null;
  choices: WrongOption[];
  facingRight: boolean;
  onTravelComplete: () => void;
  onCityClick: (cityId: string) => void;
};

function MapContents({
  route,
  stopIndex,
  visitedCityIds,
  phase,
  facingRight,
  travelingToId,
  choices,
  onTravelComplete,
  onCityClick,
}: MapContentsProps) {
  const { projection } = useMapContext();

  const project = useCallback(
    (lng: number, lat: number): { x: number; y: number } => {
      const result = projection([lng, lat]);
      return result ? { x: result[0], y: result[1] } : { x: 400, y: 250 };
    },
    [projection],
  );

  const planeTarget = useMemo(() => {
    if (travelingToId) {
      const stop = route.find((s) => s.cityId === travelingToId);
      if (stop) return project(stop.lng, stop.lat);
    }
    if (stopIndex >= 0 && stopIndex < route.length) {
      return project(route[stopIndex].lng, route[stopIndex].lat);
    }
    return project(HQ_COORD[0], HQ_COORD[1]);
  }, [travelingToId, stopIndex, route, project]);

  const trailPairs = useMemo(() => {
    const pairs: [City, City][] = [];
    for (let i = 1; i < visitedCityIds.length; i++) {
      const prev = route.find((s) => s.cityId === visitedCityIds[i - 1]);
      const curr = route.find((s) => s.cityId === visitedCityIds[i]);
      if (prev && curr) pairs.push([prev, curr]);
    }
    return pairs;
  }, [visitedCityIds, route]);

  const currentStop = stopIndex >= 0 && stopIndex < route.length ? route[stopIndex] : null;

  return (
    <>
      <Geographies geography={GEO_URL}>
        {({ geographies }) =>
          geographies.map((geo) => (
            <Geography
              key={geo.rsmKey}
              geography={geo}
              fill="#d4e9c2"
              stroke="#ffffff"
              strokeWidth={0.5}
              style={{ outline: "none" }}
            />
          ))
        }
      </Geographies>

      {/* Dashed gold trail — drawn in screen space so it matches the plane's path */}
      {trailPairs.map(([from, to], i) => {
        const a = project(from.lng, from.lat);
        const b = project(to.lng, to.lat);
        return (
          <line
            key={`trail-${i}`}
            x1={a.x} y1={a.y}
            x2={b.x} y2={b.y}
            stroke="#fbbf24"
            strokeWidth={2.5}
            strokeDasharray="8 5"
            strokeLinecap="round"
          />
        );
      })}

      {/* Visited city markers */}
      {visitedCityIds.slice(0, -1).map((cityId) => {
        const stop = route.find((s) => s.cityId === cityId);
        if (!stop) return null;
        return (
          <Marker key={`visited-${cityId}`} coordinates={[stop.lng, stop.lat]}>
            <circle r={5} fill="#fbbf24" stroke="#1a1a1a" strokeWidth={2} />
          </Marker>
        );
      })}

      {/* Current city pulse */}
      {currentStop && (
        <Marker coordinates={[currentStop.lng, currentStop.lat]}>
          <circle
            r={18}
            fill="none"
            stroke="#ff4eab"
            strokeWidth={2}
            style={{ animation: "wc-pulse-ring 1.6s ease-out infinite" }}
          />
          <circle r={7} fill="#ffffff" stroke="#1a1a1a" strokeWidth={2.5} />
        </Marker>
      )}

      {/* City choice pins (guessing phase) */}
      {phase === "guessing" &&
        choices.map((choice) => (
          <Marker key={choice.cityId} coordinates={[choice.lng, choice.lat]}>
            <g
              onClick={() => onCityClick(choice.cityId)}
              style={{ cursor: "pointer" }}
              role="button"
              tabIndex={0}
              className="wc-pin"
            >
              <polygon points="0,0 -1.5,-14 1.5,-14" fill="#2a2a2a" />
              <circle cx={0} cy={-21} r={7} fill="#ffffff" stroke="#1a1a1a" strokeWidth={1.5} className="wc-pin__body" />
              <circle cx={-2} cy={-24} r={2.5} fill="rgba(255,255,255,0.18)" />
              <text
                x={10}
                y={-26}
                dominantBaseline="middle"
                textAnchor="start"
                fontSize={9}
                fontWeight={800}
                fill="#1a1a1a"
                stroke="white"
                strokeWidth={3}
                paintOrder="stroke"
                style={{ fontFamily: "'Baloo 2', system-ui, sans-serif", pointerEvents: "none" }}
              >
                {choice.cityName.split(", ")[0]}
              </text>
              <text
                x={10}
                y={-16}
                dominantBaseline="middle"
                textAnchor="start"
                fontSize={7.5}
                fontWeight={700}
                fill="#555"
                stroke="white"
                strokeWidth={2.5}
                paintOrder="stroke"
                style={{ fontFamily: "'Baloo 2', system-ui, sans-serif", pointerEvents: "none" }}
              >
                {choice.cityName.split(", ")[1]}
              </text>
            </g>
          </Marker>
        ))}

      {/* Animated plane — initial matches animate so it doesn't fly in from (0,0) on mount */}
      <motion.g
        initial={planeTarget}
        animate={planeTarget}
        transition={{ duration: TRAVEL_MS / 1000, ease: "easeInOut" }}
        onAnimationComplete={phase === "traveling" ? onTravelComplete : undefined}
      >
        <g transform={facingRight ? "scale(-1,1)" : undefined}>
          <image
            href="/characters/air-fante-plane.png"
            x={-23}
            y={-13}
            width={46}
            height={25}
            style={{ userSelect: "none" }}
          />
        </g>
      </motion.g>
    </>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export function WorldChaseGame() {
  const [phase, setPhase] = useState<WorldChasePhase>("briefing");
  const [stopIndex, setStopIndex] = useState(-1);
  const [movesLeft, setMovesLeft] = useState(MAX_MOVES);
  const [visitedCityIds, setVisitedCityIds] = useState<string[]>([]);
  const [travelingToId, setTravelingToId] = useState<string | null>(null);
  const [isShaking, setIsShaking] = useState(false);
  const [facingRight, setFacingRight] = useState(false);
  const [showCluesReview, setShowCluesReview] = useState(false);

  const [, addGlobalStamps] = useStamps();
  const shakeTimerRef = useRef<number | null>(null);
  const arrivalAudioRef = useRef<HTMLAudioElement | null>(null);

  const [route, setRoute] = useState<City[]>(() => generateRoute());

  // ── Computed choices for guessing phase (3 wrong + 1 correct from full pool)
  // Wrong picks are drawn one-per-continent, preferring continents different from
  // the correct city, so the four pins always appear spread across the map.
  const choices = useMemo<WrongOption[]>(() => {
    if (stopIndex < 0 || stopIndex >= route.length - 1) return [];
    const nextCity = route[stopIndex + 1];

    // Group all cities except the correct one by continent
    const byContinent: Record<string, City[]> = {};
    for (const c of CITIES) {
      if (c.cityId === nextCity.cityId) continue;
      if (!byContinent[c.continent]) byContinent[c.continent] = [];
      byContinent[c.continent].push(c);
    }

    // Prefer continents different from the correct city (less likely to be nearby)
    const otherConts = shuffle(Object.keys(byContinent).filter((k) => k !== nextCity.continent));
    const sameCont  = Object.keys(byContinent).filter((k) => k === nextCity.continent);
    const continentOrder = [...otherConts, ...sameCont];

    // Pick one random city from each continent until we have 3
    const wrongPicks: City[] = [];
    for (const cont of continentOrder) {
      if (wrongPicks.length >= 3) break;
      wrongPicks.push(shuffle(byContinent[cont])[0]);
    }

    // Safety fallback if somehow we still need more
    if (wrongPicks.length < 3) {
      const usedIds = new Set([nextCity.cityId, ...wrongPicks.map((c) => c.cityId)]);
      for (const c of shuffle(CITIES)) {
        if (wrongPicks.length >= 3) break;
        if (!usedIds.has(c.cityId)) wrongPicks.push(c);
      }
    }

    return shuffle([
      { cityId: nextCity.cityId, cityName: nextCity.cityName, lat: nextCity.lat, lng: nextCity.lng },
      ...wrongPicks.map((c) => ({ cityId: c.cityId, cityName: c.cityName, lat: c.lat, lng: c.lng })),
    ]);
  }, [stopIndex, route]);

  // ── Audio
  function stopArrivalMusic() {
    if (arrivalAudioRef.current) {
      arrivalAudioRef.current.pause();
      arrivalAudioRef.current = null;
    }
  }

  function playArrivalMusic(cityId: string) {
    stopArrivalMusic();
    const src = CITY_MUSIC[cityId];
    if (!src) return;
    const audio = new Audio(src);
    arrivalAudioRef.current = audio;
    audio.play().catch(() => undefined);
  }

  // ── Handlers
  function handleStartChase() {
    setStopIndex(-1);
    setVisitedCityIds([]);
    setMovesLeft(MAX_MOVES);
    setFacingRight(route[0].lng > HQ_COORD[0]);
    setTravelingToId(route[0].cityId);
    setPhase("traveling");
  }

  const handleTravelComplete = useCallback(() => {
    if (!travelingToId) return;
    const idx = route.findIndex((s) => s.cityId === travelingToId);
    setStopIndex(idx);
    setVisitedCityIds((prev) =>
      prev.includes(travelingToId) ? prev : [...prev, travelingToId],
    );
    setTravelingToId(null);
    playArrivalMusic(travelingToId);
    if (idx === route.length - 1) {
      burstFinale();
      addGlobalStamps(1);
      setPhase("found");
    } else {
      setPhase("arrived");
    }
  }, [travelingToId, route, addGlobalStamps]);

  function handleLeadButton() {
    setShowCluesReview(false);
    setPhase("guessing");
  }

  function handleCityClick(cityId: string) {
    if (phase !== "guessing") return;
    const correctId = route[stopIndex + 1]?.cityId;

    if (cityId === correctId) {
      playTone();
      playCorrectExclamation();
      burstCorrect();
      const dest = route.find((s) => s.cityId === cityId);
      const origin = route[stopIndex];
      if (dest && origin) setFacingRight(dest.lng > origin.lng);
      stopArrivalMusic();
      setShowCluesReview(false);
      setTravelingToId(cityId);
      setPhase("traveling");
    } else {
      playIncorrectExclamation();
      const remaining = movesLeft - 1;
      setMovesLeft(remaining);
      setIsShaking(true);
      if (shakeTimerRef.current) clearTimeout(shakeTimerRef.current);
      shakeTimerRef.current = window.setTimeout(() => {
        setIsShaking(false);
        if (remaining <= 0) {
          setPhase("failure");
        } else {
          setPhase("wrong-guess");
          shakeTimerRef.current = window.setTimeout(() => {
            setPhase("guessing");
          }, WRONG_MS - 500);
        }
      }, 500);
    }
  }

  function handleReset(newRoute = true) {
    stopArrivalMusic();
    if (newRoute) setRoute(generateRoute());
    setPhase("briefing");
    setStopIndex(-1);
    setVisitedCityIds([]);
    setMovesLeft(MAX_MOVES);
    setTravelingToId(null);
    setShowCluesReview(false);
  }

  useEffect(() => {
    return () => {
      if (shakeTimerRef.current) clearTimeout(shakeTimerRef.current);
      stopArrivalMusic();
    };
  }, []);

  const currentStop = stopIndex >= 0 && stopIndex < route.length ? route[stopIndex] : null;
  const showHud = phase === "arrived" || phase === "guessing" || phase === "wrong-guess";

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="world-chase">
      <div className="world-chase__bg" />
      <div className="world-chase__content">

        {/* HUD */}
        {showHud && (
          <div className="world-chase__hud">
            <span className="world-chase__stat-chip">
              🗺️ Stop {stopIndex + 1} of {route.length}
            </span>
            <span className={`world-chase__stat-chip${movesLeft <= 3 ? " world-chase__stat-chip--warning" : ""}`}>
              🔍 {movesLeft} guess{movesLeft !== 1 ? "es" : ""} left
            </span>
          </div>
        )}

        {/* Map */}
        <div className="world-chase__map-wrap">
          <ComposableMap
            width={960}
            height={480}
            projectionConfig={{ scale: 160, center: [0, 15] }}
            style={{ width: "100%", height: "100%" }}
          >
            <MapContents
              route={route}
              stopIndex={stopIndex}
              visitedCityIds={visitedCityIds}
              phase={phase}
              travelingToId={travelingToId}
              choices={choices}
              facingRight={facingRight}
              onTravelComplete={handleTravelComplete}
              onCityClick={handleCityClick}
            />
          </ComposableMap>

          {/* Traveling caption */}
          {phase === "traveling" && (
            <motion.div
              className="world-chase__travel-caption"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
            >
              ✈️ Flying to the next stop…
            </motion.div>
          )}

          {/* Pink Clues button while guessing */}
          {(phase === "guessing" || phase === "wrong-guess") && currentStop && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ position: "absolute", bottom: "0.85rem", left: "0.85rem", zIndex: 20 }}
            >
              {phase === "wrong-guess" && (
                <div style={{
                  background: "#ffecec",
                  border: "2px solid #1a1a1a",
                  borderRadius: "0.6rem",
                  padding: "0.3rem 0.6rem",
                  fontSize: "0.75rem",
                  fontWeight: 800,
                  marginBottom: "0.4rem",
                  minWidth: "10rem",
                }}>
                  🤔 Not quite — try again!
                  <CountdownBar ms={WRONG_MS - 500} color="#c0392b" />
                </div>
              )}
              <motion.button
                onClick={() => setShowCluesReview(true)}
                whileTap={{ y: 2, scale: 0.97 }}
                style={{
                  background: "#ff4eab",
                  color: "#fff",
                  border: "3px solid #1a1a1a",
                  borderBottomWidth: 5,
                  borderRightWidth: 4,
                  borderRadius: "9999px",
                  padding: "0.55rem 1.1rem",
                  fontSize: "0.9rem",
                  fontWeight: 900,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.4rem",
                }}
              >
                📋 Clues
              </motion.button>
            </motion.div>
          )}

          {/* Overlays */}
          <AnimatePresence>
            {phase === "briefing" && (
              <BriefingPanel onStart={handleStartChase} />
            )}
            {phase === "arrived" && currentStop && (
              <ArrivedPanel
                stop={currentStop}
                nextStop={route[stopIndex + 1] ?? null}
                isLastStop={stopIndex === route.length - 1}
                onLead={handleLeadButton}
              />
            )}
            {(phase === "guessing" || phase === "wrong-guess") && showCluesReview && currentStop && (
              <ArrivedPanel
                key="review"
                stop={currentStop}
                nextStop={route[stopIndex + 1] ?? null}
                isLastStop={false}
                isReview
                onLead={handleLeadButton}
                onClose={() => setShowCluesReview(false)}
              />
            )}
            {phase === "found" && currentStop && (
              <FoundPanel
                route={route}
                visitedCityIds={visitedCityIds}
                onNext={() => handleReset(true)}
                onReplay={() => handleReset(false)}
              />
            )}
            {phase === "failure" && (
              <FailurePanel onTryAgain={() => handleReset(false)} />
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

// ── Sub-panels ────────────────────────────────────────────────────────────────

function BriefingPanel({ onStart }: { onStart: () => void }) {
  return (
    <motion.div
      className="world-chase__overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="world-chase__panel world-chase__panel--pop"
        initial={{ scale: 0.88, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.88, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 24 }}
      >
        <div style={{
          background: "#fff",
          border: "3px solid #1a1a1a",
          borderBottomWidth: 6,
          borderRightWidth: 5,
          borderRadius: "1.25rem",
          padding: "1.25rem",
          marginBottom: "1rem",
          textAlign: "center",
        }}>
          <img
            src={asset("/characters/spaceship-jaime-jeff.png")}
            alt="Jaime and Jeff in their rocket"
            style={{
              width: "100%",
              maxWidth: 220,
              display: "block",
              margin: "0 auto 0.5rem",
              maskImage: "linear-gradient(to right, transparent 0%, black 22%)",
              WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 22%)",
            }}
          />
          <h1 style={{ fontSize: "1.5rem", fontWeight: 900, lineHeight: 1.2, marginBottom: "0.6rem" }}>
            Find Jaime & Jeff!
          </h1>
          <p style={{ fontSize: "0.95rem", fontWeight: 600, color: "#1a1a1a", lineHeight: 1.5 }}>
            Jaime and Jeff have been spotted across eight cities on different continents!
            Follow their trail around the world and track them down!
          </p>
        </div>

        <div style={{
          background: "#fff9c4",
          border: "3px solid #1a1a1a",
          borderBottomWidth: 5,
          borderRightWidth: 4,
          borderRadius: "1rem",
          padding: "0.75rem 1rem",
          marginBottom: "1rem",
        }}>
          <div style={{ fontSize: "0.8rem", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.5rem" }}>
            🗺️ How to Play
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
            {[
              { n: "1", emoji: "📋", text: "Read the clues at each city", color: "#FF4EAB" },
              { n: "2", emoji: "📍", text: "Tap where you think they went next on the map", color: "#3B82F6" },
              { n: "3", emoji: "🔍", text: <>You have <strong>{MAX_MOVES} guesses</strong> — use them wisely!</>, color: "#22C55E" },
            ].map(({ n, emoji, text, color }) => (
              <div key={n} style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.88rem", fontWeight: 700 }}>
                <span style={{
                  background: color,
                  color: "#fff",
                  borderRadius: "9999px",
                  width: "1.3rem",
                  height: "1.3rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "0.72rem",
                  fontWeight: 900,
                  flexShrink: 0,
                }}>{n}</span>
                <span style={{ fontSize: "1.1rem", flexShrink: 0 }}>{emoji}</span>
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>

        <motion.button
          onClick={onStart}
          whileTap={{ y: 3, scale: 0.97 }}
          style={{
            width: "100%",
            background: "#fbbf24",
            border: "3px solid #1a1a1a",
            borderBottomWidth: 6,
            borderRightWidth: 5,
            borderRadius: "9999px",
            padding: "0.85rem 1rem",
            fontSize: "1.1rem",
            fontWeight: 900,
            cursor: "pointer",
          }}
        >
          Find Them! 🌍
        </motion.button>
      </motion.div>
    </motion.div>
  );
}

function Equalizer() {
  return (
    <span className="wc-equalizer" aria-hidden>
      <span className="wc-equalizer__bar" style={{ animationDelay: "0s" }} />
      <span className="wc-equalizer__bar" style={{ animationDelay: "0.18s" }} />
      <span className="wc-equalizer__bar" style={{ animationDelay: "0.36s" }} />
      <span className="wc-equalizer__bar" style={{ animationDelay: "0.12s" }} />
    </span>
  );
}

function ArrivedPanel({
  stop,
  nextStop,
  isLastStop,
  isReview = false,
  onLead,
  onClose,
}: {
  stop: City;
  nextStop: City | null;
  isLastStop: boolean;
  isReview?: boolean;
  onLead: () => void;
  onClose?: () => void;
}) {
  const info = CITY_INFO[stop.cityId];
  const [countdown, setCountdown] = useState(isReview ? 0 : 5);
  const [showClues, setShowClues] = useState(isReview);

  useEffect(() => {
    if (isReview) { setCountdown(0); setShowClues(true); return; }
    setCountdown(5);
    setShowClues(false);
    const iv = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) { clearInterval(iv); setShowClues(true); return 0; }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(iv);
  }, [stop.cityId, isReview]);

  return (
    <motion.div
      className="world-chase__overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="world-chase__panel"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -20, opacity: 0 }}
        transition={{ type: "spring", stiffness: 280, damping: 22 }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", gap: "0.65rem" }}>

          {/* PILL 1 — Current location */}
          <div style={{
            flex: "0 0 auto",
            width: "44%",
            background: "#e0f9f5",
            border: "3px solid #1a1a1a",
            borderBottomWidth: 5,
            borderRightWidth: 4,
            borderRadius: "1.25rem",
            padding: "0.9rem 0.85rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.5rem",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              {info && <span style={{ fontSize: "2.2rem", lineHeight: 1, flexShrink: 0 }}>{info.flag}</span>}
              <div>
                <div style={{ fontSize: "1.15rem", fontWeight: 900, lineHeight: 1.2 }}>
                  {info ? `You're in ${info.country}!` : stop.cityName}
                </div>
                <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#444" }}>
                  📍 {stop.cityName}
                </div>
              </div>
            </div>

            {info && (
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: "0.4rem",
                background: "#fbbf24",
                border: "2px solid #1a1a1a",
                borderRadius: "0.6rem",
                padding: "0.3rem 0.5rem",
              }}>
                <Equalizer />
                <span style={{ fontSize: "0.85rem", fontWeight: 900 }}>{info.musicStyle}</span>
              </div>
            )}

            {info && (
              <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "#333", lineHeight: 1.4 }}>
                🎵 {info.musicFact}
              </div>
            )}

            <div style={{
              background: "#fffbf0",
              border: "2px solid #1a1a1a",
              borderRadius: "0.65rem",
              padding: "0.4rem 0.55rem",
              fontSize: "0.85rem",
              fontWeight: 600,
              lineHeight: 1.4,
            }}>
              💡 {stop.funFact}
            </div>
          </div>

          {/* PILL 2 — Countdown or clues */}
          {!isLastStop && (
            <AnimatePresence mode="wait">
              {!showClues ? (
                /* Countdown placeholder */
                <motion.div
                  key="countdown"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  style={{
                    flex: 1,
                    alignSelf: "stretch",
                    background: "#fff3f9",
                    border: "3px dashed #ff4eab",
                    borderRadius: "1.25rem",
                    padding: "0.9rem 0.85rem",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.4rem",
                    minHeight: 180,
                  }}
                >
                  <span style={{ fontSize: "2rem" }}>🔍</span>
                  <div style={{ fontSize: "0.85rem", fontWeight: 800, color: "#ff4eab", textAlign: "center" }}>
                    Clues coming in
                  </div>
                  <motion.div
                    key={countdown}
                    initial={{ scale: 1.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 20 }}
                    style={{ fontSize: "3.5rem", fontWeight: 900, color: "#ff4eab", lineHeight: 1 }}
                  >
                    {countdown}
                  </motion.div>
                </motion.div>
              ) : (
                /* Clues pill */
                <motion.div
                  key="clues"
                  initial={{ opacity: 0, scale: 0.88, x: 20 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 24 }}
                  style={{
                    flex: 1,
                    background: "#fff3f9",
                    border: "3px solid #1a1a1a",
                    borderBottomWidth: 5,
                    borderRightWidth: 4,
                    borderRadius: "1.25rem",
                    padding: "0.9rem 0.85rem",
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.5rem",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <span style={{ fontSize: "2.2rem", lineHeight: 1, flexShrink: 0 }}>🕵️</span>
                    <div>
                      <div style={{ fontSize: "1.15rem", fontWeight: 900, lineHeight: 1.2 }}>
                        Where did they go NEXT?
                      </div>
                      <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#ff4eab" }}>
                        Follow the clues!
                      </div>
                    </div>
                  </div>

                  <div style={{ height: 2, background: "#ff4eab", opacity: 0.2, borderRadius: 9999 }} />

                  <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#555" }}>
                    Witnesses spotted Jaime & Jeff…
                  </div>

                  {(nextStop?.clues ?? []).map((clue, i) => (
                    <div
                      key={i}
                      className="world-chase__clue"
                      style={{ animationDelay: `${i * 0.15}s` }}
                    >
                      <span className="world-chase__clue-emoji">{clue.emoji}</span>
                      <span className="world-chase__clue-text">{clue.text}</span>
                    </div>
                  ))}

                  {isReview ? (
                    <motion.button
                      onClick={onClose}
                      whileTap={{ y: 2, scale: 0.97 }}
                      style={{
                        marginTop: "0.25rem",
                        width: "100%",
                        background: "#1a1a1a",
                        color: "#fff",
                        border: "3px solid #1a1a1a",
                        borderBottomWidth: 5,
                        borderRightWidth: 4,
                        borderRadius: "9999px",
                        padding: "0.7rem 0.5rem",
                        fontSize: "0.9rem",
                        fontWeight: 900,
                        cursor: "pointer",
                      }}
                    >
                      ← Back to map
                    </motion.button>
                  ) : (
                    <motion.button
                      onClick={onLead}
                      whileTap={{ y: 2, scale: 0.97 }}
                      style={{
                        marginTop: "0.25rem",
                        width: "100%",
                        background: "#ff4eab",
                        color: "#fff",
                        border: "3px solid #1a1a1a",
                        borderBottomWidth: 5,
                        borderRightWidth: 4,
                        borderRadius: "9999px",
                        padding: "0.7rem 0.5rem",
                        fontSize: "0.9rem",
                        fontWeight: 900,
                        cursor: "pointer",
                      }}
                    >
                      I know where they went! 🗺️
                    </motion.button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          )}

        </div>
      </motion.div>
    </motion.div>
  );
}

function FoundPanel({
  route,
  visitedCityIds,
  onNext,
  onReplay,
}: {
  route: City[];
  visitedCityIds: string[];
  onNext: () => void;
  onReplay: () => void;
}) {
  const finalStop = route[route.length - 1];
  const finalInfo = CITY_INFO[finalStop.cityId];
  return (
    <motion.div
      className="world-chase__overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="world-chase__panel"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
      >
        <div style={{ textAlign: "center", marginBottom: "1rem" }}>
          <div style={{ fontSize: "3.5rem" }}>🎉🕵️‍♀️🎉</div>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 900, margin: "0.5rem 0" }}>
            You found them!
          </h2>
          <p style={{ fontSize: "0.95rem", fontWeight: 700, color: "#555", marginBottom: "0.5rem" }}>
            Jaime & Jeff were in {finalInfo ? finalInfo.country : finalStop.cityName} all along!
          </p>
        </div>

        <div style={{
          background: "#fff",
          border: "3px solid #1a1a1a",
          borderBottomWidth: 5,
          borderRightWidth: 4,
          borderRadius: "1.25rem",
          padding: "0.85rem 1rem",
          marginBottom: "1rem",
        }}>
          <div style={{ fontSize: "0.75rem", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: "0.5rem" }}>
            🗺️ Your Route
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem", alignItems: "center" }}>
            {visitedCityIds.map((id, i) => {
              const stop = route.find((s) => s.cityId === id);
              return (
                <span key={id}>
                  <span style={{
                    background: id === finalStop.cityId ? "#fbbf24" : "#e0f2fe",
                    border: "2px solid #1a1a1a",
                    borderRadius: "9999px",
                    padding: "0.15rem 0.6rem",
                    fontSize: "0.78rem",
                    fontWeight: 800,
                  }}>
                    {stop?.cityName ?? id}
                  </span>
                  {i < visitedCityIds.length - 1 && (
                    <span style={{ fontSize: "0.8rem", margin: "0 0.15rem" }}>→</span>
                  )}
                </span>
              );
            })}
          </div>
        </div>

        <div style={{
          background: "#fff9c4",
          border: "3px solid #1a1a1a",
          borderBottomWidth: 5,
          borderRightWidth: 4,
          borderRadius: "1rem",
          padding: "0.6rem 1rem",
          fontSize: "0.85rem",
          fontWeight: 700,
          marginBottom: "1rem",
          textAlign: "center",
        }}>
          🏆 You earned a passport stamp!
        </div>

        <div style={{ display: "flex", gap: "0.6rem" }}>
          <motion.button
            onClick={onNext}
            whileTap={{ y: 3, scale: 0.97 }}
            style={{
              flex: 1,
              background: "#fbbf24",
              border: "3px solid #1a1a1a",
              borderBottomWidth: 6,
              borderRightWidth: 5,
              borderRadius: "9999px",
              padding: "0.75rem 1rem",
              fontSize: "0.95rem",
              fontWeight: 900,
              cursor: "pointer",
            }}
          >
            New Adventure ✈️
          </motion.button>
          <motion.button
            onClick={onReplay}
            whileTap={{ y: 3, scale: 0.97 }}
            style={{
              flex: 1,
              background: "#fff",
              border: "3px solid #1a1a1a",
              borderBottomWidth: 6,
              borderRightWidth: 5,
              borderRadius: "9999px",
              padding: "0.75rem 1rem",
              fontSize: "0.95rem",
              fontWeight: 900,
              cursor: "pointer",
            }}
          >
            Play Again 🔄
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function FailurePanel({ onTryAgain }: { onTryAgain: () => void }) {
  return (
    <motion.div
      className="world-chase__overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="world-chase__panel"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        style={{ textAlign: "center", maxWidth: 380 }}
      >
        <div style={{ fontSize: "3.5rem", marginBottom: "0.5rem" }}>😅🗺️</div>
        <h2 style={{ fontSize: "1.4rem", fontWeight: 900, marginBottom: "0.5rem" }}>
          They got too far ahead!
        </h2>
        <p style={{ fontSize: "0.9rem", fontWeight: 700, color: "#555", marginBottom: "1rem" }}>
          Jaime & Jeff are explorers — they move fast! Try following their clues
          again and you&apos;ll catch them this time.
        </p>
        <motion.button
          onClick={onTryAgain}
          whileTap={{ y: 3, scale: 0.97 }}
          style={{
            width: "100%",
            background: "#ff4eab",
            color: "#fff",
            border: "3px solid #1a1a1a",
            borderBottomWidth: 6,
            borderRightWidth: 5,
            borderRadius: "9999px",
            padding: "0.85rem 1rem",
            fontSize: "1.05rem",
            fontWeight: 900,
            cursor: "pointer",
          }}
        >
          Try Again 🔍
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
