import { createFileRoute } from "@tanstack/react-router";
import { FoxerGame } from "@/game/FoxerGame";

export const Route = createFileRoute("/games/foxer")({
  head: () => ({
    meta: [
      { title: "FOXER | Jaime Jangles" },
      {
        name: "description",
        content: "Help Foxy the fox cross dangerous roads through 5 countries in this Frogger-style arcade game!",
      },
    ],
    links: [
      { rel: "icon", type: "image/png", href: "/characters/FOX 3.png" },
    ],
  }),
  component: FoxerRoute,
});

function FoxerRoute() {
  return <FoxerGame />;
}
