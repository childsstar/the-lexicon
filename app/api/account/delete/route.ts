import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getBearerToken } from "@/lib/supabase-server";

// The Supabase Admin API (and the service role key it needs) must only ever
// run server-side. Pinning this route to the Node.js runtime keeps it off
// the Edge runtime, where env access and the Admin SDK behave differently.
export const runtime = "nodejs";

const isProduction = process.env.NODE_ENV === "production";

const UNAVAILABLE_MESSAGE =
  "Account deletion is temporarily unavailable. Please try again later.";
const DELETE_FAILED_MESSAGE =
  "We couldn't delete your account. Please try again or contact support.";
const PARTIAL_FAILURE_MESSAGE =
  "Your Lexicon data was removed, but we couldn't finish closing your account. Please contact support so we can complete it.";

function missingConfigResponse(missingVar: string, devHint: string) {
  console.error(
    `[account/delete] ${missingVar} is not set. Add it as a server-only ` +
      "environment variable (never prefix it with NEXT_PUBLIC_) in your " +
      "deployment settings and redeploy, then restart `npm run dev` locally."
  );
  const message = isProduction ? UNAVAILABLE_MESSAGE : devHint;
  return NextResponse.json({ error: message }, { status: 500 });
}

export async function POST(request: Request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  // The caller's JWT is attached under the capital `Authorization` key so it
  // overwrites (rather than collides with) the anon-key header the auth
  // client sets internally — see lib/supabase-server.ts for the full story.
  const token = getBearerToken(request);

  if (!url || !anonKey) {
    return missingConfigResponse(
      "NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY",
      "Account deletion is not configured: Supabase URL/anon key are missing. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local."
    );
  }

  const userClient = createClient(url, anonKey, {
    global: { headers: token ? { Authorization: `Bearer ${token}` } : {} },
    auth: { persistSession: false },
  });

  // Require a valid authenticated session before anything else — this check
  // must succeed on the anon key alone, independent of admin configuration.
  // The token is passed explicitly (not the no-arg getUser()) so it is
  // actually validated instead of read from a session this client never has.
  const { data: userData, error: userError } = token
    ? await userClient.auth.getUser(token)
    : { data: { user: null }, error: new Error("Missing bearer token") };
  if (userError || !userData.user) {
    return NextResponse.json(
      { error: "Sign in before deleting your account." },
      { status: 401 }
    );
  }

  if (!serviceRoleKey) {
    return missingConfigResponse(
      "SUPABASE_SERVICE_ROLE_KEY",
      "Account deletion is not configured: SUPABASE_SERVICE_ROLE_KEY is missing. Add it to .env.local (server-only) and restart the dev server."
    );
  }

  const userId = userData.user.id;
  const adminClient = createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  // Delete/anonymize user-owned Lexicon data first so nothing is orphaned
  // if the Auth user disappears out from under it.
  const { error: dataError } = await userClient.rpc("delete_account_owned_data", {
    target_user_id: userId,
  });
  if (dataError) {
    console.error(
      `[account/delete] Failed to delete owned data for user ${userId}:`,
      dataError
    );
    return NextResponse.json({ error: DELETE_FAILED_MESSAGE }, { status: 500 });
  }

  // Then remove the Supabase Auth user itself.
  const { error: authDeleteError } = await adminClient.auth.admin.deleteUser(userId);
  if (authDeleteError) {
    console.error(
      `[account/delete] Deleted owned data for user ${userId} but failed to ` +
        "delete the Supabase Auth user. Manual cleanup required in the " +
        "Supabase dashboard (Authentication → Users).",
      authDeleteError
    );
    return NextResponse.json({ error: PARTIAL_FAILURE_MESSAGE }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
