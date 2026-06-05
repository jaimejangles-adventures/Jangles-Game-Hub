import { useEffect, useState } from 'react';
import { isSupabaseConfigured, supabase, type ScoreRow } from '@/lib/supabase';
import { flagEmoji } from '@/lib/countries';
import { GAME_MANIFEST } from '@/lib/game-manifest';

type Entry = {
  rank: number;
  username: string;
  country_code: string;
  score: number;
};

type Theme = 'light' | 'dark';

type Props = {
  gameSlug: string;
  limit?: number;
  theme?: Theme;
};

export function Leaderboard({ gameSlug, limit = 10, theme = 'light' }: Props) {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }
    setLoading(true);
    supabase
      .from('scores')
      .select('score, updated_at, profiles(username, country_code)')
      .eq('game_slug', gameSlug)
      .order('score', { ascending: false })
      .limit(limit)
      .then(({ data }) => {
        const rows = (data ?? []) as unknown as ScoreRow[];
        setEntries(
          rows
            .filter((r) => r.profiles)
            .map((r, i) => ({
              rank: i + 1,
              username: r.profiles!.username,
              country_code: r.profiles!.country_code,
              score: r.score,
            })),
        );
        setLoading(false);
      });
  }, [gameSlug, limit]);

  const isDark = theme === 'dark';

  if (!isSupabaseConfigured) {
    return (
      <p className="text-center text-xs opacity-50" style={{ color: isDark ? '#9ca3af' : undefined }}>
        Leaderboard not configured yet.
      </p>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="h-9 rounded-xl animate-pulse"
            style={{ background: isDark ? '#1e293b' : '#e5e7eb' }}
          />
        ))}
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <p
        className="py-4 text-center text-xs font-bold"
        style={{ color: isDark ? '#6b7280' : '#9ca3af' }}
      >
        No scores yet — be the first!
      </p>
    );
  }

  const medalColors = ['#FFD700', '#C0C0C0', '#CD7F32'];

  return (
    <div className="flex flex-col gap-1.5">
      {entries.map((e) => (
        <div
          key={e.rank}
          className="flex items-center gap-2.5 rounded-xl px-3 py-2"
          style={{
            background: isDark
              ? e.rank <= 3
                ? 'rgba(255,255,255,0.06)'
                : 'rgba(255,255,255,0.03)'
              : e.rank <= 3
              ? '#fffbf0'
              : '#f9fafb',
            border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid #e5e7eb',
          }}
        >
          <span
            className="w-6 shrink-0 text-center text-xs font-extrabold"
            style={{ color: e.rank <= 3 ? medalColors[e.rank - 1] : isDark ? '#6b7280' : '#9ca3af' }}
          >
            {e.rank <= 3 ? ['🥇', '🥈', '🥉'][e.rank - 1] : e.rank}
          </span>
          <span className="text-base leading-none">{flagEmoji(e.country_code)}</span>
          <span
            className="flex-1 truncate text-sm font-extrabold"
            style={{ color: isDark ? '#f1f5f9' : '#1a1a1a' }}
          >
            {e.username}
          </span>
          <span
            className="shrink-0 font-mono text-sm font-extrabold tabular-nums"
            style={{ color: isDark ? '#facc15' : '#1a1a1a' }}
          >
            {e.score.toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── Homepage Hall of Fame widget ──────────────────────────────────────────────

const LEADERBOARD_GAMES = [
  'pacman',
  'jangles-ball',
  'air-fante-collect',
  'foxer',
  'jangles-kong',
] as const;

export function HallOfFame() {
  const [activeSlug, setActiveSlug] = useState<string>(LEADERBOARD_GAMES[0]);

  const games = LEADERBOARD_GAMES.map((slug) => GAME_MANIFEST.find((g) => g.slug === slug)).filter(
    Boolean,
  );

  return (
    <div
      className="rounded-[2rem] border-[3px] border-ink bg-white px-5 py-5"
      style={{ borderBottomWidth: 6, borderRightWidth: 5 }}
    >
      {/* Header */}
      <div className="mb-4 flex items-center gap-3">
        <div
          className="inline-flex items-center gap-1.5 rounded-full border-[2px] border-ink px-3 py-1 text-[0.65rem] font-extrabold uppercase tracking-[0.18em]"
          style={{
            background: '#FBBF24',
            borderBottomWidth: 3,
            borderRightWidth: 2,
          }}
        >
          🏆 Hall of Fame
        </div>
        <span className="text-[0.6rem] text-ink/45 font-medium">Top players worldwide</span>
      </div>

      {/* Game tabs */}
      <div className="mb-4 flex flex-wrap gap-2">
        {games.map((game) => {
          if (!game) return null;
          const isActive = activeSlug === game.slug;
          return (
            <button
              key={game.slug}
              onClick={() => setActiveSlug(game.slug)}
              className="flex items-center gap-1.5 rounded-full border-[2px] border-ink px-3 py-1 text-xs font-extrabold transition-transform hover:-translate-y-0.5"
              style={{
                background: isActive ? game.accent : '#fff',
                color: isActive ? '#fff' : '#1a1a1a',
                borderBottomWidth: isActive ? 4 : 3,
                borderRightWidth: isActive ? 3 : 2,
              }}
            >
              <span>{game.emoji}</span>
              <span>{game.title}</span>
            </button>
          );
        })}
      </div>

      <Leaderboard gameSlug={activeSlug} limit={10} theme="light" />
    </div>
  );
}
