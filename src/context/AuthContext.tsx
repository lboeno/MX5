import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";
import { getCurrentProfile, type Profile } from "../lib/auth";
import { isAdminRole } from "../lib/roles";

const PROFILE_RETRY_ATTEMPTS = 5;
const PROFILE_RETRY_INTERVAL_MS = 500;

export type ProfileStatus = "ready" | "missing" | "error";

interface AuthState {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  profileStatus: ProfileStatus;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
  isAdmin: boolean;
  hasRole: (role: string) => boolean;
  hasAnyRole: (roles: string[]) => boolean;
}

const AuthContext = createContext<AuthState>({} as AuthState);

async function waitForProfile(userId: string): Promise<Profile | null> {
  for (let i = 0; i < PROFILE_RETRY_ATTEMPTS; i++) {
    const p = await getCurrentProfile(userId);
    if (p) return p;
    if (i < PROFILE_RETRY_ATTEMPTS - 1) {
      await new Promise((r) => setTimeout(r, PROFILE_RETRY_INTERVAL_MS));
    }
  }
  return null;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileStatus, setProfileStatus] = useState<ProfileStatus>("ready");
  const pendingPromise = useRef<Promise<void> | null>(null);

  const loadAuthState = useCallback(async (currentUser?: User | null) => {
    if (pendingPromise.current) {
      return pendingPromise.current;
    }

    const promise = (async () => {
      setLoading(true);

      try {
        const u = currentUser ?? (await supabase.auth.getUser()).data.user;

        if (!u) {
          setUser(null);
          setProfile(null);
          setProfileStatus("ready");
          setLoading(false);
          return;
        }

        setUser(u);

        let p = await getCurrentProfile(u.id);

        if (!p) {
          p = await waitForProfile(u.id);
        }

        if (p) {
          setProfile(p);
          setProfileStatus("ready");
        } else {
          setProfile(null);
          setProfileStatus("missing");
        }
      } catch (err) {
        console.error("[Auth] Erro ao carregar perfil:", err);
        setProfile(null);
        setProfileStatus("error");
      } finally {
        setLoading(false);
        pendingPromise.current = null;
      }
    })();

    pendingPromise.current = promise;
    return promise;
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      loadAuthState(session?.user);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      loadAuthState(session?.user);
    });

    return () => subscription.unsubscribe();
  }, [loadAuthState]);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setProfileStatus("ready");
    setLoading(false);
  };

  const isAuthenticated = !!user;
  const isAdmin = isAdminRole(profile?.role);
  const hasRole = (role: string) => profile?.role === role;
  const hasAnyRole = (roles: string[]) => !!profile && roles.includes(profile.role);

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        profileStatus,
        refreshProfile: () => loadAuthState(user),
        signOut,
        isAuthenticated,
        isAdmin,
        hasRole,
        hasAnyRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
