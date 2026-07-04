"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import type { User } from "@supabase/supabase-js";
import { getSupabaseClient } from "@/lib/supabase";
import { fetchProfile } from "@/lib/profiles";
import type { Profile } from "@/lib/types";

// NOTE: email/password only for v0.1. Supabase also supports Discord OAuth
// (signInWithOAuth({ provider: "discord" })) — add it soon; it only needs the
// provider enabled in the Supabase dashboard, no code secrets in this repo.

type AuthState = {
  user: User | null;
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
  const [user, setUser] = useState<User | null>(null);
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

    async function syncUser(nextUser: User | null) {
      if (cancelled) return;
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
      void syncUser(data.session?.user ?? null);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        void syncUser(session?.user ?? null);
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
    setUser(null);
    setProfile(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, profile, loading, configError, refreshProfile, signOut }}
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
