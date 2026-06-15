import { createFileRoute } from "@tanstack/react-router";
import { RacerGame } from "@/game/RacerGame";
import { ArcadeGate } from "@/components/arcade-gate";

export const Route = createFileRoute("/games/racer")({
  head: () => ({
    meta: [
      { title: "Jangles Racer | Jangles Game Hub" },
      {
        name: "description",
        content: "8-bit arcade racer! Collect checkered flags, dodge oncoming cars, and race through 3 lives across book-page worlds.",
      },
    ],
    links: [{ rel: "icon", type: "image/png", href: "/characters/casey-logo.png" }],
  }),
  component: RacerRoute,
});

function RacerRoute() {
  return (
    <ArcadeGate gameSlug="racer" gameTitle="Jangles Racer" gameEmoji="🏎️">
      <RacerGame />
    </ArcadeGate>
  );
}
