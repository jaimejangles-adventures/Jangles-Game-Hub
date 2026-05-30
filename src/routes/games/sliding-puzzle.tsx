import { createFileRoute } from '@tanstack/react-router';
import { SlidingPuzzleGame } from '@/game/SlidingPuzzleGame';

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
  return <SlidingPuzzleGame />;
}
