import { createFileRoute, Link } from "@tanstack/react-router";
import { useRef, useState, useEffect, useCallback } from "react";
import { GAME_MANIFEST, CATEGORY_MANIFEST } from "@/lib/game-manifest";
import { asset } from "@/lib/asset";
import { HallOfFame } from "@/components/leaderboard";
import { JanglesTimer } from "@/components/jangles-timer";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Jaime Jangles World Games" },
      {
        name: "description",
        content: "Choose a Jaime Jangles game and jump into music, clue-chasing, and world adventures.",
      },
      { property: "og:title", content: "Jaime Jangles World Games" },
      {
        property: "og:description",
        content: "Pick a world-learning game and explore through music, clues, and story routes.",
      },
      { property: "og:image", content: "/art/title.png" },
    ],
  }),
  component: Index,
});

// ── "Casey Can" thumbnails: the symbol Casey points to + a pastel banner ────
const CASEY_CAN: Record<string, { symbol: string; bg: string }> = {
  "casey-can-count": { symbol: "1-2-3", bg: "#FFE0B2" }, // peach
  "count-with-jaime": { symbol: "+", bg: "#C8E6C9" }, // mint green
  "casey-can-subtract": { symbol: "−", bg: "#BBDEFB" }, // sky blue
  "casey-can-multiply": { symbol: "×", bg: "#F8BBD0" }, // pink
  "casey-can-divide": { symbol: "÷", bg: "#E1BEE7" }, // lavender
  "casey-can-spell": { symbol: "A-B-C", bg: "#FFF9C4" }, // butter yellow
  "casey-can-roman-numeral": { symbol: "MCXVI", bg: "#D1C4E9" }, // violet
  "casey-can-pay": { symbol: "$", bg: "#B2DFDB" }, // seafoam
};

// ── Puzzle thumbnails: real game screenshots framed on pastel banners ───────
const PUZZLE_THUMB: Record<string, { bg: string }> = {
  "sliding-puzzle": { bg: "#BBDEFB" }, // sky blue
  "spot-the-difference": { bg: "#FFE0B2" }, // peach
  mastermind: { bg: "#E1BEE7" }, // lavender
  "match-game": { bg: "#C8E6C9" }, // mint green
  "foxy-word-scramble": { bg: "#FFF9C4" }, // butter yellow
  checkers: { bg: "#F8BBD0" }, // pink
  chess: { bg: "#B2DFDB" }, // seafoam
};

// ── Learning thumbnails: solid pastel banners (matches Math/Puzzle rows) ────
const SOLID_BG: Record<string, string> = {
  "air-fante-alphabet": "#BAE6FD", // sky blue
  "jang-lang": "#D9F99D", // lime
};

// ── "Casey is pointing at…" icons: a small graphic beside her pointing pose ──
function PaletteIcon() {
  return (
    <svg viewBox="0 0 100 80" className="h-12 w-12 shrink-0" aria-hidden="true">
      <path
        d="M50 5 C25 5 5 22 5 42 C5 58 18 62 28 58 C34 55 38 58 38 64 C38 72 46 75 55 73 C75 68 95 55 95 38 C95 18 75 5 50 5 Z"
        fill="#fff"
        stroke="#1a1a1a"
        strokeWidth="5"
        strokeLinejoin="round"
      />
      <circle cx="28" cy="30" r="8" fill="#EF4444" stroke="#1a1a1a" strokeWidth="2.5" />
      <circle cx="50" cy="20" r="8" fill="#3B82F6" stroke="#1a1a1a" strokeWidth="2.5" />
      <circle cx="72" cy="28" r="8" fill="#FACC15" stroke="#1a1a1a" strokeWidth="2.5" />
      <circle cx="78" cy="48" r="8" fill="#22C55E" stroke="#1a1a1a" strokeWidth="2.5" />
      <circle cx="58" cy="52" r="7" fill="#A855F7" stroke="#1a1a1a" strokeWidth="2.5" />
    </svg>
  );
}

