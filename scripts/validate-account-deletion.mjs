import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const route = readFileSync(new URL("../app/api/account/delete/route.ts", import.meta.url), "utf8");
const profile = readFileSync(new URL("../app/(app)/profile/profile-client.tsx", import.meta.url), "utf8");
const migration = readFileSync(new URL("../supabase/migrations/20260706010000_account_lifecycle.sql", import.meta.url), "utf8");

// --- runtime & config surface --------------------------------------------
assert.match(route, /export const runtime = "nodejs";/, "delete route pins the Node.js runtime so the service role key is never read on Edge");
assert.match(route, /process\.env\.SUPABASE_SERVICE_ROLE_KEY/, "route reads the server-only SUPABASE_SERVICE_ROLE_KEY env var");
assert.doesNotMatch(route, /NEXT_PUBLIC_.*SERVICE_ROLE/, "the service role key must never be read from a NEXT_PUBLIC_ (browser-exposed) env var");

// --- auth is required before deletion, independent of admin config -------
const authCheckIndex = route.indexOf("userClient.auth.getUser()");
const serviceKeyCheckIndex = route.indexOf("if (!serviceRoleKey)");
assert.ok(authCheckIndex > -1, "route checks the caller's session");
assert.ok(serviceKeyCheckIndex > authCheckIndex, "session is validated before the service-role key is required, so unauthenticated requests always get 401 regardless of server config");
assert.match(route, /Sign in before deleting your account\./, "unauthenticated requests get a clear, safe message");
assert.match(route, /status: 401/, "unauthenticated requests are rejected with 401");

// --- missing service role key: safe prod copy, detailed dev copy ---------
assert.doesNotMatch(
  route,
  /error:\s*"Supabase service role key is not configured\."/,
  "the raw technical banner must not be sent straight to the client anymore"
);
assert.match(route, /isProduction \? UNAVAILABLE_MESSAGE : devHint/, "missing config responses branch on NODE_ENV");
assert.match(route, /Account deletion is temporarily unavailable\. Please try again later\./, "production copy is user-friendly and non-technical");
assert.match(route, /SUPABASE_SERVICE_ROLE_KEY is missing/, "development copy names the missing env var for the developer");
assert.match(route, /console\.error\(\s*\n?\s*`\[account\/delete\]/, "a helpful setup message is logged server-side when config is missing");

// --- deletion order: data first, then the Auth user, then partial-failure state
const dataDeleteIndex = route.indexOf("delete_account_owned_data");
const authDeleteIndex = route.indexOf("adminClient.auth.admin.deleteUser(userId)");
assert.ok(dataDeleteIndex > -1 && authDeleteIndex > -1, "route deletes owned data and the Auth user");
assert.ok(authDeleteIndex > dataDeleteIndex, "user-owned data is deleted before the Supabase Auth user");
assert.match(route, /PARTIAL_FAILURE_MESSAGE/, "a distinct message exists for the partial-failure case (data gone, auth user still present)");
assert.match(route, /Manual cleanup required in the/, "partial failures are logged with enough detail to finish manually");

// --- data cleanup happens under the calling user's RLS-scoped client -----
assert.match(route, /userClient\.rpc\("delete_account_owned_data"/, "owned-data cleanup runs as the authenticated user, not the admin client");
assert.match(migration, /auth\.uid\(\) is distinct from target_user_id/, "the cleanup function refuses to delete another user's data");

// --- UI: confirmation flow and error display are preserved ----------------
assert.match(profile, /Type DELETE to confirm\./, "confirmation copy still requires typing DELETE");
assert.match(profile, /disabled=\{deleteText !== "DELETE" \|\| deleting\}/, "confirm button stays disabled until DELETE is typed, with a visible reason (the input hint), not a silent disable");
assert.match(profile, /onClick=\{\(\) => \{\s*setDeleteText\(""\);\s*setConfirmingDelete\(true\);\s*\}\}/, "Delete Account button opens the confirmation modal");
assert.doesNotMatch(profile, /service role key/i, "the client no longer needs to special-case the old technical banner text");
assert.match(profile, /throw new Error\(payload\.error \?\? "Account deletion failed\."\)/, "the UI surfaces whatever safe message the server returns (prod-safe copy in prod, detailed copy in dev)");
assert.match(profile, /setAccountError\(err instanceof Error \? err\.message : String\(err\)\)/, "delete errors are shown to the user via the account error banner");
assert.match(profile, /await signOut\(\);\s*window\.location\.assign\("\/"\)/, "successful deletion signs the user out and redirects to the landing page");

console.log("Account deletion validation passed");
