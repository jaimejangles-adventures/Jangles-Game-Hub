import { createFileRoute } from "@tanstack/react-router";
import { RhythmTapGame } from "@/game/RhythmTapGame";
import { ArcadeGate } from "@/components/arcade-gate";

export const Route = createFileRoute("/games/rhythm-tap")({
  head: () => ({
    meta: [
      { title: "Rhythm Tap! | Jaime Jangles" },
      {
        name: "description",
        content:
          "Pick a country's song from the Jangles world tour and tap the lanes in time with the beat! A rhythm-tapping game across 20 countries.",
      },
    ],
    links: [{ rel: "icon", type: "image/png", href: "/characters/casey-logo.png" }],
  }),
  component: RhythmTapRoute,
});

function RhythmTapRoute() {
  return (
    <ArcadeGate gameSlug="rhythm-tap" gameTitle="Rhythm Tap!" gameEmoji="🥁">
      <RhythmTapGame />
    </ArcadeGate>
  );
}
