import { createFileRoute } from "@tanstack/react-router";
import { JanglesGPGame } from "@/game/JanglesGPGame";
import { ArcadeGate } from "@/components/arcade-gate";

export const Route = createFileRoute("/games/jangles-gp")({
  head: () => ({
    meta: [
      { title: "Jangles GP | Jangles Game Hub" },
      {
        name: "description",
        content: "Race against 5 AI opponents across 3 laps! Steer your F1 car, overtake rivals, and claim the top spot on the GP podium.",
      },
    ],
    links: [{ rel: "icon", type: "image/png", href: "/characters/casey-logo.png" }],
  }),
  component: JanglesGPRoute,
});

function JanglesGPRoute() {
  return (
    <ArcadeGate gameSlug="jangles-gp" gameTitle="Jangles GP" gameEmoji="🏎️">
      <JanglesGPGame />
    </ArcadeGate>
  );
}