function KeyboardIcon() {
  const keyRow = (y: number, count: number, startX = 10) =>
    Array.from({ length: count }, (_, i) => (
      <rect key={`${y}-${i}`} x={startX + i * 12} y={y} width="9" height="9" rx="2.5" fill="#1a1a1a" opacity={0.85} />
    ));
  return (
    <svg viewBox="0 0 110 62" className="h-12 w-16 shrink-0" aria-hidden="true">
      <rect x="4" y="4" width="102" height="54" rx="10" fill="#fff" stroke="#1a1a1a" strokeWidth="5" />
      {keyRow(14, 8)}
      {keyRow(28, 8)}
      {keyRow(42, 6, 16)}
      <rect x="28" y="42" width="46" height="9" rx="3" fill="#1a1a1a" opacity={0.85} />
    </svg>
  );
}

const POINT_AT: Record<string, { icon: () => JSX.Element; bg: string }> = {
  "color-mix": { icon: PaletteIcon, bg: "#FFE0B2" }, // peach
  "type-with-casey": { icon: KeyboardIcon, bg: "#A5F3FC" }, // cyan
};

// ── Scrollable row with Netflix-style fade + arrow indicators ──────────────
function ScrollRow({ games }: { games: typeof GAME_MANIFEST }) {
  const ref = useRef<HTMLDivElement>(null);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);

  const check = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 8);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 8);
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Check immediately, then after a frame so layout is fully resolved
    check();
    const raf = requestAnimationFrame(check);
    el.addEventListener("scroll", check, { passive: true });
    const ro = new ResizeObserver(check);
    ro.observe(el);
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("scroll", check);
      ro.disconnect();
    };
  }, [check]);

  const scroll = (dir: "left" | "right") => {
    ref.current?.scrollBy({ left: dir === "right" ? 260 : -260, behavior: "smooth" });
  };

  return (
    <div className="relative">
      {/* Card row */}
      <div
        ref={ref}
        className="flex gap-3 overflow-x-auto pb-3 pt-2"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {games.map((game) => {
          const casey = CASEY_CAN[game.slug];
          const puzzle = PUZZLE_THUMB[game.slug];
          const pointAt = POINT_AT[game.slug];
          const solidBg = SOLID_BG[game.slug];
          return (
          <Link
            key={game.slug}
            to={game.href}
            className="group flex shrink-0 flex-col overflow-hidden rounded-[1.75rem] border-[3px] border-ink transition-transform hover:-translate-y-1"
            style={{
              background: "#fff",
              borderBottomWidth: 6,
              borderRightWidth: 5,
              textDecoration: "none",
              width: "13rem",
            }}
          >
            {/* Image banner */}
            <div
              className="flex shrink-0 items-center justify-center overflow-hidden rounded-t-[1.5rem]"
              style={{
                background: casey ? casey.bg : puzzle ? puzzle.bg : pointAt ? pointAt.bg : solidBg ?? game.accent + "33",
                height: "6rem",
                padding: game.slug === "fly-the-flag" || puzzle ? 0 : "0 0.75rem",
              }}
            >
              {puzzle ? (
                <div className="h-full w-full p-2">
                  <img
                    src={game.image}
                    alt={game.title}
                    className="h-full w-full rounded-xl border-2 border-ink object-cover"
                  />
                </div>
              ) : casey ? (
                <div className="flex h-full w-full items-center justify-center gap-1">
                  {/* The symbol Casey is pointing at */}
                  <span
                    className="font-semibold leading-none text-ink"
                    style={{ fontSize: casey.symbol.length > 2 ? "1.5rem" : "2.6rem" }}
                  >
                    {casey.symbol}
                  </span>
                  <img
                    src={game.image}
                    alt={game.title}
                    className="h-20 w-auto object-contain"
                    style={{ maxWidth: "55%" }}
                  />
                </div>
              ) : pointAt ? (
                <div className="flex h-full w-full items-center justify-center gap-1">
                  {/* The thing Casey is pointing at */}
                  <pointAt.icon />
                  <img
                    src={game.image}
                    alt={game.title}
                    className="h-20 w-auto object-contain"
                    style={{ maxWidth: "55%" }}
                  />
                </div>
              ) : (
                <img
                  src={game.image}
                  alt={game.title}
                  className={game.slug === "fly-the-flag" ? "w-full h-full" : "h-20 w-auto object-contain"}
                  style={{
                    maxWidth: "100%",
                    mixBlendMode: game.slug === "fly-the-flag" ? "normal" : "multiply",
                    objectFit: game.slug === "fly-the-flag" ? "cover" : undefined,
                    objectPosition: game.slug === "fly-the-flag" ? "50% 0%" : undefined,
                    maskImage:
                      game.slug === "fly-the-flag"
                        ? "linear-gradient(to bottom, black 80%, transparent 84%)"
                        : game.slug === "world-adventure"
                        ? "linear-gradient(to right, transparent 0%, black 22%)"
                        : undefined,
                    WebkitMaskImage:
                      game.slug === "fly-the-flag"
                        ? "linear-gradient(to bottom, black 80%, transparent 84%)"
                        : game.slug === "world-adventure"
                        ? "linear-gradient(to right, transparent 0%, black 22%)"
                        : undefined,
                  }}
                />
              )}
            </div>

            {/* Content */}
            <div className="flex flex-1 flex-col px-3 pt-2 pb-3">
              <div className="text-[0.58rem] uppercase tracking-[0.22em] text-ink/50 font-bold">
                {game.eyebrow}
              </div>
              <h2 className="mt-0.5 text-sm font-extrabold leading-tight">{game.title}</h2>
              <p className="mt-1 flex-1 text-[0.68rem] text-ink/65 leading-relaxed line-clamp-2">
                {game.description}
              </p>
              <div className="mt-2.5 flex justify-center">
                <span
                  className="rounded-full border-[3px] border-ink px-5 py-1 text-sm font-extrabold transition-all group-hover:scale-105"
                  style={{
                    background: game.accent,
                    borderBottomWidth: 5,
                    borderRightWidth: 4,
                  }}
                >
                  Play →
                </span>
              </div>
            </div>
          </Link>
          );
        })}
      </div>

      {/* Left fade + arrow */}
      {canScrollLeft && (
        <div
          className="pointer-events-none absolute left-0 top-0 bottom-3 w-16 z-10 flex items-center"
          style={{ background: "linear-gradient(to right, #FFFBF0 35%, transparent)" }}
        >
          <button
            className="pointer-events-auto ml-1 flex h-9 w-9 items-center justify-center rounded-full border-[2.5px] border-ink bg-white text-lg font-extrabold shadow-sm transition-transform hover:scale-110 active:scale-95"
            style={{ borderBottomWidth: 4, borderRightWidth: 3 }}
            onClick={() => scroll("left")}
            aria-label="Scroll left"
          >
            ‹
          </button>
        </div>
      )}

      {/* Right fade + arrow */}
      {canScrollRight && (
        <div
          className="pointer-events-none absolute right-0 top-0 bottom-3 w-20 z-10 flex items-center justify-end"
          style={{ background: "linear-gradient(to left, #FFFBF0 35%, transparent)" }}
        >
          <button
            className="pointer-events-auto mr-1 flex h-9 w-9 items-center justify-center rounded-full border-[2.5px] border-ink bg-white text-lg font-extrabold shadow-sm transition-transform hover:scale-110 active:scale-95"
            style={{ borderBottomWidth: 4, borderRightWidth: 3 }}
            onClick={() => scroll("right")}
            aria-label="Scroll right"
          >
            ›
          </button>
        </div>
      )}
    </div>
  );
}

