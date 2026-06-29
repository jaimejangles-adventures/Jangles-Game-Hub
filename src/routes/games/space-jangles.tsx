import { createFileRoute } from "@tanstack/react-router";
import { SpaceJanglesGame } from "@/game/SpaceJanglesGame";
import { ArcadeGate } from "@/components/arcade-gate";

export const Route = createFileRoute("/games/space-jangles")({
  head: () => ({
    meta: [
      { title: "Space Jangles | Jaime Jangles" },
      {
        name: "description",
        content: "Galaxian-style space shooter! Blast the alien formation before their dive-bombing squads take you down.",
      },
    ],
    links: [{ rel: "icon", type: "image/png", href: "/characters/casey-logo.png" }],
  }),
  component: SpaceJanglesRoute,
});

function SpaceJanglesRoute() {
  return (
    <ArcadeGate gameSlug="space-jangles" gameTitle="Space Jangles" gameEmoji="🚀">
      <SpaceJanglesGame />
    </ArcadeGate>
  );
}
