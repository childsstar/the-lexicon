# The Lexicon

**thelexicon.games** — a mobile-first community platform for tabletop wargamers.

Discover your faction, muster your army, find your community, and record the
battles that become your legend. The Lexicon is a chronicle for the hobby:
armies, battles, campaigns, venues, and the players around you — not a rules
app or an army-builder clone.

## Status

v0.1 prototype — a polished product shell with real navigation and structure,
placeholder data, and a draft database schema. Built to gather early feedback
from tabletop players.

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

For local development, put them in `.env.local` (never committed). The app
shell runs fine without them; anything touching Supabase will raise a clear
configuration error until they're set. Never add the service role key to this
project — it must not reach the browser.

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

`supabase/schema_v0_1.sql` is a reviewed-by-hand draft covering profiles,
armies, venues, battles, campaigns, and connections — UUID keys,
`created_at`/`updated_at` triggers, and owner-scoped Row Level Security
policies. Apply it via the Supabase SQL editor when ready; nothing runs it
automatically.

## Legal note

The Lexicon is an independent community platform. It is not affiliated with or
endorsed by Games Workshop or any game publisher, and it deliberately contains
no copyrighted rules, datasheets, points values, or official assets.
