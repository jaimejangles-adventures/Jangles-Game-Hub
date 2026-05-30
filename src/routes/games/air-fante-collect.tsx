import { createFileRoute } from "@tanstack/react-router";
import { AirFanteCollectGame } from "@/game/AirFanteCollectGame";

export const Route = createFileRoute("/games/air-fante-collect")({
  head: () => ({
    meta: [
      { title: "Air Fante Collect!" },
      { name: "description", content: "Collect stars to fly Air Fante from country to country on a world tour!" },
    ],
    links: [
      { rel: "icon", type: "image/png", href: "/characters/air-fante.png" },
    ],
  }),
  component: AirFanteCollectGame,
});
