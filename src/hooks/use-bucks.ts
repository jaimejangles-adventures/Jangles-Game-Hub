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

  const earnBuck = useCallback(async (gameSlug: string) => {
    if (!isSupabaseConfigured || !user) return;
    const today = new Date().toISOString().slice(0, 10);
    const { error } = await supabase.from('bucks_log').insert({
      user_id: user.id,
      game_slug: gameSlug,
      action: 'earn',
      amount: 1,
      earn_date: today,
    });
    // 23505 = unique_violation: already earned this game today — ignore silently
    if (!error || error.code === '23505') {
      queryClient.invalidateQueries({ queryKey: ['bucks-balance', user.id] });
    }
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
