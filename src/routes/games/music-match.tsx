import { useCallback, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { JanglesGame } from "@/game/JanglesGame";
import { useBucksContext } from "@/lib/bucks-context";

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
  const { earnBuck } = useBucksContext();
  const handleComplete = useCallback(() => earnBuck("music-match"), [earnBuck]);
  useEffect(() => { sessionStorage.setItem('jj-last-game', 'music-match'); }, []);
  return <JanglesGame onComplete={handleComplete} />;
}
