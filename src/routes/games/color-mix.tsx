import { useCallback } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { ColorMixGame } from '@/game/ColorMixGame';
import { useBucksContext } from '@/lib/bucks-context';

export const Route = createFileRoute('/games/color-mix')({
  head: () => ({
    meta: [
      { title: 'Colour Mix! | Jaime Jangles' },
      { name: 'description', content: 'Mix colours and learn what they make! A colour theory game for kids.' },
    ],
  }),
  component: ColorMixRoute,
});

function ColorMixRoute() {
  const { earnBuck } = useBucksContext();
  const handleComplete = useCallback(() => earnBuck('color-mix'), [earnBuck]);
  return <ColorMixGame onComplete={handleComplete} />;
}
