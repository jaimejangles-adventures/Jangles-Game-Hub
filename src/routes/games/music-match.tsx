import { createFileRoute } from "@tanstack/react-router";
import { JanglesGame } from "@/game/JanglesGame";

export const Route = createFileRoute("/games/music-match")({
  head: () => ({
    meta: [
      { title: "Music Match | Jaime Jangles" },
      {
        name: "description",
        content: "Listen to a music clip from around the world and match it to the right country.",
      },
    ],
  }),
  component: MusicMatchRoute,
});

function MusicMatchRoute() {
  return <JanglesGame />;
}