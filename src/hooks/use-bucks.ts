import { useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';

export function useBucks() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: balance = 0 } = useQuery({
    queryKey: ['bucks-balance', user?.id],
    queryFn: async () => {
      if (!isSupabaseConfigured || !user) return 0;
      const { data } = await supabase
        .from('bucks_balance')
        .select('balance')
        .eq('user_id', user.id)
        .maybeSingle();
      return (data?.balance as number) ?? 0;
    },
    enabled: !!user && isSupabaseConfigured,
    staleTime: 30_000,
  });

  const earnBuck = useCallback(async (gameSlug: string): Promise<string | null> => {
    if (!isSupabaseConfigured || !user) return null;
    const today = new Date().toISOString().slice(0, 10);
    // Check coins earned today for this specific game
    const { count: gameCount } = await supabase
      .from('bucks_log')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('game_slug', gameSlug)
      .eq('earn_date', today)
      .eq('action', 'earn');
    const earned = gameCount ?? 0;
    if (earned >= 5) return null;
    const { error } = await supabase.from('bucks_log').insert({
      user_id: user.id,
      game_slug: gameSlug,
      action: 'earn',
      amount: 1,
      earn_date: today,
    });
    if (!error) {
      queryClient.invalidateQueries({ queryKey: ['bucks-balance', user.id] });
      const newTotal = earned + 1;
      if (newTotal === 3) return '3 of 5 coins earned in this game today!';
      if (newTotal === 4) return '4 of 5 coins earned in this game today!';
      if (newTotal === 5) return 'No more coins from this game today!';
    }
    return null;
  }, [user, queryClient]);

  const spendBuck = useCallback(async (gameSlug: string): Promise<boolean> => {
    if (!isSupabaseConfigured || !user || balance < 1) return false;
    const { error } = await supabase.from('bucks_log').insert({
      user_id: user.id,
      game_slug: gameSlug,
      action: 'spend',
      amount: 1,
      earn_date: null,
    });
    if (!error) {
      queryClient.invalidateQueries({ queryKey: ['bucks-balance', user.id] });
      return true;
    }
    return false;
  }, [user, balance, queryClient]);

  return { balance, earnBuck, spendBuck };
}
