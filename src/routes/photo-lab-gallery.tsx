import { createFileRoute } from '@tanstack/react-router';
import { PhotoLabGalleryPage } from '@/game/PhotoLabGalleryPage';

export const Route = createFileRoute('/photo-lab-gallery')({
  head: () => ({
    meta: [
      { title: 'Zany Foto Lab Gallery | Jaime Jangles' },
      {
        name: 'description',
        content: 'Wild, silly, and creative photo creations posted by kids from around the world in the Zany Foto Lab!',
      },
    ],
  }),
  component: PhotoLabGalleryPage,
});
