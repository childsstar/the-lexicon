"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import { getSupabaseClient } from "@/lib/supabase";
import { fetchProfile } from "@/lib/profiles";
import type { Profile } from "@/lib/types";
import { useActiveUniverse } from "@/components/active-universe-provider";

// NOTE: email/password only for v0.1. Supabase also supports Discord OAuth
// (signInWithOAuth({ provider: "discord" })) — add it soon; it only needs the
// provider enabled in the Supabase dashboard, no code secrets in this repo.

type AuthState = {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  /** True until the initial session + profile fetch settles. */
  loading: boolean;
  /** Set when Supabase env vars are missing — auth can't work at all. */
  configError: string | null;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { reset: resetActiveUniverse } = useActiveUniverse();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [configError, setConfigError] = useState<string | null>(null);

  useEffect(() => {
    let supabase;
    try {
      supabase = getSupabaseClient();
    } catch (err) {
      setConfigError(err instanceof Error ? err.message : String(err));
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function syncSession(nextSession: Session | null) {
      if (cancelled) return;
      const nextUser = nextSession?.user ?? null;
      setSession(nextSession);
      setUser(nextUser);
      if (!nextUser) {
        setProfile(null);
        setLoading(false);
        return;
      }
      const nextProfile = await fetchProfile(supabase!, nextUser.id);
      if (!cancelled) {
        setProfile(nextProfile);
        setLoading(false);
      }
    }

    supabase.auth.getSession().then(({ data }) => {
      void syncSession(data.session ?? null);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        void syncSession(session ?? null);
      }
    );

    return () => {
      cancelled = true;
      listener.subscription.unsubscribe();
    };
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!user) return;
    const supabase = getSupabaseClient();
    setProfile(await fetchProfile(supabase, user.id));
  }, [user]);

  const signOut = useCallback(async () => {
    const supabase = getSupabaseClient();
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
    setProfile(null);
    // A stale realm/game selection from this session shouldn't greet
    // whoever's logged out (or the next person on a shared device) —
    // back to "All Warhammer" until someone picks otherwise.
    resetActiveUniverse();
  }, [resetActiveUniverse]);

  return (
    <AuthContext.Provider
      value={{ user, session, profile, loading, configError, refreshProfile, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside <AuthProvider>");
  }
  return ctx;
}
