import { createFileRoute } from "@tanstack/react-router";
import { AirFanteAlphabetGame } from "@/game/AirFanteAlphabetGame";
import { ArcadeGate } from "@/components/arcade-gate";

export const Route = createFileRoute("/games/air-fante-alphabet")({
  head: () => ({
    meta: [
      { title: "Air Fante Alphabet" },
      { name: "description", content: "Read each plane's call sign over the radio like a real pilot — Alpha, Bravo, Charlie!" },
    ],
    links: [
      { rel: "icon", type: "image/png", href: "/characters/air-fante.png" },
    ],
  }),
  component: AirFanteAlphabetRoute,
});

function AirFanteAlphabetRoute() {
  return (
    <ArcadeGate gameSlug="air-fante-alphabet" gameTitle="Air Fante Alphabet" gameEmoji="📻">
      <AirFanteAlphabetGame />
    </ArcadeGate>
  );
}
