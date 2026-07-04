# Discord SSO / Discord Identity Inspection

## Current auth architecture

The Lexicon is a Next.js App Router application using Supabase for auth and database access. Authentication is currently email/password only in the UI, with Supabase browser sessions held client-side by `@supabase/supabase-js` browser storage. There are no server-side auth callbacks, middleware guards, or app API routes for auth today.

Relevant architecture notes:

- Supabase is the auth provider and client library.
- `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are the only browser auth configuration variables.
- The app intentionally avoids service-role credentials in the browser.
- App-shell routes are protected by a client-side guard.
- Current-user state is exposed through `AuthProvider` / `useAuth()`.
- The current session is discovered via `supabase.auth.getSession()` and kept fresh via `supabase.auth.onAuthStateChange()`.
- Sign-out calls `supabase.auth.signOut()` through the auth context.
- Sign-in and sign-up forms redirect users to `/dashboard` or `/profile/setup` after successful auth.
- The README and code already note that Discord OAuth is expected to be added by enabling the Supabase Discord provider and calling `signInWithOAuth({ provider: "discord" })`.

### Current auth routes and flows

| Route / file | Purpose |
| --- | --- |
| `app/(marketing)/sign-in/page.tsx` | Public sign-in page shell. |
| `app/(marketing)/sign-in/sign-in-form.tsx` | Email/password sign-in via `supabase.auth.signInWithPassword()`. |
| `app/(marketing)/sign-up/page.tsx` | Public sign-up page shell. |
| `app/(marketing)/sign-up/sign-up-form.tsx` | Email/password sign-up via `supabase.auth.signUp()`. |
| `app/(app)/layout.tsx` | Wraps app-shell routes in `AuthProvider` and `AuthGuard`. |
| `components/auth-provider.tsx` | Current user, profile, session listener, profile refresh, sign-out. |
| `components/auth-guard.tsx` | Redirects signed-out users to `/sign-in`; redirects signed-in users without complete profiles to `/profile/setup`. |
| `app/(app)/profile/page.tsx` and `app/(app)/profile/profile-client.tsx` | Profile view/edit and sign-out UI. |
| `app/(app)/profile/setup/page.tsx` and `app/(app)/profile/setup/setup-client.tsx` | Required first-run profile setup. |

There are no existing local OAuth callback routes, no Next.js route handlers for auth, and no existing social-login components. The likely MVP path is therefore to lean on Supabase Auth's browser OAuth flow first, then add explicit identity tables/fields and tests around profile behavior.

## User/profile data model

The live user-facing profile model is `public.profiles`, defined in `supabase/schema_v0_1_profiles.sql`, with one profile row per Supabase `auth.users` row. The profile row is not created automatically at auth sign-up; first-run users are routed to `/profile/setup`, where the app upserts the profile.

Current profile fields relevant to Discord identity planning:

| Concern | Current field(s) | Notes |
| --- | --- | --- |
| Stable app user id | `profiles.id` | UUID primary key referencing `auth.users(id)`. |
| Email | Supabase `auth.users.email` only | Not duplicated in `public.profiles`; accessed through Supabase auth user, not profile model. |
| Username / handle | `profiles.username` | Required unique Lexicon handle, lowercase/number/underscore, 3-32 chars. This should remain distinct from Discord identity. |
| Display name | `profiles.display_name` | Optional user-facing name. Should not be overwritten automatically by Discord without user consent. |
| Avatar | `profiles.avatar_url` | Present in schema/type, but not actively edited/displayed as an image in current profile UI. |
| Discord contact handle | `profiles.discord_username` | Free-text contact handle only; currently not verified OAuth identity. |
| Public profile settings | none yet | Current RLS keeps profiles private to their owner. Public discovery is planned but not implemented. |
| Contact preferences | none yet | No structured contact preference flags exist. |
| Profile completion | `profiles.profile_completed_at` plus required `username` and `availability` | `isProfileComplete()` gates app access on username + availability. |

Profile editing currently lives in `components/profile-form.tsx`. It writes `profiles` with `upsert()` and includes a free-text Discord username input. Profile viewing lives in `app/(app)/profile/profile-client.tsx`, where Discord is shown as a row if present.

There is no public profile UI yet. Community pages are placeholder navigation for nearby players and connections, so future public Discord/contact display should be added behind deliberate public-profile/contact-preference controls instead of reusing private profile rows wholesale.

## Frontend auth UI inspection

The sign-in and sign-up UI uses a shared `AuthScreen` centered frame, `field` inputs, `card` panels, gold primary buttons, bordered secondary links, and parchment/ink color tokens. The smallest future CTA insertion point is directly above the email/password form fields in both:

- `app/(marketing)/sign-in/sign-in-form.tsx`
- `app/(marketing)/sign-up/sign-up-form.tsx`

Recommended future UI hierarchy:

1. Primary full-width button: `Continue with Discord`.
2. Small divider such as `or continue with email`.
3. Existing email/password form retained as fallback.

Keep this as a small auth UI component if possible, for example `components/discord-auth-button.tsx` or `components/oauth-provider-button.tsx`, to avoid duplicating OAuth redirect/error behavior across sign-in and sign-up.

## API/session contract

The frontend knows the current signed-in user through Supabase Auth in the browser:

- `AuthProvider` calls `supabase.auth.getSession()` during hydration.
- `AuthProvider` subscribes to `supabase.auth.onAuthStateChange()`.
- `AuthProvider` fetches `public.profiles` for `session.user.id` via `fetchProfile()`.
- `useAuth()` exposes `{ user, profile, loading, configError, refreshProfile, signOut }`.

The current contract is client-side Supabase session storage plus PostgREST/RLS access; it is not token-in-custom-API based and not cookie-based SSR auth. `app/api/chronicle/route.ts` is unrelated to auth/session and does not read the current user.

Future Discord identity/contact fields that app UI may need should be exposed through profile reads or a separate owner-scoped identity table, not through a broad public profile policy. Public discovery APIs should later project only intentional public fields.

## Existing test coverage

No first-party test framework or tests were found. `package.json` has `dev`, `build`, `start`, and `lint` scripts only. There are no local `*.test.*`, `*.spec.*`, Jest, Vitest, or Playwright configuration files outside `node_modules`.

Recommended future test locations/patterns:

- Add unit tests for pure profile helpers such as `isProfileComplete()` and any future Discord identity mappers.
- Add component tests for sign-in/sign-up CTA rendering once a test framework is selected.
- Add integration or e2e tests around Supabase OAuth initiation by mocking `supabase.auth.signInWithOAuth()`.
- Add SQL migration verification tests only if the project adopts Supabase CLI or a migration runner.

Because no test harness exists today, this PR does not add Discord OAuth tests yet. The first implementation PR should either include a minimal test harness or keep the OAuth UI small and manually verifiable.

## Recommended MVP Discord SSO approach

Use Supabase Auth's built-in Discord OAuth provider for the MVP, with Discord as the primary CTA and email/password retained as fallback.

Recommended behavior:

1. Enable Discord provider in Supabase Dashboard.
2. Configure Discord OAuth redirect URLs in Discord Developer Portal and Supabase URL configuration for production and local development.
3. Add a client-side `Continue with Discord` button that calls:
   - `supabase.auth.signInWithOAuth({ provider: "discord", options: { redirectTo: `${window.location.origin}/dashboard` } })` for sign-in/sign-up entry points.
4. Let `AuthGuard` continue to route first-time OAuth users with no profile to `/profile/setup`.
5. Keep email auth available below the Discord CTA.
6. Do not auto-publish Discord handle. Treat Discord identity as private/verified account metadata until the user opts into contact/discovery exposure.

This is straightforward in the current stack because Supabase already owns auth/session state and the app guard already handles newly authenticated users without profiles.


## PR 1 implementation status

Implemented after this inspection:

- Added a reusable `components/discord-auth-button.tsx` client component that starts Supabase Discord OAuth with `supabase.auth.signInWithOAuth({ provider: "discord", options: { redirectTo } })`.
- Added the primary `Continue with Discord` CTA above the email/password forms on sign-in and sign-up.
- Added an `or continue with email` divider while preserving the existing email/password fallback flows.
- Kept Discord setup in external provider configuration only: enable the Discord provider in Supabase Auth, configure Discord OAuth credentials in the Supabase Dashboard, and allow local/production redirect URLs in both Supabase and Discord settings.
- No database changes, account-linking UI, verified Discord badges, contact preferences, public profile exposure, or messaging were added in PR 1.

## Proposed DB changes

Do not store verified Discord identity only in `profiles.discord_username`; that field is free-text contact data and currently user-editable.

Recommended MVP schema addition in a future migration:

```sql
create table public.user_identities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  provider text not null check (provider in ('discord')),
  provider_user_id text not null,
  provider_username text,
  provider_global_name text,
  provider_avatar_url text,
  verified_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (provider, provider_user_id),
  unique (user_id, provider)
);
```

RLS should initially allow only the owning authenticated user to read/manage their identity row. Public Discord badge/display should be derived from `verified_at` but exposed only when future privacy flags allow it.

Potential profile additions for later, separate from OAuth identity:

- `discord_contact_public boolean not null default false`
- `discord_contact_preference text check (...)`
- `public_profile_enabled boolean not null default false`
- `avatar_url` update policy if importing Discord avatar is offered as an explicit user choice

If Supabase Auth already includes linked provider identity data in `auth.users.identities`, the app may not need to duplicate every provider attribute immediately. However, an app-owned `user_identities` table is still recommended for privacy controls, badges, account linking state, and stable public projections without querying auth internals from the browser.

## Proposed routes/controllers/API changes

MVP OAuth initiation can be client-only because the app already uses Supabase browser auth:

- Add a reusable Discord auth button/component.
- Call `signInWithOAuth({ provider: "discord" })` from sign-in and sign-up pages.
- Keep redirect target at `/dashboard`; `AuthGuard` will redirect incomplete profiles to `/profile/setup`.

For account linking and verified Discord badges, add a later authenticated flow:

- Profile settings action: `Link Discord`.
- Call Supabase OAuth with Discord while already signed in, using Supabase account-linking behavior if supported/configured for the project.
- After OAuth returns, refresh `user` and `profile` state.
- Upsert the app-owned `user_identities` row from trusted Supabase auth identity metadata via a server route or Supabase Edge Function if browser access to identity metadata is insufficient.

Potential future app routes/API endpoints:

| Route | Purpose |
| --- | --- |
| `/auth/callback` | Only needed if the app moves to SSR/cookie auth or wants a dedicated post-OAuth landing/error handler. Not required for the simplest browser-only Supabase OAuth flow. |
| `/profile` | Add `Link Discord`, verified badge, and privacy controls. |
| `/api/me` or server action | Only needed if a server-owned identity sync is introduced. |
| `/community/*` APIs | Later expose public discovery fields, never raw private profile/contact fields. |

## Proposed UI changes

First implementation PR:

- Add `Continue with Discord` as the primary CTA on sign-in and sign-up.
- Add an `or continue with email` divider before existing email/password fields.
- Preserve the current email/password forms and confirmation flow.
- In profile UI, replace or supplement free-text Discord username with a clear distinction:
  - `Verified Discord: Linked / Not linked`
  - `Discord contact handle: optional, private by default` or remove free-text public implication until contact preferences exist.

Later profile/discovery UI:

- Verified Discord badge beside profile identity only when OAuth-linked.
- Explicit `Show my Discord to...` preference before any public/contact display.
- Optional `Use Discord avatar` and `Use Discord display name` buttons, never automatic destructive overwrites.

## Security and privacy considerations

- Store Discord user ID as the stable unique identifier; Discord usernames/handles can change.
- Store verified OAuth identity separately from editable profile/display fields.
- Do not make Discord handle public by default.
- Keep `profiles` owner-private until a deliberate public projection/policy exists.
- Do not add Discord client secret to this repository or expose it through `NEXT_PUBLIC_*` variables.
- Configure OAuth redirect allow-lists tightly in Supabase and Discord.
- Treat email and Discord as linkable auth methods for the same app user where possible.
- Avoid automatic account merging based solely on matching email unless Supabase's verified-email/account-linking behavior is well understood and tested.
- Preserve email fallback for users who cannot or do not want to use Discord.
- Do not build messaging/DM features in the Discord SSO work.

## Suggested test plan

Once a test harness exists:

1. Unit-test `isProfileComplete()` and future Discord identity display helpers.
2. Unit-test construction of OAuth redirect options for sign-in and sign-up.
3. Component-test that Discord CTA is primary and email remains available.
4. Mock `supabase.auth.signInWithOAuth()` success and error paths.
5. E2E-test new OAuth users land at `/profile/setup` when no profile exists.
6. E2E-test existing users with complete profiles land at `/dashboard`.
7. Database tests/migration smoke checks for `user_identities` uniqueness and RLS owner isolation.
8. Privacy tests ensuring public discovery does not expose Discord fields unless explicitly opted in.

## Recommended PR breakdown

1. **PR 1: Discord OAuth CTA only**
   - Enable provider outside repo.
   - Add reusable `Continue with Discord` button.
   - Wire `signInWithOAuth({ provider: "discord" })` on sign-in/sign-up.
   - Keep email fallback.
   - No DB changes unless provider metadata must be surfaced immediately.

2. **PR 2: Verified identity storage**
   - Add `user_identities` migration/RLS.
   - Add a sync path from Supabase-authenticated Discord identity metadata.
   - Add profile settings `Linked Discord` state.

3. **PR 3: Account linking and email enrichment**
   - Allow email-first users to link Discord.
   - Allow Discord-first users to add email/password or email auth as needed.
   - Add tests for linking/duplicate-provider behavior.

4. **PR 4: Privacy-aware discovery fields**
   - Add explicit public/contact preferences.
   - Expose verified Discord badge/contact only according to preferences.
   - Add community/player discovery projections.

5. **PR 5+: Discord community/server links**
   - Add server/community associations and verified server links.
   - Do not add messaging in this track.

## Risks / blockers

- Supabase Discord provider must be configured in the Supabase dashboard and Discord Developer Portal before the CTA can work.
- OAuth redirect URLs must include production and local origins.
- No existing test harness means OAuth behavior will initially need manual QA unless a test setup is added in the first implementation PR.
- Current auth is browser-session/client-guard based; this is acceptable for the prototype but may need cookie-based SSR auth before server-rendered private data or server-owned identity syncing becomes important.
- Account linking details need confirmation against the configured Supabase Auth behavior, especially duplicate email/provider cases.
- Current `discord_username` is editable/free-text; it must not be interpreted as a verified badge.

## Bottom line

Discord OAuth is straightforward in this stack for MVP sign-in/sign-up because Supabase is already the auth provider, sessions are already managed in the browser, and the app already handles new authenticated users without profiles. The first implementation PR should be a small UI/auth change: add `Continue with Discord` as the primary CTA on sign-in and sign-up, call Supabase OAuth, retain email fallback, and rely on the existing profile setup guard. Verified Discord identity, badges, contact preferences, and discovery exposure should be separate follow-up PRs with an app-owned identity table and explicit privacy controls.
