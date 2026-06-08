import { useCallback } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { NameThatCountryGame } from "@/game/NameThatCountryGame";
import { useBucksContext } from "@/lib/bucks-context";

export const Route = createFileRoute("/games/name-that-country")({
  head: () => ({
    meta: [
      { title: "Name That Country! | Jaime Jangles" },
      {
        name: "description",
        content:
          "A pin drops on the world map — can you name the country? Look carefully and pick the right answer!",
      },
    ],
  }),
  component: NameThatCountryRoute,
});

function NameThatCountryRoute() {
  const { earnBuck } = useBucksContext();
  const handleComplete = useCallback(() => earnBuck("name-that-country"), [earnBuck]);
  return <NameThatCountryGame onComplete={handleComplete} />;
}
