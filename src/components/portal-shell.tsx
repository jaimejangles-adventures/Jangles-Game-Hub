import { Link, useRouterState } from "@tanstack/react-router";
import { type ReactNode, useState, useRef, useEffect } from "react";
import { GAME_MANIFEST, CATEGORY_MANIFEST, type GameManifestEntry, type CategoryEntry, type GameCategory } from "@/lib/game-manifest";
import { cn } from "@/lib/utils";
import { asset } from "@/lib/asset";

type PortalShellProps = {
  children: ReactNode;
};

const FULL_BLEED_ROUTES = ["/games/find-foxy", "/games/world-adventure", "/games/fly-the-flag", "/games/name-that-country", "/games/music-match", "/games/draw-with-casey", "/games/casey-can-count", "/games/count-with-jaime", "/games/jangles-ball", "/games/elefante", "/games/air-fante-collect", "/games/sliding-puzzle", "/games/foxer"];

export function PortalShell({ children }: PortalShellProps) {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });

  const isFullBleed = FULL_BLEED_ROUTES.includes(pathname);
  const [openCategory, setOpenCategory] = useState<GameCategory | null>(null);
  const [panelLeft, setPanelLeft] = useState(0);
  const navRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside the dropdown group
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpenCategory(null);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

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
          <Link to="/" className="flex shrink-0 items-center gap-2">
            <img
              src={asset("/art/title.png")}
              alt="Jaime Jangles"
              className="h-[3.15rem] w-[265px] shrink-0 sm:h-[4.2rem] sm:w-[353px]"
            />
            <img
              src={asset("/art/world_tour.png")}
              alt="World Tour"
              className="h-[3.6rem] w-[5.6rem] shrink-0 sm:h-[4.7rem] sm:w-[7.2rem]"
            />
          </Link>

          {/* Pills centred in the remaining space between logo and right edge */}
          <div className="flex flex-1 items-center justify-center pr-3 sm:pr-4 lg:pr-6">
          <div ref={navRef} className="relative flex items-center gap-2">
            {/* Game Hub pill — always visible so you can return home from any game */}
            <Link
              to="/"
              className={cn(
                "flex items-center gap-1.5 whitespace-nowrap rounded-full border-[3px] border-ink px-3 py-1.5 text-xs font-extrabold transition-transform hover:-translate-y-0.5 sm:px-4 sm:text-sm",
                pathname === "/" ? "text-white" : "text-ink",
              )}
              style={{
                background: pathname === "/" ? "#22C55E" : "#fff",
                borderBottomWidth: 5,
                borderRightWidth: 4,
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

            {/* Panel rendered inside navRef but outside any overflow container — never clipped */}
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

        </div>
      </header>

      {isFullBleed ? (
        <div className="flex min-h-0 flex-1 flex-col">{children}</div>
      ) : (
        <div className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-6xl px-4 pb-12 pt-6 sm:px-6 lg:px-8">{children}</div>
        </div>
      )}
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
        "flex items-center gap-1.5 rounded-full border-[3px] border-ink px-3 py-1.5 text-xs font-extrabold transition-transform hover:-translate-y-0.5 sm:px-4 sm:text-sm",
        activeGame ? "text-white" : "text-ink",
      )}
      style={{
        background: activeGame ? activeGame.accent : "#fff",
        borderBottomWidth: 5,
        borderRightWidth: 4,
      }}
    >
      <span>{category.emoji}</span>
      <span>{category.title}</span>
      <span style={{ fontSize: "0.55rem", opacity: 0.65 }}>▼</span>
    </button>
  );
}
