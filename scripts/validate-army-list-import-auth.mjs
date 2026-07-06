import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const importer = readFileSync(new URL("../app/(app)/profile/army-lists/import/import-army-list-client.tsx", import.meta.url), "utf8");
const provider = readFileSync(new URL("../components/auth-provider.tsx", import.meta.url), "utf8");
const route = readFileSync(new URL("../app/api/army-lists/route.ts", import.meta.url), "utf8");
const profile = readFileSync(new URL("../app/(app)/profile/profile-client.tsx", import.meta.url), "utf8");
const shell = readFileSync(new URL("../components/app-shell.tsx", import.meta.url), "utf8");

assert.match(shell, /href="\/profile"[\s\S]*aria-label="Profile"/, "app shell exposes profile entrypoint for signed-in app users");
assert.match(profile, /const \{ user, profile, refreshProfile, signOut \} = useAuth\(\)/, "profile page reads shared auth state");
assert.match(provider, /session: Session \| null/, "auth provider exposes the resolved Supabase session");
assert.match(provider, /syncSession\(data\.session \?\? null\)/, "auth provider resolves initial session before clearing loading");

assert.match(importer, /const \{ user, profile, session, loading \} = useAuth\(\)/, "importer uses shared auth hook state");
assert.doesNotMatch(importer, /supabase\.auth\.getSession\(\)/, "importer does not run a local placeholder session check");
assert.match(importer, /loading && \([\s\S]*Checking your Lexicon session/, "loading session shows a neutral state");
assert.match(importer, /!loading && !user[\s\S]*Sign in to import an army list\./, "unauthenticated user sees sign-in warning only after loading");
assert.match(importer, /!loading && user[\s\S]*This import will be saved to/, "authenticated user sees saved-to-profile confirmation instead of warning");
assert.match(importer, /disabled=\{submitting \|\| loading \|\| !user\}/, "import is disabled until session is authenticated");
assert.match(importer, /authorization: `Bearer \$\{token\}`/, "authenticated imports send the shared session token to API");

assert.match(route, /user_id: userData\.user\.id/, "saved army lists are scoped to authenticated user");
assert.match(route, /profile_id: userData\.user\.id/, "saved army lists are associated with current profile");

console.log("Army list import auth validation passed");
