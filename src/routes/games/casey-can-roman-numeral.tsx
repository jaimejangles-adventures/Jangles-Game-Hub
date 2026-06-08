import { useCallback } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { CaseyCanRomanNumeralGame } from '@/game/CaseyCanRomanNumeralGame';
import { useBucksContext } from '@/lib/bucks-context';

export const Route = createFileRoute('/games/casey-can-roman-numeral')({
  head: () => ({
    meta: [
      { title: 'Casey Can Roman Numeral! | Jaime Jangles' },
      {
        name: 'description',
        content: 'Learn and practice Roman numerals with Casey! Covers grades 3–5 with teach and quiz modes.',
      },
    ],
    links: [{ rel: 'icon', href: '/characters/casey-logo.png' }],
  }),
  component: CaseyCanRomanNumeralRoute,
});

function CaseyCanRomanNumeralRoute() {
  const { earnBuck } = useBucksContext();
  const handleComplete = useCallback(() => earnBuck('casey-can-roman-numeral'), [earnBuck]);
  return <CaseyCanRomanNumeralGame onComplete={handleComplete} />;
}
