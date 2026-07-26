import { useCallback } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { MelodyMemoryGame } from '@/game/MelodyMemoryGame';
import { useBucksContext } from '@/lib/bucks-context';

export const Route = createFileRoute('/games/melody-memory')({
  head: () => ({
    meta: [
      { title: 'Melody Memory | Jaime Jangles' },
      {
        name: 'description',
        content: 'Watch Casey play a tune on the xylophone or piano roll, then repeat it back — a Simon-style music memory game for kids with Rookie and Master difficulty levels.',
      },
    ],
  }),
  component: MelodyMemoryRoute,
});

function MelodyMemoryRoute() {
  const { earnBuck } = useBucksContext();
  const handleComplete = useCallback(() => earnBuck('melody-memory'), [earnBuck]);
  return <MelodyMemoryGame onComplete={handleComplete} />;
}
