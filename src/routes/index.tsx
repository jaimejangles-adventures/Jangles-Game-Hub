import { createFileRoute, Link } from "@tanstack/react-router";
import { GAME_MANIFEST, CATEGORY_MANIFEST } from "@/lib/game-manifest";

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

function Index() {
  return (
    <div className="flex flex-col gap-5">

      {/* ── Hero + Character asides ── */}
      <section className="grid gap-3 lg:grid-cols-[1.35fr_0.65fr]">

        {/* Hero card */}
        <div
          className="flex flex-col justify-center rounded-[2rem] border-[3px] border-ink px-5 py-4"
          style={{ background: "#fff", borderBottomWidth: 6, borderRightWidth: 5 }}
        >
          <div
            className="mb-2 inline-flex w-fit whitespace-nowrap rounded-full border-[3px] border-ink px-3 py-0.5 text-xs font-extrabold uppercase tracking-[0.3em]"
            style={{ background: "#FBBF24", borderBottomWidth: 5, borderRightWidth: 4 }}
          >
            Jangles Game Hub
          </div>
          <h1 className="text-xl font-extrabold leading-tight sm:text-2xl lg:text-[1.6rem]">
            Your world tour starts here —<br /> pick a game and jump in!
          </h1>
          <p className="mt-1.5 max-w-lg text-xs text-ink/65 leading-relaxed sm:text-sm">
            Music, mysteries, and map adventures with Jaime &amp; Jeff. Choose a game below and start exploring the world!
          </p>
        </div>

        {/* Character asides */}
        <div className="flex flex-col gap-2.5">
          <aside
            className="flex flex-1 items-center gap-3 overflow-hidden rounded-[2rem] border-[3px] border-ink"
            style={{ background: "#FFF0F8", borderBottomWidth: 5, borderRightWidth: 4 }}
          >
            <img
              src="/characters/guitar-jaime-jeff.png"
              alt="Jaime and Jeff"
              className="h-full w-auto max-w-[38%] self-end object-contain"
            />
            <div className="flex-1 py-3 pr-4">
              <div
                className="mb-1 inline-flex rounded-full border-[2px] border-ink px-2.5 py-0.5 text-[0.6rem] font-extrabold uppercase tracking-[0.25em]"
                style={{ background: "#FF4EAB", borderBottomWidth: 3, borderRightWidth: 2, color: "#fff" }}
              >
                Meet the crew
              </div>
              <p className="text-xs text-ink/80 leading-relaxed">
                Jaime and Jeff travel the world making music, chasing adventure, and discovering amazing places!
              </p>
            </div>
          </aside>

          <aside
            className="flex flex-1 items-center gap-3 overflow-hidden rounded-[2rem] border-[3px] border-ink"
            style={{ background: "#F0F8FF", borderBottomWidth: 5, borderRightWidth: 4 }}
          >
            <img
              src="/characters/map-casey.png"
              alt="Casey Bea"
              className="h-full w-auto max-w-[38%] self-end object-contain"
              style={{ mixBlendMode: "multiply" }}
            />
            <div className="flex-1 py-3 pr-4">
              <div
                className="mb-1 inline-flex rounded-full border-[2px] border-ink px-2.5 py-0.5 text-[0.6rem] font-extrabold uppercase tracking-[0.25em]"
                style={{ background: "#60C8FF", borderBottomWidth: 3, borderRightWidth: 2 }}
              >
                The mastermind
              </div>
              <p className="text-xs text-ink/80 leading-relaxed">
                Casey Bea sends Jaime and Jeff on every adventure — and always makes sure Fante comes along!
              </p>
            </div>
          </aside>
        </div>
      </section>

      {/* ── Games organized by category columns ── */}
      <section className="grid gap-6 lg:grid-cols-3 sm:grid-cols-1">
        {CATEGORY_MANIFEST.map((category) => {
          const games = GAME_MANIFEST.filter((g) => g.category === category.slug);
          return (
            <div key={category.slug} className="flex flex-col gap-3">

              {/* Category header */}
              <div className="flex items-center gap-2.5">
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
                <span className="text-[0.6rem] text-ink/45 font-medium leading-tight">
                  {category.eyebrow}
                </span>
              </div>

              {/* Game cards stacked in this column */}
              {games.map((game) => (
                <Link
                  key={game.slug}
                  to={game.href}
                  className="group flex flex-col overflow-hidden rounded-[1.75rem] border-[3px] border-ink transition-transform hover:-translate-y-0.5"
                  style={{
                    background: "#fff",
                    borderBottomWidth: 6,
                    borderRightWidth: 5,
                    textDecoration: "none",
                  }}
                >
                  {/* Image banner */}
                  <div
                    className="flex shrink-0 items-center justify-center overflow-hidden rounded-t-[1.5rem]"
                    style={{
                      background: game.accent + "33",
                      height: "5.5rem",
                      padding: game.slug === "fly-the-flag" ? 0 : "0 0.75rem",
                    }}
                  >
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
                  </div>

                  {/* Content */}
                  <div className="flex flex-1 flex-col px-3 pt-2 pb-3">
                    <div className="text-[0.6rem] uppercase tracking-[0.25em] text-ink/50 font-bold">
                      {game.eyebrow}
                    </div>
                    <h2 className="mt-0.5 text-sm font-extrabold leading-tight">{game.title}</h2>
                    <p className="mt-1 flex-1 text-[0.7rem] text-ink/65 leading-relaxed line-clamp-2">
                      {game.description}
                    </p>
                    <div className="mt-2 flex justify-center">
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
              ))}
            </div>
          );
        })}
      </section>

    </div>
  );
}
