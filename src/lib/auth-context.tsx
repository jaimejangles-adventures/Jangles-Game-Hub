import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type { User } from '@supabase/supabase-js';
import { isSupabaseConfigured, supabase, type Profile } from './supabase';
import { AuthModal, CompleteProfileModal, EditProfileModal } from '@/components/auth-modal';

type AuthContextType = {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  openAuthModal: (mode?: 'sign-in' | 'sign-up') => void;
  openEditProfile: () => void;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: false,
  openAuthModal: () => {},
  openEditProfile: () => {},
  signOut: () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

async function fetchProfile(userId: string): Promise<Profile | null> {
  const { data } = await supabase
    .from('profiles')
    .select('id, username, country_code')
    .eq('id', userId)
    .maybeSingle();
  return data ?? null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'sign-in' | 'sign-up'>('sign-in');
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [needsProfile, setNeedsProfile] = useState(false);
  const profileCache = useRef<Record<string, Profile>>({});

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      const u = session?.user ?? null;
      setUser(u);
      if (u) {
        let p: Profile | null = profileCache.current[u.id] ?? (await fetchProfile(u.id));
        if (!p) p = await tryPendingProfile(u.id);
        if (p) profileCache.current[u.id] = p;
        setProfile(p);
        if (!p) setNeedsProfile(true);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      const u = session?.user ?? null;
      setUser(u);
      if (u) {
        let p: Profile | null = profileCache.current[u.id] ?? (await fetchProfile(u.id));
        if (!p) p = await tryPendingProfile(u.id);
        if (p) profileCache.current[u.id] = p;
        setProfile(p);
        if (!p) setNeedsProfile(true);
      } else {
        setProfile(null);
        setNeedsProfile(false);
      }
      if (event === 'SIGNED_IN') setModalOpen(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const openAuthModal = useCallback((mode: 'sign-in' | 'sign-up' = 'sign-in') => {
    setModalMode(mode);
    setModalOpen(true);
  }, []);

  const openEditProfile = useCallback(() => {
    setEditProfileOpen(true);
  }, []);

  const signOut = useCallback(async () => {
    if (!isSupabaseConfigured) return;
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setNeedsProfile(false);
  }, []);

  const handleProfileCreated = useCallback((p: Profile) => {
    profileCache.current[p.id] = p;
    setProfile(p);
    setNeedsProfile(false);
  }, []);

  const handleProfileUpdated = useCallback((p: Profile) => {
    profileCache.current[p.id] = p;
    setProfile(p);
    setEditProfileOpen(false);
  }, []);

  return (
    <AuthContext.Provider value={{ user, profile, loading, openAuthModal, openEditProfile, signOut }}>
      {children}
      {isSupabaseConfigured && (
        <>
          <AuthModal
            open={modalOpen}
            mode={modalMode}
            onClose={() => setModalOpen(false)}
            onModeChange={setModalMode}
            onProfileCreated={handleProfileCreated}
          />
          {needsProfile && user && (
            <CompleteProfileModal
              userId={user.id}
              authEmail={user.email}
              onProfileCreated={handleProfileCreated}
            />
          )}
          {editProfileOpen && profile && (
            <EditProfileModal
              profile={profile}
              onClose={() => setEditProfileOpen(false)}
              onProfileUpdated={handleProfileUpdated}
            />
          )}
        </>
      )}
    </AuthContext.Provider>
  );
}

async function tryPendingProfile(userId: string): Promise<Profile | null> {
  try {
    const pending = localStorage.getItem('pending_profile');
    if (!pending) return null;
    const { username, country_code, auth_email } = JSON.parse(pending);
    const { error } = await supabase.from('profiles').insert({
      id: userId,
      username,
      country_code,
      ...(auth_email ? { auth_email } : {}),
    });
    if (!error) {
      localStorage.removeItem('pending_profile');
      return { id: userId, username, country_code };
    }
  } catch { /* silent */ }
  return null;
}
