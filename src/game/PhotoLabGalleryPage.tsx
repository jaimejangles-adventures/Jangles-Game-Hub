import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from '@tanstack/react-router';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import { flagEmoji } from '@/lib/countries';
import { useAuth } from '@/lib/auth-context';

type PhotoCard = {
  id: string;
  user_id: string;
  image_url: string;
  created_at: string;
  username: string;
  country_code: string;
};

export function PhotoLabGalleryPage() {
  const { user, profile } = useAuth();
  const [photos, setPhotos] = useState<PhotoCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [lightbox, setLightbox] = useState<PhotoCard | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    (async () => {
      const { data: rows } = await supabase
        .from('photo_lab_gallery')
        .select('id, user_id, image_url, created_at')
        .order('created_at', { ascending: false })
        .limit(60);

      if (!rows?.length) {
        setLoading(false);
        return;
      }

      const userIds = [...new Set(rows.map((r) => r.user_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, username, country_code')
        .in('id', userIds);

      const profileMap: Record<string, { username: string; country_code: string }> = {};
      for (const p of profiles ?? []) profileMap[p.id] = p;

      setPhotos(
        rows.map((r) => ({
          ...r,
          username: profileMap[r.user_id]?.username ?? 'Zany Artist',
          country_code: profileMap[r.user_id]?.country_code ?? '',
        })),
      );
      setLoading(false);
    })();
  }, []);

  const handleDelete = async (photo: PhotoCard) => {
    if (!user) return;
    setDeleting(photo.id);
    const urlPath = new URL(photo.image_url).pathname;
    const storagePath = urlPath.split('/photo-lab-gallery/')[1];
    if (storagePath) {
      await supabase.storage.from('photo-lab-gallery').remove([storagePath]);
    }
    const { error } = await supabase.from('photo_lab_gallery').delete().eq('id', photo.id);
    if (!error) {
      setPhotos((prev) => prev.filter((p) => p.id !== photo.id));
      if (lightbox?.id === photo.id) setLightbox(null);
    }
    setDeleting(null);
  };

  return (
    <div className="min-h-screen bg-paper px-4 py-8 sm:px-6">
      {/* Header */}
      <div className="mx-auto mb-8 max-w-3xl text-center">
        <motion.div
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 280, damping: 22 }}
          className="mx-auto mb-3 text-6xl"
          style={{ filter: 'drop-shadow(0 6px 12px rgba(0,0,0,0.10))' }}
        >
          🤪
        </motion.div>
        <h1 className="text-4xl font-extrabold text-ink sm:text-5xl">
          The{' '}
          <span style={{ color: '#EC4899', textShadow: '2px 2px 0 rgba(236,72,153,0.25)' }}>
            Zany Foto Lab
          </span>{' '}
          Gallery
        </h1>
        <p className="mt-2 text-sm font-medium text-ink/45">
          Wild, silly, and creative pics posted by kids around the world 🌍
        </p>
        <Link
          to="/games/photo-lab"
          className="mt-4 inline-block rounded-full border-[3px] border-ink bg-[#EC4899] px-5 py-2 text-sm font-extrabold text-white transition-transform hover:-translate-y-0.5"
          style={{ borderBottomWidth: 5, borderRightWidth: 4 }}
        >
          Make Your Own! 🤪
        </Link>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex justify-center py-20 text-ink/40 text-sm font-semibold">
          Loading photos…
        </div>
      ) : photos.length === 0 ? (
        <div className="mx-auto max-w-sm py-20 text-center">
          <div className="text-5xl mb-4">🖼️</div>
          <p className="font-extrabold text-ink text-lg">No photos yet!</p>
          <p className="mt-1 text-sm text-ink/45">
            Be the first to post a zany creation to the gallery.
          </p>
        </div>
      ) : (
        <div className="mx-auto grid max-w-5xl gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          <AnimatePresence>
            {photos.map((p, i) => {
              const canDelete = !!user && (p.user_id === user.id || !!profile?.is_admin);
              return (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: i * 0.04, duration: 0.35 }}
                  className="overflow-hidden rounded-2xl border-[3px] border-ink bg-white"
                  style={{ borderBottomWidth: 5, borderRightWidth: 4 }}
                >
                  <div
                    className="relative w-full cursor-zoom-in"
                    style={{ aspectRatio: '4/3', background: '#1c1c2e' }}
                    onClick={() => setLightbox(p)}
                  >
                    <img
                      src={p.image_url}
                      alt={`Photo by ${p.username}`}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                    {canDelete && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(p);
                        }}
                        disabled={deleting === p.id}
                        title="Remove from gallery"
                        className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-black/60 text-white transition-opacity hover:bg-red-600 disabled:opacity-40"
                        style={{ fontSize: 14, lineHeight: 1 }}
                      >
                        {deleting === p.id ? '…' : '×'}
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-2 px-3 py-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1 text-[11px] font-semibold text-ink/50">
                        {p.country_code && <span>{flagEmoji(p.country_code)}</span>}
                        <span className="truncate">{p.username}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-4"
            onClick={() => setLightbox(null)}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 26 }}
              className="relative w-full max-w-2xl overflow-hidden rounded-2xl border-[4px] border-ink bg-white"
              style={{ borderBottomWidth: 6, borderRightWidth: 5 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ background: '#1c1c2e' }}>
                <img src={lightbox.image_url} alt={`Photo by ${lightbox.username}`} className="w-full" />
              </div>

              <div className="flex items-center justify-between gap-3 px-5 py-4">
                <div className="flex items-center gap-1 text-sm font-semibold text-ink/50">
                  {lightbox.country_code && <span>{flagEmoji(lightbox.country_code)}</span>}
                  <span>{lightbox.username}</span>
                </div>
                <button
                  onClick={() => setLightbox(null)}
                  className="rounded-full border-[3px] border-ink bg-white px-4 py-2 text-sm font-extrabold text-ink transition-transform hover:-translate-y-0.5"
                  style={{ borderBottomWidth: 5, borderRightWidth: 4 }}
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
