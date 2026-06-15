import { useCallback } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { CaseyCanPayGame } from '@/game/CaseyCanPayGame';
import { useBucksContext } from '@/lib/bucks-context';

export const Route = createFileRoute('/games/casey-can-pay')({
  head: () => ({
    meta: [
      { title: 'Casey Can Pay! | Jaime Jangles' },
      {
        name: 'description',
        content: 'Add and subtract with money to buy objects from Casey\'s shop! A currency math game for ages 5–8.',
      },
    ],
    links: [{ rel: 'icon', href: '/characters/casey-logo.png' }],
  }),
  component: CaseyCanPayRoute,
});

function CaseyCanPayRoute() {
  const { earnBuck } = useBucksContext();
  const handleComplete = useCallback(() => earnBuck('casey-can-pay'), [earnBuck]);
  return <CaseyCanPayGame onComplete={handleComplete} />;
}
