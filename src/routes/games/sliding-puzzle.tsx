import { useCallback } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { SlidingPuzzleGame } from '@/game/SlidingPuzzleGame';
import { useBucksContext } from '@/lib/bucks-context';

export const Route = createFileRoute('/games/sliding-puzzle')({
  head: () => ({
    meta: [
      { title: 'Fix the Pic! | Jaime Jangles' },
      {
        name: 'description',
        content: 'Slide the pieces to put the picture back together! A fun sliding puzzle game for kids.',
      },
    ],
  }),
  component: SlidingPuzzleRoute,
});

function SlidingPuzzleRoute() {
  const { earnBuck } = useBucksContext();
  const handleComplete = useCallback(() => earnBuck('sliding-puzzle'), [earnBuck]);
  return <SlidingPuzzleGame onComplete={handleComplete} />;
}
