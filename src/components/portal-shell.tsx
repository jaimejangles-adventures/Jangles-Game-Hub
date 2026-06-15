import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { type ReactNode, useState, useRef, useEffect } from "react";
import { GAME_MANIFEST, CATEGORY_MANIFEST, type GameManifestEntry, type CategoryEntry, type GameCategory } from "@/lib/game-manifest";
import { cn } from "@/lib/utils";
import { asset } from "@/lib/asset";
import { isMuted, setMuted } from "@/lib/sound";
import { useAuth } from "@/lib/auth-context";
import { flagEmoji } from "@/lib/countries";
import { useBucksContext } from "@/lib/bucks-context";

type EarnerEntry = { emoji: string; title: string; difficulty: 1 | 2 | 3 | 4 };

const BUCK_EARNERS: EarnerEntry[] = [
  { emoji: "🔢", title: "Casey Can Count!", difficulty: 1 },
  { emoji: "➕", title: "Casey Can Add!", difficulty: 1 },
  { emoji: "🎨", title: "Color Mix!", difficulty: 1 },
  { emoji: "🖍️", title: "Draw with Casey!", difficulty: 1 },
  { emoji: "➖", title: "Casey Can Subtract!", difficulty: 2 },
  { emoji: "🔤", title: "Casey Can Spell!", difficulty: 2 },
  { emoji: "🔍", title: "Spot the Difference!", difficulty: 2 },
  { emoji: "🃏", title: "Match Mania!", difficulty: 2 },
  { emoji: "✖️", title: "Casey Can Multiply!", difficulty: 3 },
  { emoji: "➗", title: "Casey Can Divide!", difficulty: 3 },
  { emoji: "🦊", title: "Foxy's Word Scramble!", difficulty: 3 },
  { emoji: "🧩", title: "Fix the Pic!", difficulty: 3 },
  { emoji: "🏁", title: "Fly the Flag!", difficulty: 3 },
  { emoji: "📍", title: "Name That Country!", difficulty: 3 },
  { emoji: "⌨️", title: "Type with Casey!", difficulty: 3 },
  { emoji: "🎵", title: "Music Match", difficulty: 4 },
  { emoji: "🧭", title: "Find Jaime & Jeff", difficulty: 4 },
  { emoji: "🔐", title: "Crack the Code!", difficulty: 4 },
  { emoji: "🏛️", title: "Casey Can Roman Numeral!", difficulty: 4 },
  { emoji: "💰", title: "Casey Can Pay!", difficulty: 4 },
];

const DIFFICULTY_LABELS: Record<1 | 2 | 3 | 4, { label: string; color: string }> = {
  1: { label: "Super Easy", color: "#22C55E" },
  2: { label: "Easy", color: "#3B82F6" },
  3: { label: "Medium", color: "#F97316" },
  4: { label: "Challenging", color: "#8B5CF6" },
};

type PortalShellProps = {
  children: ReactNode;
};

const FULL_BLEED_ROUTES = ["/games/find-foxy", "/games/world-adventure", "/games/fly-the-flag", "/games/name-that-country", "/games/music-match", "/games/draw-with-casey", "/games/casey-can-count", "/games/count-with-jaime", "/games/casey-can-subtract", "/games/casey-can-multiply", "/games/casey-can-divide", "/games/jangles-ball", "/games/elefante", "/games/air-fante-collect", "/games/sliding-puzzle", "/games/foxer", "/games/mastermind", "/games/pacman", "/games/jangles-kong", "/games/casey-can-spell", "/games/foxy-word-scramble", "/games/jangles-pong", "/games/color-mix", "/games/casey-can-roman-numeral", "/games/casey-can-pay", "/games/chess"];

