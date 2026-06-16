import { createFileRoute } from "@tanstack/react-router";
import { JangLangGame } from "@/game/JangLangGame";

export const Route = createFileRoute("/games/jang-lang")({
  head: () => ({
    meta: [
      { title: "Jang-Lang | Jaime Jangles" },
      { name: "description", content: "Learn simple words and sayings in Spanish, Portuguese, Italian, and French!" },
    ],
    links: [{ rel: "icon", href: "/characters/casey-logo.png" }],
  }),
  component: JangLangRoute,
});

function JangLangRoute() {
  return <JangLangGame />;
}
