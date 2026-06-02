import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps";
import { burstCorrect, burstFinale } from "@/game/confetti";
import { playCorrectExclamation, playIncorrectExclamation } from "./exclamations";
import { CountdownBar, WRONG_MS } from "./WrongFeedback";
import rawData from "@/game/data/fly-the-flag.json";
import { asset } from "@/lib/asset";

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

const colorPalette = [
  "#FDE68A", "#A7F3D0", "#C7D2FE", "#FCA5A5",
  "#FBCFE8", "#BBF7D0", "#DDD6FE", "#FED7AA",
  "#BAE6FD", "#D9F99D",
];

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

const CLOSEUP: Record<string, { scale: number; center?: [number, number] }> = {
  "argentina":      { scale: 520 },
  "australia":      { scale: 230 },
  "barbados":       { scale: 14000 },
  "france":         { scale: 1000 },
  "ghana":          { scale: 1400 },
  "indonesia":      { scale: 340, center: [118, -2] },
  "italy":          { scale: 1600 },
  "jamaica":        { scale: 9000 },
  "japan":          { scale: 680, center: [136, 36] },
  "kenya":          { scale: 680 },
  "mexico":         { scale: 530 },
  "nepal":          { scale: 2200 },
  "peru":           { scale: 550 },
  "south-africa":   { scale: 440 },
  "south-korea":    { scale: 2800 },
  "spain":          { scale: 950 },
  "sri-lanka":      { scale: 4000 },
  "switzerland":    { scale: 5500 },
  "united-kingdom": { scale: 1050, center: [-2, 54] },
  "usa":            { scale: 230, center: [-96, 38] },
};

// ── Closeup → world zoom-out animation ────────────────────────────────────────

