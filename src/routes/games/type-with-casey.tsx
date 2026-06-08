import { useCallback } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { TypeWithCaseyGame } from '@/game/TypeWithCaseyGame';
import { useBucksContext } from '@/lib/bucks-context';

export const Route = createFileRoute('/games/type-with-casey')({
  head: () => ({
    meta: [
      { title: 'Type with Casey! | Jaime Jangles' },
      { name: 'description', content: 'Learn proper typing technique with Casey! Color-coded keys, finger guides, and home row practice.' },
    ],
  }),
  component: TypeWithCaseyRoute,
});

function TypeWithCaseyRoute() {
  const { earnBuck } = useBucksContext();
  const handleComplete = useCallback(() => earnBuck('type-with-casey'), [earnBuck]);
  return <TypeWithCaseyGame onComplete={handleComplete} />;
}
