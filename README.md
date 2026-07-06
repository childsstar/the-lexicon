# The Lexicon

**thelexicon.games** — a mobile-first community platform for tabletop wargamers.

Discover your faction, muster your army, find your community, and record the
battles that become your legend. The Lexicon is a chronicle for the hobby:
armies, battles, campaigns, venues, and the players around you — not a rules
app or an army-builder clone.

## Status

v0.1 prototype — a polished product shell with real navigation and structure,
plus a working identity foundation: email/password auth (Supabase) and
commander profiles. Armies, battles, campaigns, and community remain
placeholder shells. Built to gather early feedback from tabletop players.

## Stack

- [Next.js](https://nextjs.org) (App Router) + React
- [Tailwind CSS v4](https://tailwindcss.com)
- [Supabase](https://supabase.com) (auth, database, storage — client wired up,
  features land incrementally)
- Deployed on [Netlify](https://netlify.com)

## Running locally

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

### Environment variables

The Supabase client reads these (already configured in Netlify site settings):

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

For local development, put them in `.env.local` (never committed). Without
them the public pages still render, but sign-in and the app shell show a
clear configuration error. Never give the service role key a `NEXT_PUBLIC_`
prefix — it must not reach the browser.

Server-only (no `NEXT_PUBLIC_` prefix — must never reach the browser):

```
SUPABASE_SERVICE_ROLE_KEY=...   # required for account deletion (/api/account/delete)
ANTHROPIC_API_KEY=...           # powers Chronicle readings via /api/chronicle
CHRONICLE_MODEL=...             # optional; defaults to claude-opus-4-8
```

`SUPABASE_SERVICE_ROLE_KEY` is read server-side only, by a route pinned to
the Node.js runtime, to call the Supabase Admin API
(`auth.admin.deleteUser`). If it's missing, `/api/account/delete` logs a
setup message on the server and returns a safe, user-facing error instead of
leaking env-var details — in development that error names the missing
variable; in production it's a generic "temporarily unavailable" message. On
Netlify, add it as a server-side environment variable (never `NEXT_PUBLIC_`)
in Site settings → Environment variables, then trigger a redeploy so the
running functions pick up the new value.

Find Your Banner works without the key too: `/api/chronicle` falls back to
the deterministic template generator whenever the key is missing, the model
times out, or anything else goes wrong — the reveal never breaks. Access control is enforced by Row Level
Security in Postgres, so the anon key is safe to expose.

### Supabase setup (one-time)

1. In the Supabase SQL editor, run `supabase/schema_v0_1_profiles.sql`.
   This creates the `profiles` table, its `updated_at` trigger, and
   owner-scoped RLS policies. Nothing runs it automatically.
2. In Supabase → Authentication → URL Configuration, set the Site URL to
   `https://thelexicon.games` (and add `http://localhost:3000` to additional
   redirect URLs for local dev) so confirmation emails link back correctly.
3. Optional: Authentication → Sign In / Up → disable "Confirm email" while
   prototyping to skip the confirmation-email step.

The broader draft schema (`supabase/schema_v0_1.sql` — armies, venues,
battles, campaigns, connections) can wait until those features ship; if you
do run it, run the profiles file first.

## Auth & profile flow

- `/sign-up` — email/password via Supabase Auth. If email confirmation is
  on, users get a confirmation link first; otherwise they're signed in
  immediately.
- `/sign-in` — signs in and redirects to `/dashboard`. Already-signed-in
  visitors are bounced straight to the dashboard.
- All pages in the app shell (dashboard, armies, battles, …) are guarded
  client-side: signed-out visitors are redirected to `/sign-in`.
- First sign-in: no profile row exists yet, so the guard routes the user to
  `/profile/setup` to forge their commander identity. Username and
  availability are required; everything else (experience level, play style,
  game systems, factions, location, Discord handle, bio) is optional
  enrichment used by future matchmaking and Muster recommendations.
- `/profile` — view and edit the profile, sign out.
- Sessions are handled client-side by `@supabase/supabase-js` (browser
  storage). Fine for the prototype; can move to cookie-based SSR auth later
  if server rendering of private data becomes necessary.

Discord OAuth sign-in is available through Supabase Auth. To use it, enable
the Discord provider in the Supabase dashboard, configure the Discord OAuth
app/client credentials there, and add both production and local redirect URLs
in Supabase and the Discord Developer Portal. The required browser env vars
remain `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`; do not
commit Discord client secrets or service-role keys to this repo.


## Social/share preview testing

The site-level App Router metadata points social crawlers at
`https://thelexicon.games/og-card.png`, a static 1200×630 share image in
`public/`. After deployment, verify rich previews by:

1. Sending `https://thelexicon.games` in iMessage/SMS and confirming the
   conversation renders a large image card.
2. Posting the homepage URL in Discord or Slack and confirming the preview uses
   the Lexicon card art instead of only the site name.
3. Checking the URL with a social preview debugger if a platform exposes one.
4. Hard-refreshing, cache-busting with a temporary query string, or waiting for
   platform cache expiry if an old preview is still cached.

## Project layout

```
app/
  (marketing)/        Public pages: landing, onboarding paths
  (app)/              Product shell: dashboard, armies, community,
                      venues, battles, campaigns, profile
components/           Shared UI (app shell, page header, empty states, icons)
lib/supabase.ts       Reusable browser-safe Supabase client
supabase/
  schema_v0_1.sql     Draft database schema (apply manually — not automated)
```

## Database schema

- `supabase/schema_v0_1_profiles.sql` — the live profiles table (required
  for auth). Run this first.
- `supabase/schema_v0_1.sql` — draft of the remaining tables (armies,
  venues, battles, campaigns, connections) for when those features ship.

Both use UUID keys, `created_at`/`updated_at` triggers, and Row Level
Security. Apply via the Supabase SQL editor; nothing runs them automatically.

## Next up

**Muster** — real army creation backed by the `armies` table, owned by the
signed-in profile, with faction/system enrichment drawn from the profile's
interests.

## Legal note

The Lexicon is an independent community platform. It is not affiliated with or
endorsed by Games Workshop or any game publisher, and it deliberately contains
no copyrighted rules, datasheets, points values, or official assets.
