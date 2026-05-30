import { createFileRoute } from "@tanstack/react-router";
import { JanglesBallGame } from "@/game/JanglesBallGame";

export const Route = createFileRoute("/games/jangles-ball")({
  head: () => ({
    meta: [
      { title: "Jangles Ball | Jaime Jangles" },
      {
        name: "description",
        content: "A bold retro Breakout-style arcade game with 5 levels, 3 brick types, and neon palettes!",
      },
    ],
    links: [{ rel: "icon", type: "image/png", href: "/characters/casey-logo.png" }],
  }),
  component: JanglesBallRoute,
});

function JanglesBallRoute() {
  return <JanglesBallGame />;
}
