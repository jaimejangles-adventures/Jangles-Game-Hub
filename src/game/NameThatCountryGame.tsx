import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps";
import { burstCorrect, burstFinale } from "@/game/confetti";
import { playCorrectExclamation, playIncorrectExclamation } from "./exclamations";
import { CountdownBar, WRONG_MS } from "./WrongFeedback";
import rawData from "@/game/data/fly-the-flag.json";
import { asset } from "@/lib/asset";
import { useScore } from "@/hooks/use-score";
import { useAuth } from "@/lib/auth-context";
import { Leaderboard } from "@/components/leaderboard";

type Country = {
  countryId: string;
  country: string;
  flag: string;
  isoNumeric: string;
  capital: string;
  population: string;
  independence: string;
  lat: number;
  lng: number;
  audio: string;
  isIsland: boolean;
};

type Phase = "start" | "guessing" | "wrong" | "correct" | "done";

const COUNTRIES = rawData as Country[];
const GEO_URL = "/data/world-110m.json";
const ROUNDS = 10;
const CHOICES_COUNT = 4;

const COUNTRY_PAGE: Record<string, string> = {
  "usa":            asset("/book3-nt/page-03.png"),
  "mexico":         asset("/book3-nt/page-04.png"),
  "jamaica":        asset("/book3-nt/page-05.png"),
  "barbados":       asset("/book3-nt/page-06.png"),
  "peru":           asset("/book3-nt/page-07.png"),
  "argentina":      asset("/book3-nt/page-08.png"),
  "united-kingdom": asset("/book3-nt/page-10.png"),
  "spain":          asset("/book3-nt/page-11.png"),
  "france":         asset("/book3-nt/page-12.png"),
  "italy":          asset("/book3-nt/page-13.png"),
  "sri-lanka":      asset("/book3-nt/page-15.png"),
  "japan":          asset("/book3-nt/page-16.png"),
  "switzerland":    asset("/book3-nt/page-17.png"),
  "kenya":          asset("/book3-nt/page-18.png"),
  "south-africa":   asset("/book3-nt/page-19.png"),
  "ghana":          asset("/book3-nt/page-20.png"),
  "south-korea":    asset("/book3-nt/page-21.png"),
  "nepal":          asset("/book3-nt/page-22.png"),
  "indonesia":      asset("/book3-nt/page-23.png"),
  "australia":      asset("/book3-nt/page-24.png"),
};

const colorPalette = [
  "#FDE68A", "#A7F3D0", "#C7D2FE", "#FCA5A5",
  "#FBCFE8", "#BBF7D0", "#DDD6FE", "#FED7AA",
  "#BAE6FD", "#D9F99D",
];

// Zoom scale + optional center override per country
const ZOOM_CFG: Record<string, { scale: number; center?: [number, number] }> = {
  "argentina":      { scale: 420 },
  "australia":      { scale: 210, center: [134, -27] },
  "barbados":       { scale: 12000 },
  "france":         { scale: 900 },
  "ghana":          { scale: 1200 },
  "indonesia":      { scale: 320, center: [118, -2] },
  "italy":          { scale: 1400 },
  "jamaica":        { scale: 8000 },
  "japan":          { scale: 600, center: [136, 36] },
  "kenya":          { scale: 600 },
  "mexico":         { scale: 480 },
  "nepal":          { scale: 2000 },
  "peru":           { scale: 500 },
  "south-africa":   { scale: 400 },
  "south-korea":    { scale: 2600 },
  "spain":          { scale: 900 },
  "sri-lanka":      { scale: 3600 },
  "switzerland":    { scale: 5000 },
  "united-kingdom": { scale: 950, center: [-2, 54] },
  "usa":            { scale: 210, center: [-96, 38] },
};

function getZoomCfg(country: Country): { scale: number; center: [number, number] } {
  const cfg = ZOOM_CFG[country.countryId] ?? { scale: 700 };
  return { scale: cfg.scale, center: cfg.center ?? [country.lng, country.lat] };
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function flagCdnUrl(flag: string): string {
  const codes = [...flag].map((c) => c.codePointAt(0)! - 0x1f1e6 + 97);
  if (codes.some((c) => c < 97 || c > 122)) return "";
  return `https://flagcdn.com/w320/${String.fromCharCode(...codes)}.png`;
}

function buildQueue(): Country[] {
  return shuffle(COUNTRIES).slice(0, ROUNDS);
}

function buildChoices(correct: Country): Country[] {
  const others = shuffle(COUNTRIES.filter((c) => c.countryId !== correct.countryId)).slice(0, CHOICES_COUNT - 1);
  return shuffle([correct, ...others]);
}

function ScoreRow({ score, total }: { score: number; total: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: total }).map((_, i) => (
        <span key={i} style={{ fontSize: 13, opacity: i < score ? 1 : 0.2 }}>🌍</span>
      ))}
    </div>
  );
}

