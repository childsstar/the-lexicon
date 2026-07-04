# OAuth Redirect URLs

The Discord OAuth flow uses Supabase PKCE auth and returns to a Next.js App Router callback before entering the protected app shell.

## Runtime flow

1. The Discord button starts Supabase OAuth with `redirectTo` set to:
   - `http://localhost:3000/auth/callback?next=/dashboard` in local development
   - `https://<production-origin>/auth/callback?next=/dashboard` in production
2. Discord/Supabase redirects back to `/auth/callback` with either:
   - `code=...` for the PKCE code exchange
   - `error=...` and optionally `error_description=...` if authorization fails
3. `app/auth/callback/route.ts` exchanges the returned code with `exchangeCodeForSession`, stores the Supabase session cookie, and redirects to `/dashboard`.
4. Existing client auth guards then keep their normal routing behavior:
   - signed-out users go to `/sign-in`
   - signed-in users without complete profiles go to `/profile/setup`
   - signed-in users with complete profiles remain on `/dashboard`

Hash-fragment access tokens are not expected for this app because the Supabase client is configured for PKCE. If a browser URL contains `#access_token=...` after OAuth, Supabase is not using the expected PKCE redirect flow for this app.

## Supabase URL Configuration

In Supabase Dashboard → Authentication → URL Configuration, include these redirect URLs for each deployed origin:

### Local development

- `http://localhost:3000/auth/callback`
- `http://localhost:3000/dashboard`

### Production

Replace `<production-origin>` with the real The Lexicon origin:

- `https://<production-origin>/auth/callback`
- `https://<production-origin>/dashboard`

The site URL should be the same origin used by the app, for example `http://localhost:3000` locally and the production origin in production.