function CorrectPopupMap({ country }: { country: Country }) {
  const [showWorld, setShowWorld] = useState(false);

  useEffect(() => {
    setShowWorld(false);
    const t = setTimeout(() => setShowWorld(true), 1800);
    return () => clearTimeout(t);
  }, [country.countryId]);

  const cfg = CLOSEUP[country.countryId] ?? { scale: 600 };
  const center: [number, number] = cfg.center ?? [country.lng, country.lat];

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: 190,
        borderRadius: 14,
        overflow: "hidden",
        border: "3px solid #1a1a1a",
        boxShadow: "4px 4px 0 #1a1a1a",
        background: "#60C8FF",
        flexShrink: 0,
      }}
    >
      {/* Close-up layer */}
      <AnimatePresence>
        {!showWorld && (
          <motion.div
            key="closeup"
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            style={{ position: "absolute", inset: 0 }}
          >
            <ComposableMap
              projection="geoNaturalEarth1"
              projectionConfig={{ scale: cfg.scale, center }}
              style={{ width: "100%", height: "100%", background: "transparent" }}
            >
              <Geographies geography={GEO_URL}>
                {({ geographies }) =>
                  geographies.map((geo) => (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill={geo.id === country.isoNumeric ? "#FBBF24" : "#E2E8F0"}
                      stroke="#fff"
                      strokeWidth={0.5}
                      style={{ default: { outline: "none" }, hover: { outline: "none" }, pressed: { outline: "none" } }}
                    />
                  ))
                }
              </Geographies>
            </ComposableMap>
            <div
              style={{
                position: "absolute", bottom: 8, left: "50%", transform: "translateX(-50%)",
                background: "rgba(255,255,255,0.92)", borderRadius: 99,
                padding: "3px 12px", fontSize: 11, fontWeight: 700, color: "#444",
                border: "1.5px solid #ddd", whiteSpace: "nowrap",
              }}
            >
              📍 Close-up of {country.country}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* World zoom-out layer */}
      <AnimatePresence>
        {showWorld && (
          <motion.div
            key="world"
            initial={{ opacity: 0, scale: 1.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.4, ease: "easeOut" }}
            style={{ position: "absolute", inset: 0 }}
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
                <motion.circle
                  r={5} fill="none" stroke="#FF4EAB" strokeWidth={2}
                  animate={{ r: [5, 14], opacity: [1, 0] }}
                  transition={{ repeat: Infinity, duration: 2, delay: 0.55, ease: "easeOut" }}
                />
                <circle r={8} fill="white" opacity={0.7} />
                <circle r={6} fill="#FF4EAB" stroke="white" strokeWidth={2} />
              </Marker>
            </ComposableMap>
            <div
              style={{
                position: "absolute", bottom: 8, left: "50%", transform: "translateX(-50%)",
                background: "rgba(255,255,255,0.92)", borderRadius: 99,
                padding: "3px 12px", fontSize: 11, fontWeight: 700, color: "#444",
                border: "1.5px solid #ddd", whiteSpace: "nowrap",
              }}
            >
              {country.country} is right here! 🌍
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Flag Passport ─────────────────────────────────────────────────────────────

function FlagPassport({ countries }: { countries: Country[] }) {
  return (
    <div
      className="w-full rounded-[1.75rem] border-[4px] border-ink"
      style={{ background: "#1C3054", borderBottomWidth: 7, borderRightWidth: 6, padding: "1.25rem 1.5rem" }}
    >
      <div className="flex items-center gap-2 mb-1">
        <span style={{ fontSize: 22 }}>🛂</span>
        <span className="text-xl font-extrabold" style={{ color: "#FFD700" }}>My Flag Passport</span>
      </div>
      <div className="text-xs mb-4" style={{ color: "#8899AA" }}>
        {countries.length} flag{countries.length !== 1 ? "s" : ""} collected on this world tour
      </div>
      {countries.length === 0 ? (
        <div className="text-center py-4 text-sm" style={{ color: "#4a6080" }}>
          No flags collected yet!
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

// ── Score flags ───────────────────────────────────────────────────────────────

function ScoreRow({ score, total }: { score: number; total: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: total }).map((_, i) => (
        <span key={i} style={{ fontSize: 17, opacity: i < score ? 1 : 0.2 }}>🏁</span>
      ))}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function FlyTheFlagGame() {
  const [phase, setPhase] = useState<Phase>("start");
  const [queue, setQueue] = useState<Country[]>([]);
  const [roundIdx, setRoundIdx] = useState(0);
  const [choices, setChoices] = useState<Country[]>([]);
  const [score, setScore] = useState(0);
  const [wrongId, setWrongId] = useState<string | null>(null);
  const [earned, setEarned] = useState<Country[]>([]);
  const [passportOpen, setPassportOpen] = useState(false);
  const [passportModalOpen, setPassportModalOpen] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const currentCountry = queue[roundIdx] ?? null;

  const startGame = useCallback(() => {
    const q = buildQueue();
    setQueue(q);
    setRoundIdx(0);
    setScore(0);
    setEarned([]);
    setPhase("guessing");
    setChoices(buildChoices(q[0]));
    setWrongId(null);
    audioRef.current?.pause();
    audioRef.current = null;
  }, []);

  useEffect(() => {
    return () => { audioRef.current?.pause(); };
  }, []);

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
    setPassportOpen(false);
    const next = roundIdx + 1;
    if (next >= queue.length) {
      burstFinale();
      setPhase("done");
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
            <h1 className="text-3xl font-extrabold leading-tight sm:text-4xl">Fly the Flag! 🏁</h1>
            <p className="mt-3 text-sm text-ink/75 leading-relaxed">
              Can you name the country from its flag?<br />
              Guess right, find it on the map, and collect stamps for your passport!
            </p>
            <div className="mt-5 flex justify-center">
              <img
                src={asset("/book-pages/book3/page-36.jpg")}
                alt="Casey holding Canadian flag"
                style={{
                  width: "100%",
                  maxWidth: 260,
                  aspectRatio: "3/2",
                  objectFit: "cover",
                  objectPosition: "50% 0%",
                  display: "block",
                  borderRadius: 16,
                  maskImage: "linear-gradient(to bottom, black 80%, transparent 84%)",
                  WebkitMaskImage: "linear-gradient(to bottom, black 80%, transparent 84%)",
                }}
              />
            </div>
            <button
              onClick={startGame}
              className="mt-6 rounded-full border-[3px] border-ink px-8 py-3 text-lg font-extrabold transition-transform active:scale-95"
              style={{ background: "#FF4EAB", borderBottomWidth: 6, borderRightWidth: 5, color: "#fff" }}
            >
              Start Flying! 🚀
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
        <motion.div initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
          <div
            className="rounded-[2rem] border-[4px] border-ink p-6 text-center"
            style={{ background: "#fff", borderBottomWidth: 7, borderRightWidth: 6 }}
          >
            <div className="text-5xl">{perfect ? "🏆" : "🎉"}</div>
            <h2 className="mt-3 text-3xl font-extrabold">{perfect ? "Perfect Score!" : "Tour Complete!"}</h2>
            <p className="mt-2 text-lg font-bold text-ink/70">
              You got {score} out of {ROUNDS} flags!
            </p>
            <div className="mt-4 flex justify-center">
              <ScoreRow score={score} total={ROUNDS} />
            </div>
          </div>
        </motion.div>

        <FlagPassport countries={earned} />

        <div className="flex justify-center pb-6">
          <button
            onClick={startGame}
            className="rounded-full border-[3px] border-ink px-8 py-3 text-base font-extrabold transition-transform active:scale-95"
            style={{ background: "#FF4EAB", borderBottomWidth: 6, borderRightWidth: 5, color: "#fff" }}
          >
            Fly Again! 🚀
          </button>
        </div>
      </div>
    );
  }

  // ── GAME (guessing / wrong) ───────────────────────────────────────────────────

  const flagUrl = currentCountry ? flagCdnUrl(currentCountry.flag) : "";

  return (
    <div
      style={{
        flex: "1 1 0",
        minHeight: 0,
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "0.75rem 1rem",
      }}
    >
      <div style={{ width: "100%", maxWidth: 640, display: "flex", flexDirection: "column", gap: "0.85rem" }}>

        {/* Header */}
        <div className="flex items-center justify-between">
          <div
            className="inline-flex items-center gap-2 rounded-full border-[3px] border-ink px-5 py-1.5"
            style={{ background: "#FBBF24", borderBottomWidth: 5, borderRightWidth: 4, fontSize: 17 }}
          >
            <span className="font-extrabold">Fly the Flag!</span>
            <span className="text-ink/60">{roundIdx + 1}/{queue.length}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPassportModalOpen(true)}
              className="rounded-full border-[2px] border-ink px-4 py-1 text-sm font-bold transition-transform active:scale-95"
              style={{ background: "#1C3054", color: "#FFD700", borderBottomWidth: 4, borderRightWidth: 3, cursor: "pointer" }}
            >
              🛂 {earned.length} stamps
            </button>
            <ScoreRow score={score} total={roundIdx} />
          </div>
        </div>

        {/* Flag pill */}
        {currentCountry && (
          <div
            className="flex flex-col items-center rounded-[1.75rem] border-[3px] border-ink"
            style={{
              background: "#FFF0F8",
              borderBottomWidth: 6,
              borderRightWidth: 5,
              padding: "1rem 1.6rem 1.8rem",
              gap: "0.8rem",
            }}
          >
            <div className="text-sm uppercase tracking-[0.3em] text-ink/50 font-bold">
              Which country has this flag?
            </div>
            {flagUrl ? (
              <motion.img
                key={currentCountry.countryId}
                src={flagUrl}
                alt="mystery flag"
                initial={{ scale: 0.85, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.35 }}
                style={{
                  maxWidth: "min(100%, 390px)",
                  width: "100%",
                  border: "5px solid #1a1a1a",
                  boxShadow: "6px 6px 0 #1a1a1a",
                  borderRadius: 16,
                  aspectRatio: currentCountry.flag === "🇳🇵" ? "3/4" : "3/2",
                  objectFit: "cover",
                }}
              />
            ) : (
              <div style={{ fontSize: 96 }}>{currentCountry.flag}</div>
            )}
          </div>
        )}

        {/* Choice buttons */}
        <div className="grid gap-2" style={{ gridTemplateColumns: "repeat(2, 1fr)" }}>
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
                className="rounded-2xl border-[3px] border-ink py-4 px-3 text-base font-extrabold leading-tight"
                style={{
                  background: isWrong ? "#FEE2E2" : "#fff",
                  borderBottomWidth: 5,
                  borderRightWidth: 4,
                  cursor: phase === "guessing" ? "pointer" : "default",
                  minHeight: 68,
                }}
              >
                {c.country}
              </motion.button>
            );
          })}
        </div>

        {/* Wrong feedback bar */}
        <AnimatePresence>
          {phase === "wrong" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <CountdownBar ms={WRONG_MS} color="#EF4444" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Correct popup */}
      <AnimatePresence>
        {phase === "correct" && currentCountry && (
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
                    alt={`${currentCountry.country} flag`}
                    style={{
                      height: 40,
                      width: "auto",
                      borderRadius: 6,
                      border: "2px solid #1a1a1a",
                      boxShadow: "2px 2px 0 #1a1a1a",
                      aspectRatio: currentCountry.flag === "🇳🇵" ? "3/4" : "3/2",
                      objectFit: "cover",
                      flexShrink: 0,
                    }}
                  />
                )}
                <h2 className="text-3xl font-extrabold">{currentCountry.country}!</h2>
              </div>

              {/* Facts */}
              <div
                className="rounded-xl border-[2px] border-ink p-3"
                style={{ background: "#FFFBEB", borderBottomWidth: 4, borderRightWidth: 3 }}
              >
                <div className="grid gap-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🏛️</span>
                    <div><span className="font-extrabold">Capital: </span>{currentCountry.capital}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl">👥</span>
                    <div><span className="font-extrabold">Population: </span>{currentCountry.population}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl">📅</span>
                    <div><span className="font-extrabold">Independence: </span>{currentCountry.independence}</div>
                  </div>
                </div>
              </div>

              {/* Passport stamp — clickable toggle */}
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
                    Added to your passport!
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
                  <span style={{ color: "#FFD700", fontSize: 13, fontWeight: 800, lineHeight: 1 }}>
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
                      <FlagPassport countries={earned} />
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
                  onClick={nextRound}
                  className="rounded-full border-[3px] border-ink px-8 py-3 text-base font-extrabold transition-transform active:scale-95"
                  style={{ background: "#FF4EAB", borderBottomWidth: 6, borderRightWidth: 5, color: "#fff" }}
                >
                  {roundIdx + 1 >= queue.length ? "See My Passport! 🛂" : "Next Flag! →"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Passport modal — triggered from header stamp button */}
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
                <FlagPassport countries={earned} />
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
  );
}
