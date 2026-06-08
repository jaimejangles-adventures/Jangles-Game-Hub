import { useCallback } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { FoxyWordScrambleGame } from '@/game/FoxyWordScrambleGame';
import { useBucksContext } from '@/lib/bucks-context';

export const Route = createFileRoute('/games/foxy-word-scramble')({
  head: () => ({
    meta: [
      { title: "Foxy's Word Scramble! | Jaime Jangles" },
      { name: 'description', content: 'Unscramble the letters to spell the word! A word puzzle for ages 5–8.' },
    ],
    links: [{ rel: 'icon', href: '/characters/FOX 3.png' }],
  }),
  component: FoxyWordScrambleRoute,
});

function FoxyWordScrambleRoute() {
  const { earnBuck } = useBucksContext();
  const handleComplete = useCallback(() => earnBuck('foxy-word-scramble'), [earnBuck]);
  return <FoxyWordScrambleGame onComplete={handleComplete} />;
}
