import { createFileRoute } from '@tanstack/react-router';
import { MatchGame } from '@/game/MatchGame';

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
  return <MatchGame />;
}
