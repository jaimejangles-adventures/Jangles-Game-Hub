import { useCallback } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { WorldChaseGame } from "@/game/WorldChaseGame";
import { useBucksContext } from "@/lib/bucks-context";

export const Route = createFileRoute("/games/world-adventure")({
  head: () => ({
    meta: [
      { title: "Find Jaime & Jeff | Jaime Jangles" },
      {
        name: "description",
        content:
          "Jaime and Jeff are zigzagging the globe! Follow their clues across continents, pick the next city on the map, and track them down before they get too far ahead.",
      },
    ],
  }),
  component: WorldAdventureRoute,
});

function WorldAdventureRoute() {
  const { earnBuck } = useBucksContext();
  const handleComplete = useCallback(() => earnBuck("world-adventure"), [earnBuck]);
  return <WorldChaseGame onComplete={handleComplete} />;
}
