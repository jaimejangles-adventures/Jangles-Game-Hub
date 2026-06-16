import { createFileRoute } from "@tanstack/react-router";
import { CheckersGame } from "@/game/CheckersGame";

export const Route = createFileRoute("/games/checkers")({
  head: () => ({
    meta: [
      { title: "Checkers | Jaime Jangles" },
      {
        name: "description",
        content: "Jump, capture and crown your kings in this colourful checkers game!",
      },
    ],
  }),
  component: CheckersRoute,
});

function CheckersRoute() {
  return <CheckersGame />;
}
