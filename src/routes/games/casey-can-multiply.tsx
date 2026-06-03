import { createFileRoute } from '@tanstack/react-router';
import { CaseyCanMultiplyGame } from '@/game/CaseyCanMultiplyGame';

export const Route = createFileRoute('/games/casey-can-multiply')({
  head: () => ({
    meta: [
      { title: 'Casey Can Multiply! | Jaime Jangles' },
      {
        name: 'description',
        content: 'Learn multiplication with Casey! See two groups of objects, count them all, and pick the right product. A math game for ages 5–8.',
      },
    ],
    links: [{ rel: 'icon', href: '/characters/casey-logo.png' }],
  }),
  component: CaseyCanMultiplyRoute,
});

function CaseyCanMultiplyRoute() {
  return <CaseyCanMultiplyGame />;
}
