import { createFileRoute } from '@tanstack/react-router';
import { PhotoLabGame } from '@/game/PhotoLabGame';

export const Route = createFileRoute('/games/photo-lab')({
  head: () => ({
    meta: [
      { title: 'Zany Foto Lab | Jaime Jangles' },
      {
        name: 'description',
        content: 'Upload a photo or pick a Jangles character, then get zany with filters, stickers, doodles, meme text, frames and more.',
      },
    ],
  }),
  component: PhotoLabRoute,
});

function PhotoLabRoute() {
  return <PhotoLabGame />;
}
