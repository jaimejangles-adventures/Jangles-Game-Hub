import { V as jsxRuntimeExports } from "./server-HtPeGmJD.js";
import { G as GAME_MANIFEST, L as Link } from "./router-hEVGKduz.js";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
function Index() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("main", { className: "mx-auto w-full max-w-6xl px-4 pt-4 pb-3 sm:px-6 lg:px-8", style: {
    flex: "1 1 0",
    minHeight: 0,
    display: "grid",
    gridTemplateRows: "auto 1fr",
    gap: "0.75rem"
  }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "grid gap-3 lg:grid-cols-[1.2fr_0.8fr]", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-[2rem] border-[3px] border-ink p-5", style: {
        background: "#fff",
        borderBottomWidth: 6,
        borderRightWidth: 5
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-2 inline-flex rounded-full border-[3px] border-ink px-3 py-1 text-xs uppercase tracking-[0.3em]", style: {
          background: "#FBBF24",
          borderBottomWidth: 5,
          borderRightWidth: 4
        }, children: "Jangles Game Hub" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "max-w-xl text-2xl leading-tight sm:text-3xl", children: "Your world tour starts here — pick a game and jump in!" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 max-w-2xl text-sm text-ink/75", children: "Music, mysteries, and map adventures with Jaime & Jeff. Choose a game below and start exploring the world!" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("aside", { className: "flex items-center gap-4 overflow-hidden rounded-[2rem] border-[3px] border-ink", style: {
        background: "#FFF0F8",
        borderBottomWidth: 6,
        borderRightWidth: 5
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: "/characters/guitar-jaime-jeff.png", alt: "Jaime and Jeff playing music", className: "h-full w-auto max-w-[45%] self-end object-contain" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 py-5 pr-5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-2 inline-flex rounded-full border-[3px] border-ink px-3 py-1 text-xs uppercase tracking-[0.3em]", style: {
            background: "#FF4EAB",
            borderBottomWidth: 4,
            borderRightWidth: 3
          }, children: "Meet the crew" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-ink/80 leading-relaxed", children: "Jaime and Jeff travel the world making music, chasing adventure, and discovering amazing places — and they want you to come along!" })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "grid items-start gap-3 lg:grid-cols-4", style: {
      minHeight: 0
    }, children: GAME_MANIFEST.map((game) => /* @__PURE__ */ jsxRuntimeExports.jsxs("article", { className: "flex flex-col overflow-hidden rounded-[1.75rem] border-[3px] border-ink", style: {
      background: "#fff",
      borderBottomWidth: 6,
      borderRightWidth: 5
    }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center overflow-hidden rounded-t-[1.5rem] px-4 py-3", style: {
        background: game.accent + "33",
        height: "7rem"
      }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: game.image, alt: game.title, className: "h-24 w-auto object-contain", style: {
        maxWidth: "100%",
        mixBlendMode: "multiply",
        ...game.slug === "world-adventure" && {
          maskImage: "linear-gradient(to right, transparent 0%, black 22%)",
          WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 22%)"
        }
      } }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-1 flex-col p-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs uppercase tracking-[0.25em] text-ink/55", children: game.eyebrow }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mt-0.5 text-lg font-extrabold leading-tight", children: game.title }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1.5 text-xs text-ink/75 leading-relaxed", children: game.description }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2 flex justify-end", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: game.href, className: "rounded-full border-[3px] border-ink px-4 py-1 text-sm font-extrabold", style: {
          background: game.accent,
          borderBottomWidth: 5,
          borderRightWidth: 4
        }, children: "Play" }) })
      ] })
    ] }, game.slug)) })
  ] });
}
export {
  Index as component
};
