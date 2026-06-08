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

type Screen = 'auth' | 'forgot' | 'forgot-sent';

export function AuthModal({ open, mode, onClose, onModeChange, onProfileCreated }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [countryCode, setCountryCode] = useState('US');
  const [detecting, setDetecting] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [screen, setScreen] = useState<Screen>('auth');
  const [showPassword, setShowPassword] = useState(false);
  const firstInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setError('');
      setScreen('auth');
      setTimeout(() => firstInputRef.current?.focus(), 80);
    }
  }, [open, mode]);

  async function handleForgotPassword(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const { error: err } = await supabase.auth.resetPasswordForEmail(email);
      if (err) throw err;
      setScreen('forgot-sent');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  }

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
        // Accept username OR email — detect by presence of @
        let authEmail: string;
        if (email.includes('@')) {
          authEmail = email.trim();
        } else {
          // Treat input as a username — look up their hidden auth email
          const { data } = await supabase
            .from('profiles')
            .select('auth_email')
            .eq('username', email.trim())
            .maybeSingle();
          if (!data?.auth_email) throw new Error('Username not found. Try your email instead.');
          authEmail = data.auth_email;
        }
        const { error: err } = await supabase.auth.signInWithPassword({ email: authEmail, password });
        if (err) throw err;
      } else {
        // Sign up
        if (username.trim().length < 2) throw new Error('Username must be at least 2 characters.');
        if (username.trim().length > 20) throw new Error('Username must be 20 characters or less.');
        if (!/^[a-zA-Z0-9_]+$/.test(username.trim())) throw new Error('Username can only have letters, numbers and underscores.');

        // Generate a hidden email if parent email not provided
        const cleanName = username.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
        const randomId = Math.random().toString(36).slice(2, 8);
        const authEmail = email.trim() || `${cleanName}_${randomId}@play.jaimejangles.com`;

        const { data, error: err } = await supabase.auth.signUp({ email: authEmail, password });
        if (err) throw err;

        const userId = data.user?.id;
        if (!userId) throw new Error('Sign up failed — please try again.');

        // Save pending profile to localStorage (used after email confirmation if needed)
        localStorage.setItem('pending_profile', JSON.stringify({
          username: username.trim(),
          country_code: countryCode,
          auth_email: authEmail,
        }));

        // Try to insert profile immediately
        const { error: profileErr } = await supabase.from('profiles').insert({
          id: userId,
          username: username.trim(),
          country_code: countryCode,
          auth_email: authEmail,
        });

        if (!profileErr) {
          onProfileCreated({ id: userId, username: username.trim(), country_code: countryCode });
        }
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

        {/* Forgot password screen */}
        {screen === 'forgot' && (
          <div className="flex flex-col gap-4">
            <div className="text-center">
              <h2 className="text-xl font-extrabold text-ink">Reset password</h2>
              <p className="mt-1 text-xs text-ink/55">Enter your email and we'll send a reset link.</p>
            </div>
            <form onSubmit={handleForgotPassword} className="flex flex-col gap-3">
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required
                className="rounded-xl border-[2px] border-ink px-3 py-2 text-sm font-bold text-ink outline-none"
                style={{ background: '#fff', borderBottomWidth: 4 }} />
              {error && <p className="rounded-xl border-[2px] border-red-300 bg-red-50 px-3 py-2 text-xs font-bold text-red-600">{error}</p>}
              <button type="submit" disabled={submitting}
                className="rounded-full border-[3px] border-ink py-2.5 text-sm font-extrabold text-white disabled:opacity-60"
                style={{ background: '#22C55E', borderBottomWidth: 5, borderRightWidth: 4 }}>
                {submitting ? '…' : 'Send reset link'}
              </button>
              <button type="button" onClick={() => setScreen('auth')} className="text-xs text-ink/50 hover:text-ink font-bold">← Back to sign in</button>
            </form>
          </div>
        )}

        {screen === 'forgot-sent' && (
          <div className="flex flex-col items-center gap-4 text-center py-4">
            <div className="text-5xl">📬</div>
            <h2 className="text-xl font-extrabold text-ink">Check your email!</h2>
            <p className="text-xs text-ink/55">We sent a password reset link to <strong>{email}</strong></p>
            <button onClick={() => setScreen('auth')} className="text-xs font-bold text-ink/50 hover:text-ink">← Back to sign in</button>
          </div>
        )}

        {screen !== 'auth' ? null : <>

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

          {mode === 'sign-in' ? (
            <div className="flex flex-col gap-1">
              <label className="text-[0.65rem] font-extrabold uppercase tracking-[0.15em] text-ink/50">
                Username or Email
              </label>
              <input
                ref={firstInputRef}
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="YourName or you@example.com"
                required
                className="rounded-xl border-[2px] border-ink px-3 py-2 text-sm font-bold text-ink outline-none focus:border-[3px]"
                style={{ background: '#fff', borderBottomWidth: 4 }}
              />
            </div>
          ) : (
            <div className="flex flex-col gap-1">
              <label className="text-[0.65rem] font-extrabold uppercase tracking-[0.15em] text-ink/50">
                Parent's Email <span className="normal-case font-normal opacity-60">— optional, for account recovery</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="parent@example.com (optional)"
                className="rounded-xl border-[2px] border-ink px-3 py-2 text-sm font-bold text-ink outline-none focus:border-[3px]"
                style={{ background: '#fff', borderBottomWidth: 4 }}
              />
            </div>
          )}

          <div className="flex flex-col gap-1">
            <label className="text-[0.65rem] font-extrabold uppercase tracking-[0.15em] text-ink/50">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={mode === 'sign-up' ? 'At least 6 characters' : ''}
                minLength={6}
                required
                className="w-full rounded-xl border-[2px] border-ink px-3 py-2 pr-10 text-sm font-bold text-ink outline-none focus:border-[3px]"
                style={{ background: '#fff', borderBottomWidth: 4 }}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-base leading-none text-ink/40 hover:text-ink/70"
                tabIndex={-1}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
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

        {mode === 'sign-in' && (
          <p className="mt-1 text-center text-[0.65rem] text-ink/40">
            <button onClick={() => { setScreen('forgot'); setError(''); }} className="hover:text-ink/70 underline">
              Forgot password?
            </button>
          </p>
        )}

        </> }
      </div>
    </div>
  );
}

