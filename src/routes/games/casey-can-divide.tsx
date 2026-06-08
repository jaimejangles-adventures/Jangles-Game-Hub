import { useCallback } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { CaseyCanDivideGame } from '@/game/CaseyCanDivideGame';
import { useBucksContext } from '@/lib/bucks-context';

export const Route = createFileRoute('/games/casey-can-divide')({
  head: () => ({
    meta: [
      { title: 'Casey Can Divide! | Jaime Jangles' },
      {
        name: 'description',
        content: 'Learn division with Casey! Count the objects, split them into equal groups, and pick the right answer. A math game for ages 5–8.',
      },
    ],
    links: [{ rel: 'icon', href: '/characters/casey-logo.png' }],
  }),
  component: CaseyCanDivideRoute,
});

function CaseyCanDivideRoute() {
  const { earnBuck } = useBucksContext();
  const handleComplete = useCallback(() => earnBuck('casey-can-divide'), [earnBuck]);
  return <CaseyCanDivideGame onComplete={handleComplete} />;
}
