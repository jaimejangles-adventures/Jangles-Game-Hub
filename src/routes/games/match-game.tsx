import { useCallback, useEffect } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { MatchGame } from '@/game/MatchGame';
import { useBucksContext } from '@/lib/bucks-context';

export const Route = createFileRoute('/games/match-game')({
  head: () => ({
    meta: [
      { title: 'Match Mania! | Jaime Jangles' },
      {
        name: 'description',
        content: 'Flip cards to find matching pairs of Jangles objects! Rookie 4×4 or Master 10×10.',
      },
    ],
  }),
  component: MatchGameRoute,
});

function MatchGameRoute() {
  const { earnBuck } = useBucksContext();
  const handleComplete = useCallback(() => earnBuck('match-game'), [earnBuck]);
  useEffect(() => { sessionStorage.setItem('jj-last-game', 'match-game'); }, []);
  return <MatchGame onComplete={handleComplete} />;
}
