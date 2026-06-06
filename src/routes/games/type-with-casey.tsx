import { createFileRoute } from '@tanstack/react-router';
import { TypeWithCaseyGame } from '@/game/TypeWithCaseyGame';

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
  return <TypeWithCaseyGame />;
}
