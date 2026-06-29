import { createFileRoute } from "@tanstack/react-router";
import { FoxerGame } from "@/game/FoxerGame";
import { ArcadeGate } from "@/components/arcade-gate";

export const Route = createFileRoute("/games/foxer")({
  head: () => ({
    meta: [
      { title: "Foxer | Jaime Jangles" },
      {
        name: "description",
        content: "Help Foxy the fox cross dangerous roads through 5 countries in this Frogger-style arcade game!",
      },
    ],
    links: [
      { rel: "icon", type: "image/png", href: "/characters/FOX 3.png" },
    ],
  }),
  component: FoxerRoute,
});

function FoxerRoute() {
  return (
    <ArcadeGate gameSlug="foxer" gameTitle="Foxer" gameEmoji="🦊">
      <FoxerGame />
    </ArcadeGate>
  );
}
