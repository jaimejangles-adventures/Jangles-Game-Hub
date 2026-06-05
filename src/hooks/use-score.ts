import { useCallback, useRef, useState } from 'react';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';

export function useScore(gameSlug: string) {
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const savedForScore = useRef<number | null>(null);

  const saveScore = useCallback(
    async (score: number) => {
      if (!isSupabaseConfigured || !user || score <= 0) return;
      if (savedForScore.current === score) return;

      setSaving(true);
      savedForScore.current = score;

      try {
        const { data: existing } = await supabase
          .from('scores')
          .select('score')
          .eq('user_id', user.id)
          .eq('game_slug', gameSlug)
          .maybeSingle();

        if (!existing || score > existing.score) {
          await supabase.from('scores').upsert(
            {
              user_id: user.id,
              game_slug: gameSlug,
              score,
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'user_id,game_slug' },
          );
        }
        setSaved(true);
      } catch {
        // score save failures are silent — not critical
      } finally {
        setSaving(false);
      }
    },
    [user, gameSlug],
  );

  const reset = useCallback(() => {
    setSaved(false);
    savedForScore.current = null;
  }, []);

  return { saveScore, saving, saved, reset };
}
