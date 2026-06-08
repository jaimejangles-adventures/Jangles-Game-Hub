import { useCallback } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { CaseyCanSubtractGame } from '@/game/CaseyCanSubtractGame';
import { useBucksContext } from '@/lib/bucks-context';

export const Route = createFileRoute('/games/casey-can-subtract')({
  head: () => ({
    meta: [
      { title: 'Casey Can Subtract! | Jaime Jangles' },
      {
        name: 'description',
        content: 'Learn subtraction with Casey! See objects, take some away, and pick the right answer. A math game for ages 4–7.',
      },
    ],
    links: [{ rel: 'icon', href: '/characters/casey-logo.png' }],
  }),
  component: CaseyCanSubtractRoute,
});

function CaseyCanSubtractRoute() {
  const { earnBuck } = useBucksContext();
  const handleComplete = useCallback(() => earnBuck('casey-can-subtract'), [earnBuck]);
  return <CaseyCanSubtractGame onComplete={handleComplete} />;
}