function Index() {
  return (
    <div className="flex flex-col gap-6">

      {/* ── Timer button, off to the side ── */}
      <JanglesTimer />

      {/* ── Hero + Character asides, three across ── */}
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">

        {/* Hero card */}
        <div
          className="flex flex-col justify-center rounded-[2rem] border-[3px] border-ink px-5 py-4"
          style={{ background: "#fff", borderBottomWidth: 6, borderRightWidth: 5 }}
        >
          <div
            className="mb-2 inline-flex w-fit whitespace-nowrap rounded-full border-[3px] border-ink px-2 py-0.5 text-sm font-extrabold uppercase tracking-[0.3em]"
            style={{ background: "#FBBF24", borderBottomWidth: 5, borderRightWidth: 4 }}
          >
            Jangles Game Hub
          </div>
          <h1 className="text-xl font-extrabold leading-tight sm:text-2xl lg:text-[1.6rem]">
            Your world tour starts here —<br /> pick a game and jump in!
          </h1>
          <p className="mt-1.5 max-w-lg text-xs text-ink/65 leading-relaxed sm:text-sm">
            Music, mysteries, and map adventures with Jaime &amp; Jeff.<br />
            Choose a game below and start exploring the world!
          </p>
        </div>

        {/* Meet the crew */}
        <aside
          className="flex items-center gap-3 overflow-hidden rounded-[2rem] border-[3px] border-ink"
          style={{ background: "#FFF0F8", borderBottomWidth: 5, borderRightWidth: 4 }}
        >
          <img
            src={asset("/characters/guitar-jaime-jeff.png")}
            alt="Jaime and Jeff"
            className="h-full w-auto max-w-[38%] self-end object-contain"
          />
          <div className="flex-1 py-3 pr-4">
            <div
              className="mb-1 inline-flex rounded-full border-[2px] border-ink px-2 py-0.5 text-[0.75rem] font-extrabold uppercase tracking-[0.25em]"
              style={{ background: "#FF4EAB", borderBottomWidth: 3, borderRightWidth: 2, color: "#fff" }}
            >
              Meet the crew
            </div>
            <p className="text-xs text-ink/80 leading-relaxed">
              Jaime and Jeff travel the world making music, chasing adventure, and discovering amazing places!
            </p>
          </div>
        </aside>

        {/* The mastermind */}
        <aside
          className="flex items-center gap-3 overflow-hidden rounded-[2rem] border-[3px] border-ink"
          style={{ background: "#F0F8FF", borderBottomWidth: 5, borderRightWidth: 4 }}
        >
          <img
            src={asset("/characters/map-casey.png")}
            alt="Casey Bea"
            className="h-full w-auto max-w-[38%] self-end object-contain"
            style={{ mixBlendMode: "multiply" }}
          />
          <div className="flex-1 py-3 pr-4">
            <div
              className="mb-1 inline-flex rounded-full border-[2px] border-ink px-2 py-0.5 text-[0.75rem] font-extrabold uppercase tracking-[0.25em]"
              style={{ background: "#60C8FF", borderBottomWidth: 3, borderRightWidth: 2 }}
            >
              The mastermind
            </div>
            <p className="text-xs text-ink/80 leading-relaxed">
              Casey Bea sends Jaime and Jeff on every adventure — and always makes sure Foxy comes along!
            </p>
          </div>
        </aside>
      </section>

      {/* ── Hall of Fame ── */}
      <HallOfFame />

      {/* ── Netflix-style category rows ── */}
      <div className="flex flex-col gap-8">
        {CATEGORY_MANIFEST.map((category) => {
          const games = GAME_MANIFEST.filter((g) => g.category === category.slug);
          if (games.length === 0) return null;
          return (
            <section key={category.slug}>
              {/* Row header */}
              <div className="mb-3 flex items-center gap-3">
                <div
                  className="inline-flex items-center gap-1.5 rounded-full border-[2px] border-ink px-3 py-1 text-[0.65rem] font-extrabold uppercase tracking-[0.18em]"
                  style={{
                    background: category.accent + "33",
                    borderBottomWidth: 3,
                    borderRightWidth: 2,
                  }}
                >
                  <span>{category.emoji}</span>
                  <span>{category.title}</span>
                </div>
                <span className="text-[0.6rem] text-ink/45 font-medium">{category.eyebrow}</span>
              </div>
              {category.headerLogo && (
                <div
                  className="mb-3 flex items-center gap-0 overflow-hidden rounded-[2rem] border-[3px] border-ink"
                  style={{
                    background: category.accent + "22",
                    borderBottomWidth: 5,
                    borderRightWidth: 4,
                    maxWidth: "28rem",
                  }}
                >
                  {category.headerCharacter && (
                    <img
                      src={category.headerCharacter}
                      alt=""
                      className="h-20 w-auto self-end object-contain"
                      style={{ mixBlendMode: "multiply", marginLeft: "0.5rem" }}
                    />
                  )}
                  <div className="flex flex-col justify-center px-4 py-3">
                    <img
                      src={category.headerLogo}
                      alt="Casey Can"
                      style={{ height: "2.2rem", width: "auto", display: "block" }}
                    />
                    <span className="mt-1 text-[0.6rem] text-ink/50 font-bold uppercase tracking-[0.2em]">
                      {category.eyebrow}
                    </span>
                  </div>
                </div>
              )}

              {/* Horizontal scroll row with indicators */}
              <ScrollRow games={games} />
            </section>
          );
        })}
      </div>

    </div>
  );
}
