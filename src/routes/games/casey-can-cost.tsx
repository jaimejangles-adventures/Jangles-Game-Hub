import { useCallback } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { CaseyCanCostGame } from '@/game/CaseyCanCostGame';
import { useBucksContext } from '@/lib/bucks-context';

export const Route = createFileRoute('/games/casey-can-cost')({
  head: () => ({
    meta: [
      { title: 'Casey Can Cost! | Jaime Jangles' },
      {
        name: 'description',
        content: 'Add and subtract with money to buy objects from Casey\'s shop! A currency math game for ages 5–8.',
      },
    ],
    links: [{ rel: 'icon', href: '/characters/casey-logo.png' }],
  }),
  component: CaseyCanCostRoute,
});

function CaseyCanCostRoute() {
  const { earnBuck } = useBucksContext();
  const handleComplete = useCallback(() => earnBuck('casey-can-cost'), [earnBuck]);
  return <CaseyCanCostGame onComplete={handleComplete} />;
}
