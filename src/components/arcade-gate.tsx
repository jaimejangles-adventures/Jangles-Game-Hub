import { useState, useCallback, type ReactNode } from 'react';
import { Link } from '@tanstack/react-router';
import { useAuth } from '@/lib/auth-context';
import { useBucksContext } from '@/lib/bucks-context';
import { ArcadeSessionContext } from '@/lib/arcade-session-context';
import { asset } from '@/lib/asset';

type Props = {
  gameSlug: string;
  gameTitle: string;
  gameEmoji: string;
  children: ReactNode;
};

const isDev = import.meta.env.DEV;
const GUEST_PLAYS_KEY = 'jj-guest-arcade-plays';
const GUEST_MAX = 3;

function getGuestPlays(): number {
  try {
    const raw = localStorage.getItem(GUEST_PLAYS_KEY);
    if (!raw) return 0;
    const { date, count } = JSON.parse(raw);
    const today = new Date().toISOString().slice(0, 10);
    return date === today ? (count as number) : 0;
  } catch {
    return 0;
  }
}

function incrementGuestPlays(): number {
  const today = new Date().toISOString().slice(0, 10);
  const next = getGuestPlays() + 1;
  localStorage.setItem(GUEST_PLAYS_KEY, JSON.stringify({ date: today, count: next }));
  return next;
}

