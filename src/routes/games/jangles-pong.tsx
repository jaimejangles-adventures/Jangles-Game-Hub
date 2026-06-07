import { createFileRoute } from "@tanstack/react-router";
import { JanglesPongGame } from "@/game/JanglesPongGame";

export const Route = createFileRoute("/games/jangles-pong")({
  head: () => ({
    meta: [
      { title: "Jangles Pong | Jaime Jangles" },
      {
        name: "description",
        content: "Classic arcade Pong — you vs the CPU! First to 7 wins. Use arrow keys or drag to move your paddle.",
      },
    ],
    links: [{ rel: "icon", type: "image/png", href: "/characters/casey-logo.png" }],
  }),
  component: JanglesPongRoute,
});

function JanglesPongRoute() {
  return <JanglesPongGame />;
}
