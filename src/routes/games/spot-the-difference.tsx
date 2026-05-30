import { createFileRoute } from "@tanstack/react-router";
import { SpotTheDifferenceGame } from "@/game/SpotTheDifferenceGame";

export const Route = createFileRoute("/games/spot-the-difference")({
  head: () => ({
    meta: [
      { title: "Spot the Difference | Jaime Jangles" },
      {
        name: "description",
        content: "Two pictures side by side — can you find all the differences?",
      },
    ],
  }),
  component: SpotTheDifferenceRoute,
});

function SpotTheDifferenceRoute() {
  return <SpotTheDifferenceGame />;
}
