import { createFileRoute } from '@tanstack/react-router';
import { CaseyCanCountGame } from '@/game/CaseyCanCountGame';

export const Route = createFileRoute('/games/casey-can-count')({
  head: () => ({
    meta: [
      { title: 'Casey Can Count! | Jaime Jangles' },
      {
        name: 'description',
        content: 'Tap each object to count it, then pick the right number! A counting game for ages 2–6.',
      },
    ],
    links: [{ rel: 'icon', href: '/characters/casey-logo.png' }],
  }),
  component: CaseyCanCountRoute,
});

function CaseyCanCountRoute() {
  return <CaseyCanCountGame />;
}
