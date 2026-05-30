import { createFileRoute } from '@tanstack/react-router';
import { CaseyCanAddGame } from '@/game/CaseyCanAddGame';

export const Route = createFileRoute('/games/count-with-jaime')({
  head: () => ({
    meta: [
      { title: 'Casey Can Add! | Jaime Jangles' },
      {
        name: 'description',
        content: 'Learn addition with Casey! See objects, add them up, and pick the right number. A math game for ages 4–7.',
      },
    ],
    links: [{ rel: 'icon', href: '/characters/casey-logo.png' }],
  }),
  component: CaseyCanAddRoute,
});

function CaseyCanAddRoute() {
  return <CaseyCanAddGame />;
}
