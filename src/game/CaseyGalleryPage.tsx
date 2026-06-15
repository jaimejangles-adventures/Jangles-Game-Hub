import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from '@tanstack/react-router';
import { isSupabaseConfigured, supabase, type GalleryRow } from '@/lib/supabase';
import { flagEmoji } from '@/lib/countries';
import { asset } from '@/lib/asset';
import { useAuth } from '@/lib/auth-context';

type PaintingCard = GalleryRow & { username: string; country_code: string };

export function CaseyGalleryPage() {
  const { user, profile } = useAuth();
  const [paintings, setPaintings] = useState<PaintingCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [lightbox, setLightbox] = useState<PaintingCard | null>(null);

  const handlePrint = (p: PaintingCard) => {
    const win = window.open('', '_blank')!;
    win.document.write(`<!DOCTYPE html><html><head><title>${p.word} by ${p.username}</title>
<style>
  body{font-family:'Trebuchet MS',sans-serif;background:#fffbf0;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;padding:20px;}
  .frame{border:6px solid #1a1a1a;border-radius:20px;padding:28px;text-align:center;max-width:640px;width:100%;box-shadow:0 8px 0 #1a1a1a;}
  h1{color:#1a1a1a;font-size:24px;margin:0 0 4px;font-weight:800;}
  .who{font-size:15px;color:#555;margin-bottom:8px;}
  .word{font-size:42px;font-weight:800;margin:8px 0;color:#4ecdc4;}
  img{max-width:100%;border-radius:10px;border:6px solid #1a1a1a;margin:12px 0;display:block;}
  .brand{font-size:11px;color:#aaa;margin-top:12px;}
</style></head><body>
<div class="frame">
  <h1>My Jangles Drawing!</h1>
  <div class="who">by <strong>${p.username}</strong></div>
  <div class="word">${p.emoji} ${p.word}</div>
  <img src="${p.image_url}" alt="${p.word}" />
  <div class="brand">Draw with Casey! · Jaime Jangles · jaimejangles.com</div>
</div></body></html>`);
    win.document.close();
    setTimeout(() => win.print(), 500);
  };

  useEffect(() => {
    if (!isSupabaseConfigured) { setLoading(false); return; }

    (async () => {
      const { data: rows } = await supabase
        .from('casey_gallery')
        .select('id, user_id, image_url, word, emoji, created_at')
        .order('created_at', { ascending: false })
        .limit(60);

      if (!rows?.length) { setLoading(false); return; }

      const userIds = [...new Set(rows.map((r: GalleryRow) => r.user_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, username, country_code')
        .in('id', userIds);

      const profileMap: Record<string, { username: string; country_code: string }> = {};
      for (const p of profiles ?? []) profileMap[p.id] = p;

      setPaintings(
        rows.map((r: GalleryRow) => ({
          ...r,
          username: profileMap[r.user_id]?.username ?? 'Artist',
          country_code: profileMap[r.user_id]?.country_code ?? '',
        })),
      );
      setLoading(false);
    })();
  }, []);

  const handleDelete = async (painting: PaintingCard) => {
    if (!user) return;
    setDeleting(painting.id);
    // Delete from storage — path is userId/filename
    const urlPath = new URL(painting.image_url).pathname;
    const storagePath = urlPath.split('/casey-gallery/')[1];
    if (storagePath) {
      await supabase.storage.from('casey-gallery').remove([storagePath]);
    }
    const { error } = await supabase.from('casey_gallery').delete().eq('id', painting.id);
    if (!error) {
      setPaintings(prev => prev.filter(p => p.id !== painting.id));
    }
    setDeleting(null);
  };

  return (
    <div className="min-h-screen bg-paper px-4 py-8 sm:px-6">
      {/* ── Header ── */}
      <div className="mx-auto mb-8 max-w-3xl text-center">
        <motion.img
          src={asset('/characters/map-casey.png')}
          alt="Casey Bea Jangles"
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 280, damping: 22 }}
          className="mx-auto mb-3 w-24"
          style={{ filter: 'drop-shadow(0 6px 12px rgba(0,0,0,0.10))' }}
        />
        <h1 className="text-4xl font-extrabold text-ink sm:text-5xl">
          Best Of{' '}
          <span style={{ color: '#4ecdc4', textShadow: '2px 2px 0 rgba(78,205,196,0.25)' }}>
            Casey's Gallery
          </span>
        </h1>
        <p className="mt-2 text-sm font-medium text-ink/45">
          Amazing drawings by kids from around the world 🌍
        </p>
        <Link
          to="/games/draw-with-casey"
          className="mt-4 inline-block rounded-full border-[3px] border-ink bg-[#e87fa3] px-5 py-2 text-sm font-extrabold text-white transition-transform hover:-translate-y-0.5"
          style={{ borderBottomWidth: 5, borderRightWidth: 4 }}
        >
          Draw with Casey! 🎨
        </Link>
      </div>

      {/* ── Grid ── */}
      {loading ? (
        <div className="flex justify-center py-20 text-ink/40 text-sm font-semibold">
          Loading paintings…
        </div>
      ) : paintings.length === 0 ? (
        <div className="mx-auto max-w-sm py-20 text-center">
          <div className="text-5xl mb-4">🖼️</div>
          <p className="font-extrabold text-ink text-lg">No paintings yet!</p>
          <p className="mt-1 text-sm text-ink/45">
            Be the first to draw with Casey and save to the gallery.
          </p>
        </div>
      ) : (
        <div className="mx-auto grid max-w-5xl gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          <AnimatePresence>
          {paintings.map((p, i) => {

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
              {/* Drawing */}
              <div
                className="relative w-full cursor-zoom-in"
                style={{ aspectRatio: '4/3', background: '#1c3d1e' }}
                onClick={() => setLightbox(p)}
              >
                <img
                  src={p.image_url}
                  alt={`${p.word} drawing`}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
                {canDelete && (
                  <button
                    onClick={() => handleDelete(p)}
                    disabled={deleting === p.id}
                    title="Remove from gallery"
                    className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-black/60 text-white transition-opacity hover:bg-red-600 disabled:opacity-40"
                    style={{ fontSize: 14, lineHeight: 1 }}
                  >
                    {deleting === p.id ? '…' : '×'}
                  </button>
                )}
              </div>

              {/* Meta */}
              <div className="flex items-center justify-between gap-2 px-3 py-2">
                <div className="min-w-0">
                  <div className="truncate text-sm font-extrabold text-ink">
                    {p.emoji} {p.word}
                  </div>
                  <div className="flex items-center gap-1 text-[11px] font-semibold text-ink/50">
                    {p.country_code && (
                      <span>{flagEmoji(p.country_code)}</span>
                    )}
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
      {/* ── Lightbox ── */}
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
              onClick={e => e.stopPropagation()}
            >
              {/* Image */}
              <div style={{ background: '#1c3d1e' }}>
                <img
                  src={lightbox.image_url}
                  alt={`${lightbox.word} drawing`}
                  className="w-full"
                />
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between gap-3 px-5 py-4">
                <div>
                  <div className="text-lg font-extrabold text-ink">
                    {lightbox.emoji} {lightbox.word}
                  </div>
                  <div className="flex items-center gap-1 text-sm font-semibold text-ink/50">
                    {lightbox.country_code && <span>{flagEmoji(lightbox.country_code)}</span>}
                    <span>{lightbox.username}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePrint(lightbox)}
                    className="rounded-full border-[3px] border-ink bg-[#4ecdc4] px-4 py-2 text-sm font-extrabold text-white transition-transform hover:-translate-y-0.5"
                    style={{ borderBottomWidth: 5, borderRightWidth: 4 }}
                  >
                    🖨️ Print
                  </button>
                  <button
                    onClick={() => setLightbox(null)}
                    className="rounded-full border-[3px] border-ink bg-white px-4 py-2 text-sm font-extrabold text-ink transition-transform hover:-translate-y-0.5"
                    style={{ borderBottomWidth: 5, borderRightWidth: 4 }}
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
