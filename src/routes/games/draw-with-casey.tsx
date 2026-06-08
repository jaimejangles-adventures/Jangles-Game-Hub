import { useCallback } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { DrawWithCaseyGame } from '@/game/DrawWithCaseyGame';
import { useBucksContext } from '@/lib/bucks-context';

export const Route = createFileRoute('/games/draw-with-casey')({
  head: () => ({
    meta: [
      { title: 'Draw with Casey! | Jaime Jangles' },
      {
        name: 'description',
        content:
          'Casey Bea gives you a word and you draw it on the chalkboard! Claude judges your drawing and hands out sticker stamps.',
      },
    ],
    links: [{ rel: 'icon', href: '/characters/FOX 3.png' }],
  }),
  component: DrawWithCaseyRoute,
});

function DrawWithCaseyRoute() {
  const { earnBuck } = useBucksContext();
  const handleComplete = useCallback(() => earnBuck('draw-with-casey'), [earnBuck]);
  return <DrawWithCaseyGame onComplete={handleComplete} />;
}
