import { createFileRoute } from '@tanstack/react-router';
import { CaseyGalleryPage } from '@/game/CaseyGalleryPage';

export const Route = createFileRoute('/casey-gallery')({
  head: () => ({
    meta: [
      { title: "Best Of Casey's Gallery | Jaime Jangles" },
      {
        name: 'description',
        content: 'Amazing drawings by kids from around the world in Draw with Casey!',
      },
    ],
    links: [{ rel: 'icon', href: '/characters/FOX 3.png' }],
  }),
  component: CaseyGalleryPage,
});
