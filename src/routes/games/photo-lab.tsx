import { createFileRoute } from '@tanstack/react-router';
import { PhotoLabGame } from '@/game/PhotoLabGame';

export const Route = createFileRoute('/games/photo-lab')({
  head: () => ({
    meta: [
      { title: 'Photo Lab | Jaime Jangles' },
      {
        name: 'description',
        content: 'Upload a photo or pick a Jangles character, then add filters and simple editing tools to make it your own.',
      },
    ],
  }),
  component: PhotoLabRoute,
});

function PhotoLabRoute() {
  return <PhotoLabGame />;
}