// ─── Edit Profile Modal ────────────────────────────────────────────────────────

type EditProfileProps = {
  profile: Profile;
  onClose: () => void;
  onProfileUpdated: (p: Profile) => void;
};

export function EditProfileModal({ profile, onClose, onProfileUpdated }: EditProfileProps) {
  const [username, setUsername] = useState(profile.username);
  const [countryCode, setCountryCode] = useState(profile.country_code);
  const [detecting, setDetecting] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  async function detectCountry() {
    setDetecting(true);
    try {
      const res = await fetch('https://ipwho.is/');
      const json = await res.json();
      if (json.country_code) setCountryCode(json.country_code);
    } catch { /* silent */ }
    finally { setDetecting(false); }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (username.trim().length < 2) { setError('Username must be at least 2 characters.'); return; }
    if (username.trim().length > 20) { setError('Username must be 20 characters or less.'); return; }
    if (!/^[a-zA-Z0-9_]+$/.test(username.trim())) { setError('Letters, numbers and underscores only.'); return; }
    setSubmitting(true);
    try {
      const { error: err } = await supabase
        .from('profiles')
        .update({ username: username.trim(), country_code: countryCode })
        .eq('id', profile.id);
      if (err) throw err;
      setSuccess(true);
      setTimeout(() => {
        onProfileUpdated({ ...profile, username: username.trim(), country_code: countryCode });
        onClose();
      }, 800);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '';
      if (msg.includes('23505') || msg.toLowerCase().includes('unique')) {
        setError('Sorry, that username is taken.');
      } else {
        setError(msg || 'Something went wrong.');
      }
    } finally {
      setSubmitting(false);
    }
  }

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
        <button
          onClick={onClose}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full border-[2px] border-ink text-sm font-bold text-ink/60 hover:text-ink"
          style={{ borderBottomWidth: 3, borderRightWidth: 3 }}
        >
          ✕
        </button>

        <div className="mb-5 text-center">
          <div
            className="mx-auto mb-2 inline-flex items-center gap-1.5 rounded-full border-[2px] border-ink px-3 py-0.5 text-[0.6rem] font-extrabold uppercase tracking-[0.25em]"
            style={{ background: '#FBBF24', borderBottomWidth: 4, borderRightWidth: 3 }}
          >
            ✏️ Edit Profile
          </div>
          <h2 className="text-xl font-extrabold text-ink">Update your info</h2>
          <p className="mt-0.5 text-xs text-ink/55">Changes will appear on the leaderboard right away.</p>
        </div>

        {success ? (
          <div className="flex flex-col items-center gap-3 py-4 text-center">
            <div className="text-5xl">🎉</div>
            <p className="font-extrabold text-ink">Profile updated!</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-[0.65rem] font-extrabold uppercase tracking-[0.15em] text-ink/50">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="YourName123"
                maxLength={20}
                required
                autoFocus
                className="rounded-xl border-[2px] border-ink px-3 py-2 text-sm font-bold text-ink outline-none focus:border-[3px]"
                style={{ background: '#fff', borderBottomWidth: 4 }}
              />
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <label className="text-[0.65rem] font-extrabold uppercase tracking-[0.15em] text-ink/50">Country</label>
                <button type="button" onClick={detectCountry} disabled={detecting} className="text-[0.6rem] font-bold text-blue-600 hover:underline disabled:opacity-50">
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
                  <option key={c.code} value={c.code}>{flagEmoji(c.code)} {c.name}</option>
                ))}
              </select>
            </div>

            {error && (
              <p className="rounded-xl border-[2px] border-red-300 bg-red-50 px-3 py-2 text-xs font-bold text-red-600">{error}</p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="mt-1 rounded-full border-[3px] border-ink py-2.5 text-sm font-extrabold text-white transition-transform hover:-translate-y-0.5 disabled:opacity-60"
              style={{ background: '#22C55E', borderBottomWidth: 5, borderRightWidth: 4 }}
            >
              {submitting ? '…' : 'Save Changes'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

// ─── Complete Profile Modal (shown when user is signed in but has no profile) ─

type CompleteProfileProps = {
  userId: string;
  onProfileCreated: (p: Profile) => void;
};

export function CompleteProfileModal({ userId, onProfileCreated }: CompleteProfileProps) {
  const [username, setUsername] = useState('');
  const [countryCode, setCountryCode] = useState('US');
  const [detecting, setDetecting] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function detectCountry() {
    setDetecting(true);
    try {
      const res = await fetch('https://ipwho.is/');
      const json = await res.json();
      if (json.country_code) setCountryCode(json.country_code);
    } catch { /* silent */ }
    finally { setDetecting(false); }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (username.trim().length < 2) { setError('Username must be at least 2 characters.'); return; }
    if (username.trim().length > 20) { setError('Username must be 20 characters or less.'); return; }
    if (!/^[a-zA-Z0-9_]+$/.test(username.trim())) { setError('Letters, numbers and underscores only.'); return; }
    setSubmitting(true);
    try {
      const { error: err } = await supabase.from('profiles').insert({
        id: userId,
        username: username.trim(),
        country_code: countryCode,
      });
      if (err) throw err;
      onProfileCreated({ id: userId, username: username.trim(), country_code: countryCode });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)' }}
    >
      <div
        className="relative w-full max-w-sm mx-4 rounded-[2rem] border-[3px] border-ink bg-paper p-7"
        style={{ borderBottomWidth: 7, borderRightWidth: 6 }}
      >
        <div className="mb-5 text-center">
          <div
            className="mx-auto mb-2 inline-flex items-center gap-1.5 rounded-full border-[2px] border-ink px-3 py-0.5 text-[0.6rem] font-extrabold uppercase tracking-[0.25em]"
            style={{ background: '#22C55E', borderBottomWidth: 4, borderRightWidth: 3, color: '#fff' }}
          >
            🏆 One more step!
          </div>
          <h2 className="text-xl font-extrabold text-ink">Set up your profile</h2>
          <p className="mt-0.5 text-xs text-ink/55">Pick a username and your country for the leaderboard.</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-[0.65rem] font-extrabold uppercase tracking-[0.15em] text-ink/50">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="YourName123"
              maxLength={20}
              required
              autoFocus
              className="rounded-xl border-[2px] border-ink px-3 py-2 text-sm font-bold text-ink outline-none focus:border-[3px]"
              style={{ background: '#fff', borderBottomWidth: 4 }}
            />
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <label className="text-[0.65rem] font-extrabold uppercase tracking-[0.15em] text-ink/50">Country</label>
              <button type="button" onClick={detectCountry} disabled={detecting} className="text-[0.6rem] font-bold text-blue-600 hover:underline disabled:opacity-50">
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
                <option key={c.code} value={c.code}>{flagEmoji(c.code)} {c.name}</option>
              ))}
            </select>
          </div>

          {error && (
            <p className="rounded-xl border-[2px] border-red-300 bg-red-50 px-3 py-2 text-xs font-bold text-red-600">{error}</p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="mt-1 rounded-full border-[3px] border-ink py-2.5 text-sm font-extrabold text-white transition-transform hover:-translate-y-0.5 disabled:opacity-60"
            style={{ background: '#22C55E', borderBottomWidth: 5, borderRightWidth: 4 }}
          >
            {submitting ? '…' : 'Save & Continue'}
          </button>
        </form>
      </div>
    </div>
  );
}
