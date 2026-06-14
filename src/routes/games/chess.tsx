import { createFileRoute } from "@tanstack/react-router";
import { ChessGame } from "@/game/ChessGame";

export const Route = createFileRoute("/games/chess")({
  head: () => ({
    meta: [
      { title: "Chess | Jaime Jangles" },
      {
        name: "description",
        content: "Learn chess with interactive lessons, then play against the computer!",
      },
    ],
  }),
  component: ChessRoute,
});

function ChessRoute() {
  return <ChessGame />;
}
