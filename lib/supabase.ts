import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Reusable browser-safe Supabase client.
 *
 * Uses only the public URL and anon key (safe to expose to the browser —
 * access control is enforced by Row Level Security in Postgres). The service
 * role key must never be used here.
 */
let client: SupabaseClient | undefined;

const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

function getProjectRef(url: string): string | null {
  try {
    return new URL(url).hostname.split(".")[0] ?? null;
  } catch {
    return null;
  }
}

export function getSupabaseStorageKey(url: string): string {
  const projectRef = getProjectRef(url);
  return projectRef ? `sb-${projectRef}-auth-token` : "supabase.auth.token";
}

type SupabaseStorage = {
  isServer?: boolean;
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
  removeItem: (key: string) => void;
};

function createBrowserCookieStorage(): SupabaseStorage {
  return {
    getItem(key) {
      if (typeof document === "undefined") return null;
      const cookie = document.cookie
        .split("; ")
        .find((row) => row.startsWith(`${key}=`));
      if (cookie) {
        return decodeURIComponent(cookie.split("=").slice(1).join("="));
      }
      return window.localStorage.getItem(key);
    },
    setItem(key, value) {
      if (typeof document === "undefined") return;
      document.cookie = `${key}=${encodeURIComponent(value)}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;
      window.localStorage.setItem(key, value);
    },
    removeItem(key) {
      if (typeof document === "undefined") return;
      document.cookie = `${key}=; path=/; max-age=0; SameSite=Lax`;
      window.localStorage.removeItem(key);
    },
  };
}

export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

export function getSupabaseClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and " +
        "NEXT_PUBLIC_SUPABASE_ANON_KEY in your environment (Netlify site " +
        "settings, or a local .env.local file)."
    );
  }

  if (!client) {
    client = createClient(url, anonKey, {
      auth: {
        storage: createBrowserCookieStorage(),
        storageKey: getSupabaseStorageKey(url),
        flowType: "pkce",
      },
    });
  }
  return client;
}