export function PortalShell({ children }: PortalShellProps) {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });
  const navigate = useNavigate();
  const { user, profile, openAuthModal, openEditProfile, signOut } = useAuth();
  const { balance, showToast, warningMessage } = useBucksContext();

  const isFullBleed = FULL_BLEED_ROUTES.includes(pathname);
  const [openCategory, setOpenCategory] = useState<GameCategory | null>(null);
  const [panelLeft, setPanelLeft] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showEscapePrompt, setShowEscapePrompt] = useState(false);
  const [showBucksModal, setShowBucksModal] = useState(false);
  const [muted, setMutedState] = useState(isMuted);
  const navRef = useRef<HTMLDivElement>(null);

  function toggleMute() {
    const next = !muted;
    setMuted(next);
    setMutedState(next);
  }

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpenCategory(null);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Escape key → prompt to go back to Game Hub (only when not already on home)
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if (e.key !== "Escape") return;
      if (pathname === "/") return;
      if (showEscapePrompt) {
        setShowEscapePrompt(false);
      } else {
        setShowEscapePrompt(true);
      }
    }
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [pathname, showEscapePrompt]);

  // Close mobile menu on navigation
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  function handleCategoryToggle(slug: GameCategory, buttonEl: HTMLButtonElement) {
    if (openCategory === slug) {
      setOpenCategory(null);
      return;
    }
    // Align the panel under whichever button was clicked
    if (navRef.current) {
      const btnRect = buttonEl.getBoundingClientRect();
      const groupRect = navRef.current.getBoundingClientRect();
      setPanelLeft(btnRect.left - groupRect.left);
    }
    setOpenCategory(slug);
  }

  const openCategoryEntry = openCategory
    ? CATEGORY_MANIFEST.find((c) => c.slug === openCategory) ?? null
    : null;
  const openCategoryGames = openCategory
    ? GAME_MANIFEST.filter((g) => g.category === openCategory)
    : [];

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-paper text-ink">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
        style={{
          background:
            "radial-gradient(circle at top left, rgba(255,78,171,0.18), transparent 30%), radial-gradient(circle at top right, rgba(59,130,246,0.18), transparent 28%), radial-gradient(circle at bottom center, rgba(251,191,36,0.2), transparent 30%), linear-gradient(180deg, #fffbf0 0%, #fff7e0 100%)",
        }}
      >
        <div
          className="absolute left-[8%] top-[8%] h-32 w-32 rounded-full border-4 border-ink/10"
          style={{ background: "rgba(255, 78, 171, 0.18)" }}
        />
        <div
          className="absolute right-[10%] top-[16%] h-24 w-24 rounded-full border-4 border-ink/10"
          style={{ background: "rgba(59, 130, 246, 0.16)" }}
        />
        <div
          className="absolute bottom-[12%] left-[18%] h-28 w-28 rounded-full border-4 border-ink/10"
          style={{ background: "rgba(34, 197, 94, 0.14)" }}
        />
      </div>

      <header className="sticky top-0 z-30 border-b-4 border-ink bg-paper/95 backdrop-blur">
        {/* Single row: Logo on the left, 3 category dropdowns on the right */}
        <div className="flex h-20 w-full items-center gap-3 pl-1 pr-3 sm:h-28 sm:pl-2 sm:pr-4 lg:pl-3 lg:pr-6">

          {/* Logo */}
          <Link to="/" className="flex shrink-0 items-center gap-1.5">
            <img
              src={asset("/art/title.png")}
              alt="Jaime Jangles"
              className="h-[2.2rem] w-[185px] shrink-0 sm:h-[4.2rem] sm:w-[353px]"
            />
            <img
              src={asset("/art/world_tour.png")}
              alt="World Tour"
              className="h-[2.6rem] w-[4rem] shrink-0 sm:h-[4.7rem] sm:w-[7.2rem]"
            />
          </Link>

          {/* Mute + Hamburger — mobile only */}
          <div className="ml-auto flex sm:hidden items-center gap-2">
            <button
              className="flex items-center justify-center rounded-full border-[3px] border-ink bg-white p-2 text-xl"
              style={{ borderBottomWidth: 5, borderRightWidth: 4 }}
              onClick={toggleMute}
              aria-label={muted ? "Unmute sound" : "Mute sound"}
            >
              {muted ? "🔇" : "🔊"}
            </button>
            <button
              className="flex items-center justify-center rounded-full border-[3px] border-ink bg-white p-2 text-xl"
              style={{ borderBottomWidth: 5, borderRightWidth: 4 }}
              onClick={() => setMobileMenuOpen((o) => !o)}
              aria-label="Open menu"
            >
              {mobileMenuOpen ? "✕" : "☰"}
            </button>
          </div>

          {/* Pills — hidden on mobile, visible on sm+ */}
          <div className="hidden sm:flex min-w-0 flex-1 items-center py-2">
          {/* navRef = positioning context + click-outside; no overflow so dropdown & animation are never clipped */}
          <div ref={navRef} className="relative min-w-0 flex-1">
            {/* Scrollable pill row */}
            <div className="flex items-center gap-1.5 overflow-x-auto" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
              {/* Game Hub pill */}
              <Link
                to="/"
                className={cn(
                  "flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full border-[2px] border-ink px-2.5 py-0.5 text-xs font-extrabold transition-opacity hover:opacity-75",
                  pathname === "/" ? "text-white" : "text-ink",
                )}
                style={{
                  background: pathname === "/" ? "#22C55E" : "#fff",
                  borderBottomWidth: 3,
                  borderRightWidth: 2,
                }}
              >
                🏠 Game Hub
              </Link>

              {CATEGORY_MANIFEST.map((category) => {
                const categoryGames = GAME_MANIFEST.filter((g) => g.category === category.slug);
                const activeGameInCategory = categoryGames.find((g) => g.href === pathname) ?? null;
                return (
                  <CategoryButton
                    key={category.slug}
                    category={category}
                    activeGame={activeGameInCategory}
                    isOpen={openCategory === category.slug}
                    onToggle={(btnEl) => handleCategoryToggle(category.slug, btnEl)}
                  />
                );
              })}
            </div>

            {/* Dropdown panel — outside scroll div so it's never clipped */}
            {openCategory && openCategoryEntry && (
              <div
                className="absolute z-50 min-w-[14rem] overflow-hidden rounded-[1.25rem] border-[3px] border-ink bg-paper shadow-xl"
                style={{
                  top: "calc(100% + 8px)",
                  left: panelLeft,
                  borderBottomWidth: 6,
                  borderRightWidth: 5,
                }}
              >
                <div className="border-b-2 border-ink/10 px-3 pb-1.5 pt-2.5">
                  <div className="text-[0.6rem] font-extrabold uppercase tracking-[0.2em] text-ink/40">
                    {openCategoryEntry.title}
                  </div>
                  <div className="text-[0.65rem] font-normal text-ink/50">
                    {openCategoryEntry.eyebrow}
                  </div>
                </div>
                {openCategoryGames.map((game) => (
                  <Link
                    key={game.slug}
                    to={game.href}
                    onClick={() => setOpenCategory(null)}
                    className={cn(
                      "flex items-center gap-2.5 px-3 py-2 text-sm font-bold transition-colors hover:bg-ink/5",
                      pathname === game.href && "bg-ink/5",
                    )}
                  >
                    <span
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 border-ink text-sm"
                      style={{ background: game.accent + "44" }}
                    >
                      {game.emoji}
                    </span>
                    <span className="leading-tight">
                      <span className="block text-ink">{game.title}</span>
                      <span className="block text-[0.65rem] font-normal text-ink/55">{game.eyebrow}</span>
                    </span>
                    {pathname === game.href && (
                      <span className="ml-auto text-[0.6rem] font-extrabold uppercase tracking-wide text-ink/40">
                        Now
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            )}
          </div>
          </div>

          {/* Mute + Auth — desktop only */}
          <div className="hidden sm:flex ml-auto items-center gap-2 shrink-0">
            <button
              className="flex items-center justify-center rounded-full border-[3px] border-ink bg-white px-3 py-1.5 text-sm font-extrabold transition-transform hover:-translate-y-0.5 gap-1.5"
              style={{ borderBottomWidth: 5, borderRightWidth: 4 }}
              onClick={toggleMute}
              aria-label={muted ? "Unmute sound" : "Mute sound"}
            >
              <span>{muted ? "🔇" : "🔊"}</span>
              <span>{muted ? "Muted" : "Sound"}</span>
            </button>
            {user && (
              <button
                className="flex items-center gap-1 rounded-full border-[3px] border-ink bg-yellow-300 px-3 py-1.5 text-sm font-extrabold transition-transform hover:-translate-y-0.5"
                style={{ borderBottomWidth: 5, borderRightWidth: 4 }}
                onClick={() => setShowBucksModal(true)}
                aria-label="What are Jangles Bucks?"
              >
                <img src={asset("/art/jangles-buck.png")} alt="Jangles Buck" className="h-5 w-5 object-contain" />
                <span>{balance}</span>
                <span className="text-[0.6rem] opacity-60 ml-0.5">?</span>
              </button>
            )}
            {user ? (
              <UserMenu user={user} profile={profile} flagEmoji={flagEmoji} signOut={signOut} openEditProfile={openEditProfile} />
            ) : (
              <button
                onClick={() => openAuthModal('sign-in')}
                className="flex items-center gap-1.5 rounded-full border-[3px] border-ink bg-white px-3 py-1.5 text-sm font-extrabold transition-transform hover:-translate-y-0.5"
                style={{ borderBottomWidth: 5, borderRightWidth: 4 }}
              >
                <span>🏆</span>
                <span>Sign In</span>
              </button>
            )}
          </div>

        </div>

        {/* Mobile menu dropdown — sm: hidden */}
        {mobileMenuOpen && (
          <div className="sm:hidden border-t-4 border-ink bg-paper px-4 pb-4 pt-2">
            <Link
              to="/"
              className="flex items-center gap-2 rounded-xl border-[3px] border-ink px-4 py-3 mb-3 font-extrabold text-ink bg-white"
              style={{ borderBottomWidth: 5, borderRightWidth: 4 }}
            >
              🏠 Game Hub
            </Link>
            {user ? (
              <div className="flex items-center justify-between rounded-xl border-[3px] border-ink px-4 py-3 mb-3 bg-white"
                style={{ borderBottomWidth: 5, borderRightWidth: 4 }}>
                <span className="font-extrabold text-ink flex items-center gap-1.5">
                  {profile ? `${flagEmoji(profile.country_code)} ${profile.username}` : `👤 ${user.email}`}
                </span>
                <button onClick={signOut} className="text-xs font-bold text-ink/50 hover:text-ink">
                  Sign Out
                </button>
              </div>
            ) : (
              <button
                onClick={() => { openAuthModal('sign-in'); setMobileMenuOpen(false); }}
                className="flex w-full items-center gap-2 rounded-xl border-[3px] border-ink px-4 py-3 mb-3 font-extrabold text-white"
                style={{ background: '#22C55E', borderBottomWidth: 5, borderRightWidth: 4 }}
              >
                🏆 Sign In / Join Leaderboard
              </button>
            )}
            {user && (
              <button
                className="flex w-full items-center gap-2 rounded-xl border-[3px] border-ink px-4 py-3 mb-3 bg-yellow-300 font-extrabold text-left"
                style={{ borderBottomWidth: 5, borderRightWidth: 4 }}
                onClick={() => { setShowBucksModal(true); setMobileMenuOpen(false); }}
              >
                <img src={asset("/art/jangles-buck.png")} alt="Jangles Buck" className="h-6 w-6 object-contain" />
                <span>{balance} Jangles Buck{balance !== 1 ? 's' : ''}</span>
                <span className="ml-auto text-[0.7rem] opacity-60">What's this? →</span>
              </button>
            )}
            {CATEGORY_MANIFEST.map((category) => {
              const categoryGames = GAME_MANIFEST.filter((g) => g.category === category.slug);
              return (
                <div key={category.slug} className="mb-3">
                  <div className="mb-1.5 px-1 text-[0.65rem] font-extrabold uppercase tracking-[0.18em] text-ink/40">
                    {category.emoji} {category.title}
                  </div>
                  <div className="flex flex-col gap-1">
                    {categoryGames.map((game) => (
                      <Link
                        key={game.slug}
                        to={game.href}
                        className={cn(
                          "flex items-center gap-3 rounded-xl border-[2px] border-ink/20 px-3 py-2.5 text-sm font-bold transition-colors",
                          pathname === game.href ? "bg-ink/10 border-ink/40" : "bg-white",
                        )}
                      >
                        <span
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-ink text-base"
                          style={{ background: game.accent + "44" }}
                        >
                          {game.emoji}
                        </span>
                        <span>
                          <span className="block text-ink">{game.title}</span>
                          <span className="block text-[0.65rem] font-normal text-ink/55">{game.eyebrow}</span>
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </header>

      {isFullBleed ? (
        <div className="flex min-h-0 flex-1 flex-col">{children}</div>
      ) : (
        <div className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-6xl px-4 pb-12 pt-6 sm:px-6 lg:px-8">{children}</div>
        </div>
      )}

      {/* Jangles Buck earned toast */}
      {showToast && (
        <div
          className="fixed bottom-8 left-1/2 z-50 -translate-x-1/2 flex items-center gap-2 rounded-full border-[3px] border-ink bg-yellow-300 px-5 py-3 text-base font-extrabold shadow-xl"
          style={{
            borderBottomWidth: 5,
            borderRightWidth: 4,
            animation: "buckToast 2.5s ease forwards",
          }}
        >
          <img src={asset("/art/jangles-buck.png")} alt="Jangles Buck" className="h-7 w-7 object-contain" />
          <span>+1 Jangles Buck earned!</span>
        </div>
      )}

      {/* Coins remaining warning toast */}
      {warningMessage && (
        <div
          className="fixed bottom-24 left-1/2 z-50 -translate-x-1/2 flex items-center gap-2 rounded-full border-[3px] border-ink bg-orange-300 px-5 py-3 text-base font-extrabold shadow-xl"
          style={{
            borderBottomWidth: 5,
            borderRightWidth: 4,
            animation: "buckToast 3s ease forwards",
          }}
        >
          <span style={{ fontSize: "1.3rem" }}>⚠️</span>
          <span>{warningMessage}</span>
        </div>
      )}

      {/* Jangles Bucks info modal */}
      {showBucksModal && <JanglesBucksModal onClose={() => setShowBucksModal(false)} balance={balance} />}

      {/* Escape → Game Hub prompt */}
      {showEscapePrompt && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.35)", backdropFilter: "blur(4px)" }}
          onClick={() => setShowEscapePrompt(false)}
        >
          <div
            className="relative flex flex-col items-center gap-5 rounded-[2rem] border-[3px] border-ink px-8 py-7"
            style={{
              background: "#fffbf0",
              borderBottomWidth: 7,
              borderRightWidth: 6,
              maxWidth: "22rem",
              width: "90vw",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Badge */}
            <div
              className="inline-flex items-center gap-1.5 rounded-full border-[2px] border-ink px-3 py-0.5 text-[0.6rem] font-extrabold uppercase tracking-[0.25em]"
              style={{ background: "#FBBF24", borderBottomWidth: 4, borderRightWidth: 3 }}
            >
              🏠 Leaving game
            </div>

            <p className="text-center text-base font-extrabold leading-snug text-ink">
              Head back to<br />Game Hub?
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowEscapePrompt(false);
                  navigate({ to: "/" });
                }}
                className="rounded-full border-[3px] border-ink px-6 py-2 text-sm font-extrabold text-white transition-transform hover:-translate-y-0.5"
                style={{ background: "#22C55E", borderBottomWidth: 5, borderRightWidth: 4 }}
              >
                Yes, let's go!
              </button>
              <button
                onClick={() => setShowEscapePrompt(false)}
                className="rounded-full border-[3px] border-ink px-6 py-2 text-sm font-extrabold text-ink transition-transform hover:-translate-y-0.5"
                style={{ background: "#fff", borderBottomWidth: 5, borderRightWidth: 4 }}
              >
                Keep playing
              </button>
            </div>

            <p className="text-[0.6rem] font-medium text-ink/35 tracking-wide">
              Press Esc again to dismiss
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function JanglesBucksModal({ onClose, balance }: { onClose: () => void; balance: number }) {
  const grouped = [1, 2, 3, 4] as const;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.40)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div
        className="relative flex flex-col rounded-[2rem] border-[3px] border-ink bg-paper shadow-2xl overflow-hidden"
        style={{
          borderBottomWidth: 7,
          borderRightWidth: 6,
          maxWidth: "32rem",
          width: "100%",
          maxHeight: "90vh",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center gap-3 px-6 pt-6 pb-4 border-b-[3px] border-ink"
          style={{ background: "#FEF08A" }}
        >
          <img src={asset("/art/jangles-buck.png")} alt="Jangles Buck" className="h-10 w-10 object-contain" />
          <div className="flex-1 min-w-0">
            <div className="text-[0.6rem] font-extrabold uppercase tracking-[0.2em] text-ink/50 mb-0.5">Your balance</div>
            <div className="text-2xl font-extrabold text-ink leading-none">
              {balance} Jangles Buck{balance !== 1 ? "s" : ""}
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-[2px] border-ink bg-white text-sm font-extrabold hover:bg-ink/10 transition-colors"
            style={{ borderBottomWidth: 3, borderRightWidth: 3 }}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 px-6 py-5 flex flex-col gap-5">
          {/* What is a Jangles Buck */}
          <div>
            <div className="text-[0.6rem] font-extrabold uppercase tracking-[0.2em] text-ink/40 mb-1.5">What is a Jangles Buck?</div>
            <p className="text-sm font-bold text-ink/80 leading-snug">
              Jangles Bucks are coins you earn by playing <strong>learning games</strong>. Spend them to unlock <strong>Arcade Adventures</strong> — fast-paced games like Jangles Pac, FOXER, Jangles Kong, and more!
            </p>
            <div className="mt-2.5 flex flex-wrap gap-2 text-xs font-extrabold">
              <span
                className="flex items-center gap-1 rounded-full border-[2px] border-ink px-2.5 py-1"
                style={{ background: "#D1FAE5" }}
              >
                📚 Learn → earn up to 5 per game, per day
              </span>
              <span
                className="flex items-center gap-1 rounded-full border-[2px] border-ink px-2.5 py-1"
                style={{ background: "#FEE2E2" }}
              >
                🕹️ Spend 1 buck per arcade session
              </span>
            </div>
          </div>

          {/* Legend */}
          <div>
            <div className="text-[0.6rem] font-extrabold uppercase tracking-[0.2em] text-ink/40 mb-3">
              Games that earn Jangles Bucks
            </div>

            {/* Difficulty key */}
            <div className="flex flex-wrap gap-2 mb-3">
              {([1, 2, 3, 4] as const).map((d) => (
                <span
                  key={d}
                  className="flex items-center gap-1 rounded-full border-[2px] border-ink px-2 py-0.5 text-[0.6rem] font-extrabold text-white"
                  style={{ background: DIFFICULTY_LABELS[d].color, borderBottomWidth: 3, borderRightWidth: 2 }}
                >
                  {"★".repeat(d)}{"☆".repeat(4 - d)} {DIFFICULTY_LABELS[d].label}
                </span>
              ))}
            </div>

            {grouped.map((d) => {
              const games = BUCK_EARNERS.filter((g) => g.difficulty === d);
              return (
                <div key={d} className="mb-3">
                  <div
                    className="inline-flex items-center gap-1.5 rounded-full border-[2px] border-ink px-2.5 py-0.5 text-[0.6rem] font-extrabold text-white mb-1.5"
                    style={{ background: DIFFICULTY_LABELS[d].color, borderBottomWidth: 3, borderRightWidth: 2 }}
                  >
                    {"★".repeat(d)}{"☆".repeat(4 - d)} {DIFFICULTY_LABELS[d].label}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {games.map((g) => (
                      <span
                        key={g.title}
                        className="flex items-center gap-1 rounded-full border-[2px] border-ink/20 bg-white px-2.5 py-1 text-xs font-bold text-ink"
                      >
                        {g.emoji} {g.title}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Arcade games */}
          <div>
            <div className="text-[0.6rem] font-extrabold uppercase tracking-[0.2em] text-ink/40 mb-2">
              Arcade games (spend 1 buck each)
            </div>
            <div className="flex flex-wrap gap-1.5">
              {[
                { emoji: "🐘", title: "Air Fante Dodge" },
                { emoji: "⭐", title: "Air Fante Collect!" },
                { emoji: "🦊", title: "FOXER" },
                { emoji: "🎮", title: "Jangles Ball" },
                { emoji: "👾", title: "Jangles Pac" },
                { emoji: "🦍", title: "Jangles Kong" },
                { emoji: "🏓", title: "Jangles Pong" },
              ].map((g) => (
                <span
                  key={g.title}
                  className="flex items-center gap-1 rounded-full border-[2px] border-ink/20 px-2.5 py-1 text-xs font-bold text-ink"
                  style={{ background: "#F0FDF4" }}
                >
                  {g.emoji} {g.title}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Footer CTA */}
        <div className="px-6 py-4 border-t-[2px] border-ink/10">
          <button
            onClick={onClose}
            className="w-full rounded-full border-[3px] border-ink px-6 py-2.5 text-sm font-extrabold text-white transition-transform hover:-translate-y-0.5"
            style={{ background: "#22C55E", borderBottomWidth: 5, borderRightWidth: 4 }}
          >
            Got it — let's play!
          </button>
        </div>
      </div>
    </div>
  );
}

function CategoryButton({
  category,
  activeGame,
  isOpen,
  onToggle,
}: {
  category: CategoryEntry;
  activeGame: GameManifestEntry | null;
  isOpen: boolean;
  onToggle: (buttonEl: HTMLButtonElement) => void;
}) {
  return (
    <button
      onClick={(e) => onToggle(e.currentTarget)}
      className={cn(
        "flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full border-[2px] border-ink px-2.5 py-0.5 text-xs font-extrabold transition-opacity hover:opacity-75",
        activeGame ? "text-white" : "text-ink",
      )}
      style={{
        background: activeGame ? activeGame.accent : "#fff",
        borderBottomWidth: 3,
        borderRightWidth: 2,
      }}
    >
      <span>{category.emoji}</span>
      <span>{category.title}</span>
      <span style={{ fontSize: "0.55rem", opacity: 0.65 }}>▼</span>
    </button>
  );
}

function UserMenu({
  user,
  profile,
  flagEmoji: flag,
  signOut,
  openEditProfile,
}: {
  user: { email?: string };
  profile: { country_code: string; username: string } | null;
  flagEmoji: (code: string) => string;
  signOut: () => void;
  openEditProfile: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 rounded-full border-[3px] border-ink bg-white px-3 py-1.5 text-sm font-extrabold transition-transform hover:-translate-y-0.5"
        style={{ borderBottomWidth: 5, borderRightWidth: 4 }}
      >
        {profile && <span>{flag(profile.country_code)}</span>}
        <span>{profile ? profile.username : "👤 Me"}</span>
        <span style={{ fontSize: "0.55rem", opacity: 0.6 }}>{open ? "▲" : "▼"}</span>
      </button>
      {open && (
        <div
          className="absolute right-0 top-full mt-1 z-50 min-w-[11rem] rounded-[1.25rem] border-[3px] border-ink bg-paper shadow-xl overflow-hidden"
          style={{ borderBottomWidth: 6, borderRightWidth: 5 }}
        >
          <div className="px-3 py-2 border-b border-ink/10 text-[0.6rem] text-ink/50 font-bold uppercase tracking-widest truncate">
            {user.email?.includes("@play.jaimejangles.com") ? "No email set" : user.email}
          </div>
          <button
            onClick={() => { setOpen(false); openEditProfile(); }}
            className="w-full text-left px-3 py-2.5 text-sm font-bold text-ink hover:bg-ink/5 transition-colors"
          >
            ✏️ Edit Profile
          </button>
          <button
            onClick={() => { setOpen(false); signOut(); }}
            className="w-full text-left px-3 py-2.5 text-sm font-bold text-ink hover:bg-ink/5 transition-colors border-t border-ink/10"
          >
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}
