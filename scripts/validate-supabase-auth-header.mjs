import assert from "node:assert/strict";
import { createClient } from "@supabase/supabase-js";

// Regression guard for the "signed-in user not recognized when saving"
// bug. The API routes build a stateless Supabase client that acts as the
// caller and then validate them with getUser(). The Supabase auth client
// seeds its OWN `Authorization: Bearer <anon key>` header internally; if the
// user token is attached under a different-cased key, both survive into the
// GET /auth/v1/user request and collide, so GoTrue reads the anon token and
// returns 401 — the app then tells a signed-in user to "Sign in". This test
// exercises the real @supabase/supabase-js behavior and pins the fix.

const URL = "https://example.supabase.co";
const ANON = "anon.jwt.key";
const USER = "USER_ACCESS_TOKEN";

async function captureUserAuthHeader(clientHeaders, callGetUser) {
  let captured;
  const fetch = async (input, init = {}) => {
    const url = typeof input === "string" ? input : input.url;
    if (url.includes("/auth/v1/user")) {
      captured = new Headers(init.headers).get("authorization");
    }
    return new Response(JSON.stringify({ id: "u1", aud: "authenticated" }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  };
  const client = createClient(URL, ANON, {
    global: { headers: clientHeaders, fetch },
    auth: { persistSession: false, autoRefreshToken: false },
  });
  await callGetUser(client);
  return captured;
}

// Sanity: the OLD pattern (lowercase `authorization` header + getUser() with
// no argument) collides the user token with the anon key into one malformed
// header — reproducing the production 401.
const oldHeader = await captureUserAuthHeader(
  { authorization: `Bearer ${USER}` },
  (client) => client.auth.getUser()
);
assert.ok(
  oldHeader && oldHeader.includes(ANON) && oldHeader.includes(USER),
  `sanity: the old pattern should collide anon+user tokens (got ${JSON.stringify(oldHeader)})`
);

// The FIX (capital `Authorization` header + getUser(token)) must send exactly
// the user's Bearer token, with no anon-key collision, so GoTrue validates
// the real user. This mirrors how lib/supabase-server.ts builds its client.
const fixedHeader = await captureUserAuthHeader(
  { Authorization: `Bearer ${USER}` },
  (client) => client.auth.getUser(USER)
);
assert.equal(
  fixedHeader,
  `Bearer ${USER}`,
  `the fixed auth path must send a single clean user Bearer token (got ${JSON.stringify(fixedHeader)})`
);
assert.ok(
  !fixedHeader.includes(ANON),
  "the fixed auth path must not leak the anon key into the user-validation call"
);

console.log("Supabase auth header (sign-in recognition) validation passed");