export function ArcadeGate({ gameSlug, gameTitle, gameEmoji, children }: Props) {
  const { user, openAuthModal } = useAuth();
  const { balance, spendBuck } = useBucksContext();
  const [sessionActive, setSessionActive] = useState(isDev);
  const [spending, setSpending] = useState(false);
  const [error, setError] = useState(false);
  const [guestPlays, setGuestPlays] = useState(getGuestPlays);

  const endSession = useCallback(() => {
    setSessionActive(isDev);
    setGuestPlays(getGuestPlays());
  }, []);

  if (sessionActive) {
    return (
      <ArcadeSessionContext.Provider value={{ endSession }}>
        {children}
      </ArcadeSessionContext.Provider>
    );
  }

  async function handlePlay() {
    setSpending(true);
    setError(false);
    const ok = await spendBuck(gameSlug);
    if (ok) {
      setSessionActive(true);
    } else {
      setError(true);
      setSpending(false);
    }
  }

  function handleGuestPlay() {
    incrementGuestPlays();
    setSessionActive(true);
  }

  const guestOut = guestPlays >= GUEST_MAX;

  return (
    <div
      className="flex h-full flex-col items-center justify-center px-4"
      style={{ background: "linear-gradient(135deg, #fffbf0 0%, #fff7e0 100%)" }}
    >
      <div
        className="flex flex-col items-center gap-5 rounded-[2rem] border-[3px] border-ink bg-paper px-8 py-8 text-center"
        style={{ borderBottomWidth: 7, borderRightWidth: 6, maxWidth: "22rem", width: "90vw" }}
      >
        {/* Coin icon */}
        <div style={{ fontSize: "3.5rem", lineHeight: 1 }}>🕹️</div>

        <div>
          <div
            className="inline-flex items-center gap-1.5 rounded-full border-[2px] border-ink px-3 py-0.5 text-[0.6rem] font-extrabold uppercase tracking-[0.25em] mb-3"
            style={{ background: "#22C55E", borderBottomWidth: 4, borderRightWidth: 3, color: "#fff" }}
          >
            🕹️ Arcade Adventures
          </div>
          <h2 className="text-xl font-extrabold leading-snug text-ink">
            {gameEmoji} {gameTitle}
          </h2>
        </div>

        {/* Guest (not logged in) */}
        {!user && !guestOut && (
          <>
            {guestPlays > 0 && (
              <div
                className="flex items-center gap-2 rounded-full border-[2px] border-ink px-4 py-1.5 text-sm font-extrabold"
                style={{ background: "#FEF3C7", borderBottomWidth: 4, borderRightWidth: 3 }}
              >
                <img src={asset("/art/jangles-buck.png")} alt="Jangles Buck" className="h-5 w-5 object-contain" /> {guestPlays} of {GUEST_MAX} free plays used today
              </div>
            )}
            {guestPlays === 0 && (
              <p className="text-sm font-bold text-ink/70 leading-snug">
                You get <strong>3 free plays</strong> a day!<br />
                Sign up to earn coins and play unlimited.
              </p>
            )}
            <button
              onClick={handleGuestPlay}
              className="rounded-full border-[3px] border-ink px-8 py-3 text-base font-extrabold text-white transition-transform hover:-translate-y-0.5"
              style={{ background: "#22C55E", borderBottomWidth: 5, borderRightWidth: 4 }}
            >
              Play Free!
            </button>
            <div className="flex flex-col gap-2 w-full">
              <button
                onClick={() => openAuthModal('sign-up')}
                className="rounded-full border-[3px] border-ink px-6 py-2.5 text-sm font-extrabold text-white transition-transform hover:-translate-y-0.5"
                style={{ background: "#3B82F6", borderBottomWidth: 5, borderRightWidth: 4 }}
              >
                Sign Up Free
              </button>
              <button
                onClick={() => openAuthModal('sign-in')}
                className="rounded-full border-[3px] border-ink bg-white px-6 py-2.5 text-sm font-extrabold text-ink transition-transform hover:-translate-y-0.5"
                style={{ borderBottomWidth: 5, borderRightWidth: 4 }}
              >
                Sign In
              </button>
            </div>
          </>
        )}

        {/* Guest — out of free plays */}
        {!user && guestOut && (
          <>
            <div
              className="flex items-center gap-2 rounded-full border-[2px] border-ink px-4 py-1.5 text-sm font-extrabold"
              style={{ background: "#FEE2E2", borderBottomWidth: 4, borderRightWidth: 3, color: "#dc2626" }}
            >
              3 of 3 free plays used!
            </div>
            <p className="text-sm font-bold text-ink/70 leading-snug">
              You're all out for today.<br />
              Sign up to earn coins and play as much as you want!
            </p>
            <div className="flex flex-col gap-2 w-full">
              <button
                onClick={() => openAuthModal('sign-up')}
                className="rounded-full border-[3px] border-ink px-6 py-2.5 text-sm font-extrabold text-white transition-transform hover:-translate-y-0.5"
                style={{ background: "#22C55E", borderBottomWidth: 5, borderRightWidth: 4 }}
              >
                Sign Up Free
              </button>
              <button
                onClick={() => openAuthModal('sign-in')}
                className="rounded-full border-[3px] border-ink bg-white px-6 py-2.5 text-sm font-extrabold text-ink transition-transform hover:-translate-y-0.5"
                style={{ borderBottomWidth: 5, borderRightWidth: 4 }}
              >
                Sign In
              </button>
              <Link
                to="/"
                className="rounded-full border-[3px] border-ink px-6 py-2.5 text-sm font-extrabold text-ink/60 bg-white transition-transform hover:-translate-y-0.5"
                style={{ borderBottomWidth: 5, borderRightWidth: 4 }}
              >
                Come back tomorrow →
              </Link>
            </div>
          </>
        )}

        {/* Logged in — no bucks */}
        {user && balance < 1 && (
          <>
            <p className="text-sm font-bold text-ink/70 leading-snug">
              You need <strong>1 Jangles Buck</strong> to play!<br />
              Go play a learning game to earn one, then come back.
            </p>
            <div
              className="flex items-center gap-2 rounded-full border-[2px] border-ink/30 bg-yellow-100 px-4 py-2 text-sm font-extrabold text-ink/60"
            >
              <img src={asset("/art/jangles-buck.png")} alt="Jangles Buck" className="h-5 w-5 object-contain" /> 0 Jangles Bucks
            </div>
            <Link
              to="/"
              className="rounded-full border-[3px] border-ink px-6 py-2.5 text-sm font-extrabold text-white transition-transform hover:-translate-y-0.5"
              style={{ background: "#3B82F6", borderBottomWidth: 5, borderRightWidth: 4 }}
            >
              Go earn bucks →
            </Link>
          </>
        )}

        {/* Logged in — has bucks */}
        {user && balance >= 1 && (
          <>
            <div className="flex items-center gap-2">
              <div
                className="flex items-center gap-1.5 rounded-full border-[2px] border-ink bg-yellow-300 px-3 py-1 text-sm font-extrabold"
                style={{ borderBottomWidth: 4, borderRightWidth: 3 }}
              >
                <img src={asset("/art/jangles-buck.png")} alt="Jangles Buck" className="h-5 w-5 object-contain" /> {balance} buck{balance !== 1 ? 's' : ''}
              </div>
              <span className="text-ink/40 text-sm font-bold">→</span>
              <div
                className="flex items-center gap-1.5 rounded-full border-[2px] border-ink/30 bg-white px-3 py-1 text-sm font-extrabold text-ink/50"
              >
                <img src={asset("/art/jangles-buck.png")} alt="Jangles Buck" className="h-5 w-5 object-contain" /> {balance - 1} left
              </div>
            </div>
            <p className="text-[0.75rem] font-bold text-ink/50 -mt-2">
              1 buck per arcade session
            </p>
            {error && (
              <p className="text-xs font-bold text-red-500">Something went wrong — try again!</p>
            )}
            <button
              onClick={handlePlay}
              disabled={spending}
              className="rounded-full border-[3px] border-ink px-8 py-3 text-base font-extrabold text-white transition-transform hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ background: "#22C55E", borderBottomWidth: 5, borderRightWidth: 4 }}
            >
              {spending ? "Starting…" : "Play!"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
