import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Reusable browser-safe Supabase client.
 *
 * Uses only the public URL and anon key (safe to expose to the browser —
 * access control is enforced by Row Level Security in Postgres). The service
 * role key must never be used here.
 */
let client: SupabaseClient | undefined;

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
    client = createClient(url, anonKey);
  }
  return client;
}
