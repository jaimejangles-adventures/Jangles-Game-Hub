import { createFileRoute } from "@tanstack/react-router";
import { PacmanGame } from "@/game/PacmanGame";
import { ArcadeGate } from "@/components/arcade-gate";

export const Route = createFileRoute("/games/pacman")({
  head: () => ({
    meta: [
      { title: "Jangles Pac | Jaime Jangles" },
      {
        name: "description",
        content: "Pacman-style adventure through 20 countries! Pick Casey, Jaime, Jeff or Fante and eat flags for power-ups!",
      },
    ],
    links: [{ rel: "icon", type: "image/png", href: "/characters/casey-logo.png" }],
  }),
  component: PacmanRoute,
});

function PacmanRoute() {
  return (
    <ArcadeGate gameSlug="pacman" gameTitle="Jangles Pac" gameEmoji="👾">
      <PacmanGame />
    </ArcadeGate>
  );
}
