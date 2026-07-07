import { createClient, type SupabaseClient, type User } from "@supabase/supabase-js";

/**
 * Server-only Supabase helpers for API route handlers.
 *
 * These build a stateless, request-scoped client that acts as the calling
 * user (identified by the Bearer token the browser sends), as opposed to
 * lib/supabase.ts which is the browser-side singleton.
 */

/** Pull the raw JWT out of an incoming request's Authorization header. */
export function getBearerToken(request: Request): string | null {
  const header = request.headers.get("authorization") ?? "";
  const match = header.match(/^Bearer\s+(.+)$/i);
  return match ? match[1].trim() : null;
}

/**
 * A request-scoped Supabase client that acts as the calling user.
 *
 * IMPORTANT — why the header key is capital `Authorization`:
 * the Supabase auth client seeds its own `Authorization: Bearer <anon key>`
 * header internally. If we attach the *user* token under a different-cased
 * key (the old code used lowercase `authorization`), BOTH headers survive
 * into the `GET /auth/v1/user` request and collide. GoTrue then reads the
 * anon token instead of the user's and answers 401 `no_authorization` — which
 * surfaced in the app as "Sign in to muster an army" for users who were, in
 * fact, signed in. Using the same capital key cleanly overwrites the anon
 * default, and that same header is what lets Postgres RLS resolve
 * `auth.uid()` on the queries the route makes afterwards.
 */
export function getSupabaseForRequest(request: Request): {
  supabase: SupabaseClient;
  token: string | null;
} {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) throw new Error("Supabase is not configured.");
  const token = getBearerToken(request);
  const supabase = createClient(url, anonKey, {
    global: { headers: token ? { Authorization: `Bearer ${token}` } : {} },
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return { supabase, token };
}

/**
 * Resolve and validate the calling user for an API route.
 *
 * Passes the token to `getUser()` explicitly rather than relying on its
 * no-argument path, which reads from a stored session this stateless client
 * never has (and which, combined with the header collision above, was the
 * root cause of authenticated routes rejecting signed-in users).
 *
 * Returns the request-scoped client alongside the user so callers can make
 * RLS-scoped queries with the same client.
 */
export async function getRequestUser(request: Request): Promise<{
  supabase: SupabaseClient;
  user: User | null;
}> {
  const { supabase, token } = getSupabaseForRequest(request);
  if (!token) return { supabase, user: null };
  const { data, error } = await supabase.auth.getUser(token);
  return { supabase, user: error ? null : data.user };
}
