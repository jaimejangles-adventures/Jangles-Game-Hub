// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, cloudflare (build-only),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... } }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

// When deploying to GitHub Pages via GitHub Actions, prerender all routes as static HTML.
// Locally and on Cloudflare, use normal SSR with the server entry.
const isGitHubPages = process.env.GITHUB_ACTIONS === "true";

export default defineConfig({
  ...(isGitHubPages && {
    vite: {
      base: "/Jangles-Game-Hub/",
    },
  }),
  tanstackStart: {
    server: { entry: "server" },
    ...(isGitHubPages && {
      prerender: {
        enabled: true,
        crawlLinks: true,
        autoSubfolderIndex: true,
      },
    }),
  },
});
