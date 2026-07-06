import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const muster = readFileSync(new URL("../app/(app)/armies/muster/muster-army-client.tsx", import.meta.url), "utf8");
const provider = readFileSync(new URL("../components/auth-provider.tsx", import.meta.url), "utf8");
const route = readFileSync(new URL("../app/api/army-lists/route.ts", import.meta.url), "utf8");
const profile = readFileSync(new URL("../app/(app)/profile/profile-client.tsx", import.meta.url), "utf8");
const shell = readFileSync(new URL("../components/app-shell.tsx", import.meta.url), "utf8");

assert.match(shell, /href="\/profile"[\s\S]*aria-label="Profile"/, "app shell exposes profile entrypoint for signed-in app users");
assert.match(profile, /const \{ user, profile, refreshProfile, signOut \} = useAuth\(\)/, "profile page reads shared auth state");
assert.match(profile, /href="\/armies\/muster"/, "profile page links to the Muster an Army flow");
assert.match(provider, /session: Session \| null/, "auth provider exposes the resolved Supabase session");
assert.match(provider, /syncSession\(data\.session \?\? null\)/, "auth provider resolves initial session before clearing loading");

// The Muster page must read the same shared auth/session provider as the
// rest of the app shell — no local placeholder session checks, and no
// flashing a sign-in message while the session is still loading.
assert.match(muster, /const \{ user, profile, session, loading \} = useAuth\(\)/, "muster client uses shared auth hook state");
assert.doesNotMatch(muster, /supabase\.auth\.getSession\(\)/, "muster client does not run a local placeholder session check");
assert.match(muster, /loading && \([\s\S]*Checking your Lexicon session/, "loading session shows a neutral state, not a sign-in warning");
assert.match(muster, /!loading && !user[\s\S]*Sign in to muster an army\./, "unauthenticated user sees a sign-in CTA only after loading settles");
assert.match(muster, /!loading && !user[\s\S]*href="\/sign-in"/, "unauthenticated user sees a clear sign-in CTA link");
assert.match(muster, /!loading && user[\s\S]*This army will be saved to/, "authenticated user sees saved-to-profile confirmation instead of a warning");
assert.match(muster, /disabled=\{submitting \|\| loading \|\| !user\}/, "muster submit is disabled until the session resolves to an authenticated user");
assert.match(muster, /authorization: `Bearer \$\{token\}`/, "authenticated musters send the shared session token to the API");

assert.match(route, /user_id: userData\.user\.id/, "saved armies are scoped to the authenticated user");
assert.match(route, /profile_id: userData\.user\.id/, "saved armies are associated with the current profile");
assert.match(route, /Sign in to muster an army\./, "the API rejects unauthenticated saves with a clear message");

console.log("Army list import auth validation passed");
