import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL ?? 'https://placeholder.supabase.co',
  import.meta.env.VITE_SUPABASE_ANON_KEY ?? 'placeholder',
);

export const isSupabaseConfigured = !!(
  import.meta.env.VITE_SUPABASE_URL &&
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export type Profile = {
  id: string;
  username: string;
  country_code: string;
};

export type ScoreRow = {
  score: number;
  updated_at: string;
  profiles: {
    username: string;
    country_code: string;
  } | null;
};
