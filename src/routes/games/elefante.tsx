import { createFileRoute } from "@tanstack/react-router";
import { ElefanteGame } from "@/game/ElefanteGame";

export const Route = createFileRoute("/games/elefante")({
  head: () => ({
    meta: [
      { title: "Elefante: Air Fante World Tour" },
      { name: "description", content: "Fly Elefante through the skies and dodge obstacles on a world music tour!" },
    ],
    links: [
      { rel: "icon", type: "image/png", href: "/characters/air-fante.png" },
    ],
  }),
  component: ElefanteGame,
});
