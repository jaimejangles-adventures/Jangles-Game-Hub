import { createFileRoute } from "@tanstack/react-router";
import { FindFoxyGame } from "@/game/FindFoxyGame";

export const Route = createFileRoute("/games/find-foxy")({
  head: () => ({
    meta: [
      { title: "Find Foxy | Jaime Jangles" },
      {
        name: "description",
        content: "Casey sends clues from around the world while you chase Foxy and collect passport stamps.",
      },
    ],
    links: [
      { rel: "icon", type: "image/png", href: "/characters/FOX 3.png" },
    ],
  }),
  component: FindFoxyRoute,
});

function FindFoxyRoute() {
  return <FindFoxyGame />;
}