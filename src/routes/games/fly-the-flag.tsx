import { useCallback } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { FlyTheFlagGame } from "@/game/FlyTheFlagGame";
import { useBucksContext } from "@/lib/bucks-context";

export const Route = createFileRoute("/games/fly-the-flag")({
  head: () => ({
    meta: [
      { title: "Fly the Flag! | Jaime Jangles" },
      {
        name: "description",
        content:
          "Spot the country on the map, name its flag, and learn the capital, population, and independence day — then celebrate with Jaime and the country's music!",
      },
    ],
  }),
  component: FlyTheFlagRoute,
});

function FlyTheFlagRoute() {
  const { earnBuck } = useBucksContext();
  const handleComplete = useCallback(() => earnBuck("fly-the-flag"), [earnBuck]);
  return <FlyTheFlagGame onComplete={handleComplete} />;
}
