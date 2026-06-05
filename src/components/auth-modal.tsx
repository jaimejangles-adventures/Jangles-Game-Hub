import { useEffect, useRef, useState } from 'react';
import { supabase, type Profile } from '@/lib/supabase';
import { COUNTRIES, flagEmoji } from '@/lib/countries';

type Mode = 'sign-in' | 'sign-up';

type Props = {
  open: boolean;
  mode: Mode;
  onClose: () => void;
  onModeChange: (m: Mode) => void;
  onProfileCreated: (p: Profile) => void;
};

export function AuthModal({ open, mode, onClose, onModeChange, onProfileCreated }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [countryCode, setCountryCode] = useState('US');
  const [detecting, setDetecting] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const firstInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setError('');
      setTimeout(() => firstInputRef.current?.focus(), 80);
    }
  }, [open, mode]);

  async function detectCountry() {
    setDetecting(true);
    try {
      const res = await fetch('https://ipwho.is/');
      const json = await res.json();
      if (json.country_code) setCountryCode(json.country_code);
    } catch {
      // silent
    } finally {
      setDetecting(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      if (mode === 'sign-in') {
        const { error: err } = await supabase.auth.signInWithPassword({ email, password });
        if (err) throw err;
      } else {
        if (username.trim().length < 2) throw new Error('Username must be at least 2 characters.');
        if (username.trim().length > 20) throw new Error('Username must be 20 characters or less.');
        if (!/^[a-zA-Z0-9_]+$/.test(username.trim())) throw new Error('Username can only contain letters, numbers, and underscores.');

        const { data, error: err } = await supabase.auth.signUp({ email, password });
        if (err) throw err;

        const userId = data.user?.id;
        if (!userId) throw new Error('Sign up failed — please try again.');

        const { error: profileErr } = await supabase.from('profiles').insert({
          id: userId,
          username: username.trim(),
          country_code: countryCode,
        });
        if (profileErr) throw profileErr;

        onProfileCreated({ id: userId, username: username.trim(), country_code: countryCode });
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-sm mx-4 rounded-[2rem] border-[3px] border-ink bg-paper p-7"
        style={{ borderBottomWidth: 7, borderRightWidth: 6 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full border-[2px] border-ink text-sm font-bold text-ink/60 hover:text-ink"
          style={{ borderBottomWidth: 3, borderRightWidth: 3 }}
        >
          ✕
        </button>

        {/* Header */}
        <div className="mb-5 text-center">
          <div
            className="mx-auto mb-2 inline-flex items-center gap-1.5 rounded-full border-[2px] border-ink px-3 py-0.5 text-[0.6rem] font-extrabold uppercase tracking-[0.25em]"
            style={{ background: '#FBBF24', borderBottomWidth: 4, borderRightWidth: 3 }}
          >
            🏆 Jangles Game Hub
          </div>
          <h2 className="text-xl font-extrabold text-ink">
            {mode === 'sign-in' ? 'Welcome back!' : 'Join the leaderboard!'}
          </h2>
          <p className="mt-0.5 text-xs text-ink/55">
            {mode === 'sign-in'
              ? 'Sign in to see your scores on the leaderboard.'
              : 'Save your scores and see how you rank worldwide.'}
          </p>
        </div>

        {/* Mode tabs */}
        <div className="mb-5 flex rounded-full border-[2px] border-ink overflow-hidden" style={{ borderBottomWidth: 3 }}>
          {(['sign-in', 'sign-up'] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => { onModeChange(m); setError(''); }}
              className="flex-1 py-1.5 text-xs font-extrabold transition-colors"
              style={{
                background: mode === m ? '#22C55E' : '#fff',
                color: mode === m ? '#fff' : '#1a1a1a',
              }}
            >
              {m === 'sign-in' ? 'Sign In' : 'Sign Up'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {mode === 'sign-up' && (
            <>
              <div className="flex flex-col gap-1">
                <label className="text-[0.65rem] font-extrabold uppercase tracking-[0.15em] text-ink/50">
                  Username
                </label>
                <input
                  ref={firstInputRef}
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="YourName123"
                  maxLength={20}
                  required
                  className="rounded-xl border-[2px] border-ink px-3 py-2 text-sm font-bold text-ink outline-none focus:border-[3px]"
                  style={{ background: '#fff', borderBottomWidth: 4 }}
                />
              </div>

              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <label className="text-[0.65rem] font-extrabold uppercase tracking-[0.15em] text-ink/50">
                    Country
                  </label>
                  <button
                    type="button"
                    onClick={detectCountry}
                    disabled={detecting}
                    className="text-[0.6rem] font-bold text-blue-600 hover:underline disabled:opacity-50"
                  >
                    {detecting ? 'Detecting…' : '📍 Detect mine'}
                  </button>
                </div>
                <select
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  required
                  className="rounded-xl border-[2px] border-ink px-3 py-2 text-sm font-bold text-ink outline-none focus:border-[3px]"
                  style={{ background: '#fff', borderBottomWidth: 4 }}
                >
                  {COUNTRIES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {flagEmoji(c.code)} {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          <div className="flex flex-col gap-1">
            <label className="text-[0.65rem] font-extrabold uppercase tracking-[0.15em] text-ink/50">
              Email
            </label>
            <input
              ref={mode === 'sign-in' ? firstInputRef : undefined}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="rounded-xl border-[2px] border-ink px-3 py-2 text-sm font-bold text-ink outline-none focus:border-[3px]"
              style={{ background: '#fff', borderBottomWidth: 4 }}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[0.65rem] font-extrabold uppercase tracking-[0.15em] text-ink/50">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={mode === 'sign-up' ? 'At least 6 characters' : ''}
              minLength={6}
              required
              className="rounded-xl border-[2px] border-ink px-3 py-2 text-sm font-bold text-ink outline-none focus:border-[3px]"
              style={{ background: '#fff', borderBottomWidth: 4 }}
            />
          </div>

          {error && (
            <p className="rounded-xl border-[2px] border-red-300 bg-red-50 px-3 py-2 text-xs font-bold text-red-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="mt-1 rounded-full border-[3px] border-ink py-2.5 text-sm font-extrabold text-white transition-transform hover:-translate-y-0.5 disabled:opacity-60"
            style={{ background: '#22C55E', borderBottomWidth: 5, borderRightWidth: 4 }}
          >
            {submitting
              ? '…'
              : mode === 'sign-in'
              ? 'Sign In'
              : 'Create Account'}
          </button>
        </form>

        <p className="mt-4 text-center text-[0.65rem] text-ink/40">
          {mode === 'sign-in' ? "Don't have an account? " : 'Already have an account? '}
          <button
            onClick={() => { onModeChange(mode === 'sign-in' ? 'sign-up' : 'sign-in'); setError(''); }}
            className="font-bold text-ink/70 underline"
          >
            {mode === 'sign-in' ? 'Sign up free' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  );
}
