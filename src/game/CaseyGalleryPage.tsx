import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from '@tanstack/react-router';
import { isSupabaseConfigured, supabase, type GalleryRow } from '@/lib/supabase';
import { flagEmoji } from '@/lib/countries';
import { asset } from '@/lib/asset';

type PaintingCard = GalleryRow & { username: string; country_code: string };

export function CaseyGalleryPage() {
  const [paintings, setPaintings] = useState<PaintingCard[]>([]);
  const [loading, setLoading] = useState(true);

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
          {paintings.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04, duration: 0.35 }}
              className="overflow-hidden rounded-2xl border-[3px] border-ink bg-white"
              style={{ borderBottomWidth: 5, borderRightWidth: 4 }}
            >
              {/* Drawing */}
              <div
                className="relative w-full"
                style={{ aspectRatio: '4/3', background: '#1c3d1e' }}
              >
                <img
                  src={p.image_url}
                  alt={`${p.word} drawing`}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
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
          ))}
        </div>
      )}
    </div>
  );
}