// ── Passport ──────────────────────────────────────────────────────────────────

function CountryPassport({ countries }: { countries: Country[] }) {
  return (
    <div
      className="w-full rounded-[1.75rem] border-[4px] border-ink"
      style={{ background: "#1C3054", borderBottomWidth: 7, borderRightWidth: 6, padding: "1.25rem 1.5rem" }}
    >
      <div className="flex items-center gap-2 mb-1">
        <span style={{ fontSize: 22 }}>🛂</span>
        <span className="text-xl font-extrabold" style={{ color: "#FFD700" }}>My World Passport</span>
      </div>
      <div className="text-xs mb-4" style={{ color: "#8899AA" }}>
        {countries.length} countr{countries.length !== 1 ? "ies" : "y"} identified on this world tour
      </div>
      {countries.length === 0 ? (
        <div className="text-center py-4 text-sm" style={{ color: "#4a6080" }}>
          No stamps yet — start guessing!
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12, justifyItems: "center" }}>
          {countries.map((c, i) => {
            const rotation = ((i * 7) % 9) - 4;
            const url = flagCdnUrl(c.flag);
            return (
              <div
                key={c.countryId}
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
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function NameThatCountryGame({ onComplete }: { onComplete?: () => void } = {}) {
  const { user, openAuthModal } = useAuth();
  const { saveScore, saving, saved, reset: resetScore } = useScore("name-that-country");

  const [phase, setPhase] = useState<Phase>("start");
  const [queue, setQueue] = useState<Country[]>([]);
  const [roundIdx, setRoundIdx] = useState(0);
  const [choices, setChoices] = useState<Country[]>([]);
  const [score, setScore] = useState(0);
  const [wrongId, setWrongId] = useState<string | null>(null);
  const [zoomed, setZoomed] = useState(false);
  const [earned, setEarned] = useState<Country[]>([]);
  const [passportModalOpen, setPassportModalOpen] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const currentCountry = queue[roundIdx] ?? null;

  const startGame = useCallback(() => {
    resetScore();
    const q = buildQueue();
    setQueue(q);
    setRoundIdx(0);
    setScore(0);
    setEarned([]);
    setPhase("guessing");
    setChoices(buildChoices(q[0]));
    setWrongId(null);
    setZoomed(false);
    audioRef.current?.pause();
    audioRef.current = null;
  }, [resetScore]);

  useEffect(() => {
    return () => { audioRef.current?.pause(); };
  }, []);

  useEffect(() => {
    if (phase === "done" && score > 0) saveScore(score);
  }, [phase, score, saveScore]);

  const handleChoice = useCallback((chosen: Country) => {
    if (phase !== "guessing" || !currentCountry) return;
    if (chosen.countryId === currentCountry.countryId) {
      setScore((s) => s + 1);
      setEarned((prev) => [...prev, currentCountry]);
      setPhase("correct");
      playCorrectExclamation();
      burstCorrect();
      setTimeout(() => {
        const audio = new Audio(`/${currentCountry.audio}`);
        audio.volume = 0.55;
        audioRef.current?.pause();
        audioRef.current = audio;
        audio.play().catch(() => {});
      }, 400);
    } else {
      setWrongId(chosen.countryId);
      setPhase("wrong");
      playIncorrectExclamation();
      setTimeout(() => { setWrongId(null); setPhase("guessing"); }, WRONG_MS);
    }
  }, [phase, currentCountry]);

  const nextRound = useCallback(() => {
    audioRef.current?.pause();
    audioRef.current = null;
    setZoomed(false);
    const next = roundIdx + 1;
    if (next >= queue.length) {
      burstFinale();
      setPhase("done");
      onComplete?.();
    } else {
      setRoundIdx(next);
      setChoices(buildChoices(queue[next]));
      setWrongId(null);
      setPhase("guessing");
    }
  }, [roundIdx, queue]);

  // ── START ────────────────────────────────────────────────────────────────────

  if (phase === "start") {
    return (
      <div
        className="mx-auto flex h-full max-w-2xl flex-col items-center justify-center gap-6 p-6 text-center"
        style={{ flex: "1 1 0" }}
      >
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.4 }}>
          <div
            className="rounded-[2rem] border-[4px] border-ink p-8"
            style={{ background: "#fff", borderBottomWidth: 7, borderRightWidth: 6 }}
          >
            <h1 className="text-3xl font-extrabold leading-tight sm:text-4xl">Name That Country! 📍</h1>
            <p className="mt-3 text-sm text-ink/75 leading-relaxed">
              A pin will drop on the world map — can you name the country?<br />
              Look carefully and pick the right answer!
            </p>
            <div className="mt-5 flex justify-center">
              <img src={asset("/characters/spaceship-jaime-jeff.png")} alt="Jaime in spaceship" className="h-28 w-auto object-contain" />
            </div>
            <button
              onClick={startGame}
              className="mt-6 rounded-full border-[3px] border-ink px-8 py-3 text-lg font-extrabold transition-transform active:scale-95"
              style={{ background: "#3B82F6", borderBottomWidth: 6, borderRightWidth: 5, color: "#fff" }}
            >
              Start Exploring! 🌍
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // ── DONE ─────────────────────────────────────────────────────────────────────

  if (phase === "done") {
    const perfect = score === ROUNDS;
    return (
      <div
        className="mx-auto flex max-w-2xl flex-col gap-4 p-5 overflow-y-auto"
        style={{ flex: "1 1 0", minHeight: 0 }}
      >
        <motion.div initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full">
          <div
            className="rounded-[2rem] border-[4px] border-ink p-6 text-center"
            style={{ background: "#fff", borderBottomWidth: 7, borderRightWidth: 6 }}
          >
            <div className="text-5xl">{perfect ? "🏆" : "🎉"}</div>
            <h2 className="mt-3 text-3xl font-extrabold">{perfect ? "Perfect Score!" : "Nice Work!"}</h2>
            <p className="mt-2 text-lg font-bold text-ink/70">
              You named {score} out of {ROUNDS} countries!
            </p>
            <div className="mt-4 flex justify-center">
              <ScoreRow score={score} total={ROUNDS} />
            </div>
            <button
              onClick={startGame}
              className="mt-6 rounded-full border-[3px] border-ink px-8 py-3 text-base font-extrabold transition-transform active:scale-95"
              style={{ background: "#3B82F6", borderBottomWidth: 6, borderRightWidth: 5, color: "#fff" }}
            >
              Play Again! 🌍
            </button>
          </div>
        </motion.div>

        {earned.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <CountryPassport countries={earned} />
          </motion.div>
        )}

        {/* Leaderboard */}
        <div className="rounded-[2rem] border-[3px] border-ink p-4" style={{ background: "#1a1a2e", borderBottomWidth: 6, borderRightWidth: 5 }}>
          <div className="text-[0.6rem] font-extrabold uppercase tracking-[0.2em] text-gray-500 mb-1">🏆 Top Scores — Name That Country</div>
          {user ? (
            <p className="text-xs font-bold mb-2" style={{ color: saving ? "#9ca3af" : saved ? "#4ade80" : "transparent" }}>
              {saving ? "Saving score…" : "✓ Score saved to leaderboard"}
            </p>
          ) : (
            <button onClick={() => openAuthModal("sign-up")} className="text-xs font-bold text-yellow-400 underline hover:text-yellow-300 mb-2 block">
              🏆 Sign in to save your score
            </button>
          )}
          <Leaderboard gameSlug="name-that-country" limit={5} theme="dark" />
        </div>
      </div>
    );
  }

  // ── GAME ─────────────────────────────────────────────────────────────────────

  const bgPage = currentCountry ? (COUNTRY_PAGE[currentCountry.countryId] ?? null) : null;

  return (
    <div
      style={{
        flex: "1 1 0",
        minHeight: 0,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        ...(bgPage
          ? {
              backgroundImage: `linear-gradient(rgba(20,8,50,0.52), rgba(20,8,50,0.52)), url(${bgPage})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }
          : {}),
      }}
    >
    <div
      style={{
        flex: "1 1 0",
        minHeight: 0,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        maxWidth: 700,
        margin: "0 auto",
        width: "100%",
        padding: "0.5rem 1rem 0.75rem",
        gap: "0.5rem",
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between flex-shrink-0">
        <div
          className="inline-flex items-center gap-2 rounded-full border-[3px] border-ink px-4 py-1"
          style={{ background: "#3B82F6", borderBottomWidth: 5, borderRightWidth: 4, fontSize: 13, color: "#fff" }}
        >
          <span className="font-extrabold">Name That Country!</span>
          <span style={{ opacity: 0.7 }}>{roundIdx + 1}/{queue.length}</span>
        </div>
        <div className="flex items-center gap-2">
          {earned.length > 0 && (
            <button
              onClick={() => setPassportModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-full border-[2px] border-ink px-3 py-1"
              style={{ background: "#1C3054", borderBottomWidth: 4, borderRightWidth: 3, fontSize: 12, color: "#FFD700", fontWeight: 800 }}
            >
              🛂 {earned.length}
            </button>
          )}
          <ScoreRow score={score} total={roundIdx} />
        </div>
      </div>

      {/* Map */}
      {currentCountry && (() => {
        const zoomCfg = getZoomCfg(currentCountry);
        return (
          <div
            style={{
              flex: "1 1 0",
              minHeight: 0,
              position: "relative",
              borderRadius: 20,
              border: "3px solid #1a1a1a",
              borderBottomWidth: 6,
              borderRightWidth: 5,
              overflow: "hidden",
              background: "#60C8FF",
            }}
          >
            {/* Label */}
            <div
              style={{
                position: "absolute",
                top: 10,
                left: "50%",
                transform: "translateX(-50%)",
                background: "rgba(255,255,255,0.92)",
                borderRadius: 99,
                padding: "4px 14px",
                fontSize: 12,
                fontWeight: 800,
                color: "#444",
                border: "1.5px solid #ddd",
                whiteSpace: "nowrap",
                zIndex: 10,
              }}
            >
              📍 Which country is this?
            </div>

            {/* Zoom toggle button */}
            <motion.button
              onClick={() => setZoomed((z) => !z)}
              whileTap={{ scale: 0.93 }}
              style={{
                position: "absolute",
                bottom: 10,
                right: 10,
                zIndex: 10,
                background: zoomed ? "#FBBF24" : "#fff",
                border: "2.5px solid #1a1a1a",
                borderBottomWidth: 4,
                borderRightWidth: 3,
                borderRadius: 999,
                padding: "5px 12px",
                fontSize: 12,
                fontWeight: 800,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 5,
                color: "#1a1a1a",
              }}
            >
              {zoomed ? "🌍 World view" : "🔍 Zoom in"}
            </motion.button>

            <AnimatePresence mode="wait">
              <motion.div
                key={zoomed ? "zoomed" : "world"}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                style={{ position: "absolute", inset: 0 }}
              >
                <ComposableMap
                  projection="geoNaturalEarth1"
                  projectionConfig={
                    zoomed
                      ? { scale: zoomCfg.scale, center: zoomCfg.center }
                      : { scale: 185 }
                  }
                  style={{ width: "100%", height: "100%", background: "transparent" }}
                >
                  <Geographies geography={GEO_URL}>
                    {({ geographies }) =>
                      geographies.map((geo) => {
                        const isTarget = geo.id === currentCountry.isoNumeric;
                        return (
                          <Geography
                            key={geo.rsmKey}
                            geography={geo}
                            fill={
                              isTarget
                                ? "#FBBF24"
                                : zoomed
                                  ? "#D1D5DB"
                                  : colorPalette[parseInt(geo.id || "0") % colorPalette.length]
                            }
                            stroke={zoomed ? "#b0b5be" : "#fff"}
                            strokeWidth={zoomed ? 0.8 : 0.6}
                            style={{
                              default: { outline: "none" },
                              hover: { outline: "none" },
                              pressed: { outline: "none" },
                            }}
                          />
                        );
                      })
                    }
                  </Geographies>

                  {/* Pulsing pin */}
                  <Marker coordinates={[currentCountry.lng, currentCountry.lat]}>
                    <motion.circle
                      key={`pulse1-${currentCountry.countryId}-${zoomed}`}
                      r={5} fill="none" stroke="#FF4EAB" strokeWidth={2.5}
                      animate={{ r: [5, 22], opacity: [0.8, 0] }}
                      transition={{ repeat: Infinity, duration: 2, ease: "easeOut" }}
                    />
                    <motion.circle
                      key={`pulse2-${currentCountry.countryId}-${zoomed}`}
                      r={5} fill="none" stroke="#FF4EAB" strokeWidth={2}
                      animate={{ r: [5, 14], opacity: [1, 0] }}
                      transition={{ repeat: Infinity, duration: 2, delay: 0.55, ease: "easeOut" }}
                    />
                    <circle r={8} fill="white" opacity={0.7} />
                    <circle r={6} fill="#FF4EAB" stroke="white" strokeWidth={2} />
                  </Marker>
                </ComposableMap>
              </motion.div>
            </AnimatePresence>
          </div>
        );
      })()}

      {/* Choice buttons */}
      <div className="grid gap-2 flex-shrink-0" style={{ gridTemplateColumns: "repeat(2, 1fr)" }}>
        {choices.map((c) => {
          const isWrong = wrongId === c.countryId;
          return (
            <motion.button
              key={c.countryId}
              onClick={() => handleChoice(c)}
              disabled={phase !== "guessing"}
              whileTap={{ scale: 0.94 }}
              animate={isWrong ? { x: [-6, 6, -5, 5, 0], backgroundColor: "#FEE2E2" } : { x: 0 }}
              transition={isWrong ? { duration: 0.35 } : {}}
              className="rounded-2xl border-[3px] border-ink py-3 px-2 text-sm font-extrabold leading-tight"
              style={{
                background: isWrong ? "#FEE2E2" : "#fff",
                borderBottomWidth: 5,
                borderRightWidth: 4,
                cursor: phase === "guessing" ? "pointer" : "default",
                minHeight: 52,
              }}
            >
              {c.country}
            </motion.button>
          );
        })}
      </div>

      {/* Correct popup */}
      <AnimatePresence>
        {phase === "correct" && currentCountry && (
          <CorrectPopup
            country={currentCountry}
            earned={earned}
            isLast={roundIdx + 1 >= queue.length}
            onNext={nextRound}
          />
        )}
      </AnimatePresence>

      {/* Passport modal */}
      <AnimatePresence>
        {passportModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setPassportModalOpen(false)}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 60,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(0,0,0,0.55)",
              padding: "1rem",
            }}
          >
            <motion.div
              initial={{ scale: 0.82, y: 24 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.88, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 24 }}
              onClick={(e) => e.stopPropagation()}
              style={{ width: "100%", maxWidth: 480 }}
            >
              <div className="relative">
                <CountryPassport countries={earned} />
                <button
                  type="button"
                  onClick={() => setPassportModalOpen(false)}
                  className="absolute top-3 right-3 rounded-full border-[2px] border-ink px-3 py-0.5 text-sm font-extrabold"
                  style={{ background: "#FFD700", color: "#1C3054", borderBottomWidth: 3, borderRightWidth: 2 }}
                >
                  ✕ Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
    </div>
  );
}

// ── Correct popup ─────────────────────────────────────────────────────────────

function CorrectPopup({
  country,
  earned,
  isLast,
  onNext,
}: {
  country: Country;
  earned: Country[];
  isLast: boolean;
  onNext: () => void;
}) {
  const flagUrl = flagCdnUrl(country.flag);
  const [passportOpen, setPassportOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.5)",
        padding: "1rem",
      }}
    >
      <motion.div
        initial={{ scale: 0.75, y: 30 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.85, opacity: 0 }}
        transition={{ type: "spring", stiffness: 280, damping: 22 }}
        className="w-full max-w-lg rounded-[2rem] border-[4px] border-ink overflow-y-auto"
        style={{
          background: "#fff",
          borderBottomWidth: 8,
          borderRightWidth: 7,
          maxHeight: "90vh",
          padding: "1.5rem",
          display: "flex",
          flexDirection: "column",
          gap: "0.85rem",
        }}
      >
        {/* Badge */}
        <div className="text-center">
          <div
            className="inline-flex rounded-full border-[3px] border-ink px-5 py-1.5 text-base uppercase tracking-[0.2em] font-extrabold"
            style={{ background: "#22C55E", borderBottomWidth: 5, borderRightWidth: 4, color: "#fff" }}
          >
            🎉 That's right!
          </div>
        </div>

        {/* Country name + flag */}
        <div className="flex items-center gap-3">
          {flagUrl && (
            <img
              src={flagUrl}
              alt={`${country.country} flag`}
              style={{
                height: 48,
                width: "auto",
                borderRadius: 8,
                border: "2px solid #1a1a1a",
                boxShadow: "2px 2px 0 #1a1a1a",
                aspectRatio: country.flag === "🇳🇵" ? "3/4" : "3/2",
                objectFit: "cover",
                flexShrink: 0,
              }}
            />
          )}
          <h2 className="text-3xl font-extrabold">{country.country}!</h2>
        </div>

        {/* Mini world map showing where the country is */}
        <div
          style={{
            borderRadius: 14,
            overflow: "hidden",
            border: "3px solid #1a1a1a",
            boxShadow: "4px 4px 0 #1a1a1a",
            background: "#60C8FF",
            height: 160,
            flexShrink: 0,
          }}
        >
          <ComposableMap
            projection="geoNaturalEarth1"
            projectionConfig={{ scale: 185 }}
            style={{ width: "100%", height: "100%", background: "transparent" }}
          >
            <Geographies geography={GEO_URL}>
              {({ geographies }) =>
                geographies.map((geo) => {
                  const isTarget = geo.id === country.isoNumeric;
                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill={isTarget ? "#FBBF24" : colorPalette[parseInt(geo.id || "0") % colorPalette.length]}
                      stroke="#fff"
                      strokeWidth={0.6}
                      style={{ default: { outline: "none" }, hover: { outline: "none" }, pressed: { outline: "none" } }}
                    />
                  );
                })
              }
            </Geographies>
            <Marker coordinates={[country.lng, country.lat]}>
              <motion.circle
                r={5} fill="none" stroke="#FF4EAB" strokeWidth={2.5}
                animate={{ r: [5, 22], opacity: [0.8, 0] }}
                transition={{ repeat: Infinity, duration: 2, ease: "easeOut" }}
              />
              <circle r={8} fill="white" opacity={0.7} />
              <circle r={6} fill="#FF4EAB" stroke="white" strokeWidth={2} />
            </Marker>
          </ComposableMap>
        </div>

        {/* Facts */}
        <div
          className="rounded-xl border-[2px] border-ink p-3"
          style={{ background: "#FFFBEB", borderBottomWidth: 4, borderRightWidth: 3 }}
        >
          <div className="grid gap-2 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-xl">🏛️</span>
              <div><span className="font-extrabold">Capital: </span>{country.capital}</div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xl">👥</span>
              <div><span className="font-extrabold">Population: </span>{country.population}</div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xl">📅</span>
              <div><span className="font-extrabold">Independence: </span>{country.independence}</div>
            </div>
          </div>
        </div>

        {/* Passport stamp button */}
        <motion.button
          type="button"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.5, type: "spring", stiffness: 300, damping: 20 }}
          onClick={() => setPassportOpen((p) => !p)}
          className="flex w-full items-center justify-between gap-2 rounded-2xl border-[2px] border-ink px-4 py-2.5"
          style={{ background: "#1C3054", borderBottomWidth: 4, borderRightWidth: 3, cursor: "pointer" }}
        >
          <div className="flex items-center gap-2">
            <span style={{ fontSize: 18 }}>🛂</span>
            <span className="font-extrabold text-sm" style={{ color: "#FFD700" }}>
              Stamp added to your passport!
            </span>
          </div>
          <div className="flex items-center gap-2">
            {flagUrl && (
              <img
                src={flagUrl}
                alt=""
                style={{
                  height: 20,
                  width: "auto",
                  borderRadius: 3,
                  border: "1px solid #FFD700",
                  aspectRatio: "3/2",
                  objectFit: "cover",
                }}
              />
            )}
            <span style={{ color: "#FFD700", fontSize: 13, fontWeight: 800 }}>
              {passportOpen ? "▲" : "▼"}
            </span>
          </div>
        </motion.button>

        {/* Expandable passport */}
        <AnimatePresence>
          {passportOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22 }}
            >
              <div className="relative">
                <CountryPassport countries={earned} />
                <button
                  type="button"
                  onClick={() => setPassportOpen(false)}
                  className="absolute top-3 right-3 rounded-full border-[2px] border-ink px-2.5 py-0.5 text-xs font-extrabold"
                  style={{ background: "#FFD700", color: "#1C3054", borderBottomWidth: 3, borderRightWidth: 2 }}
                >
                  ✕ Close
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Next button */}
        <div className="text-center">
          <button
            onClick={onNext}
            className="rounded-full border-[3px] border-ink px-8 py-3 text-base font-extrabold transition-transform active:scale-95"
            style={{ background: "#3B82F6", borderBottomWidth: 6, borderRightWidth: 5, color: "#fff" }}
          >
            {isLast ? "See My Passport! 🛂" : "Next Country! →"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
