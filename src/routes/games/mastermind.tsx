import { createFileRoute } from '@tanstack/react-router';
import { MastermindGame } from '@/game/MastermindGame';

export const Route = createFileRoute('/games/mastermind')({
  head: () => ({
    meta: [
      { title: 'Crack the Code! | Jaime Jangles' },
      {
        name: 'description',
        content: 'Pick 4 Jangles objects and crack the secret code! A Mastermind-style puzzle game for kids.',
      },
    ],
  }),
  component: MastermindRoute,
});

function MastermindRoute() {
  return <MastermindGame />;
}
