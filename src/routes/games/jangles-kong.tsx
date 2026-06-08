import { createFileRoute } from "@tanstack/react-router";
import { JanglesKongGame } from "@/game/JanglesKongGame";
import { ArcadeGate } from "@/components/arcade-gate";

export const Route = createFileRoute("/games/jangles-kong")({
  head: () => ({
    meta: [
      { title: "Jangles Kong | Jaime Jangles" },
      {
        name: "description",
        content: "Donkey Kong-style arcade platformer! Play as Casey, dodge Pac-Ghosts thrown by Jeff, and climb to the top!",
      },
    ],
    links: [{ rel: "icon", type: "image/png", href: "/characters/casey-logo.png" }],
  }),
  component: JanglesKongRoute,
});

function JanglesKongRoute() {
  return (
    <ArcadeGate gameSlug="jangles-kong" gameTitle="Jangles Kong" gameEmoji="🦍">
      <JanglesKongGame />
    </ArcadeGate>
  );
}
