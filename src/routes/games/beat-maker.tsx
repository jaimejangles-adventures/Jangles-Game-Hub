import { createFileRoute } from "@tanstack/react-router";
import { BeatMakerGame } from "@/game/BeatMakerGame";

export const Route = createFileRoute("/games/beat-maker")({
  head: () => ({
    meta: [
      { title: "Beat Maker | Jaime Jangles" },
      {
        name: "description",
        content: "Mix drums, bass, melody, and effects into your own beat — every loop plays in tune no matter which ones you pick!",
      },
    ],
  }),
  component: BeatMakerRoute,
});

function BeatMakerRoute() {
  return <BeatMakerGame />;
}
