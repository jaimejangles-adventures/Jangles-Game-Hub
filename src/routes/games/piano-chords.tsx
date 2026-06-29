import { createFileRoute } from "@tanstack/react-router";
import { PianoChordGame } from "@/game/PianoChordGame";

export const Route = createFileRoute("/games/piano-chords")({
  head: () => ({
    meta: [
      { title: "Chord Explorer | Jaime Jangles" },
      {
        name: "description",
        content: "Explore piano chords — major, minor, 7ths, and more — in all three inversions.",
      },
    ],
  }),
  component: PianoChordRoute,
});

function PianoChordRoute() {
  return <PianoChordGame />;
}
