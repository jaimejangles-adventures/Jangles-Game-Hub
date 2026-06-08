import { useCallback } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { CaseyCanSpellGame } from '@/game/CaseyCanSpellGame';
import { useBucksContext } from '@/lib/bucks-context';

export const Route = createFileRoute('/games/casey-can-spell')({
  head: () => ({
    meta: [
      { title: 'Casey Can Spell! | Jaime Jangles' },
      { name: 'description', content: 'Tap the right letters to spell the word! A spelling game for ages 4–7.' },
    ],
    links: [{ rel: 'icon', href: '/characters/casey-logo.png' }],
  }),
  component: CaseyCanSpellRoute,
});

function CaseyCanSpellRoute() {
  const { earnBuck } = useBucksContext();
  const handleComplete = useCallback(() => earnBuck('casey-can-spell'), [earnBuck]);
  return <CaseyCanSpellGame onComplete={handleComplete} />;
}
