# Scheduled venue maintenance

The production-only `POST /api/maintenance/venue-refresh` route checks database reachability and venue health, then claims **one** state through a database transaction. It imports or refreshes at most eight reviewed venue records using stable `(source, source_id)` identities. Updates fill missing/import-owned data while preserving claimed or community-curated fields. Every attempt is recorded in `maintenance_runs` without headers, tokens, or source payloads.

Coverage means at least one U.S. venue whose canonical/source-of-truth is `import` **and** which has a `venue_external_sources.source_id`; an arbitrary venue with a state does not count. The supported geography is the 50 states plus D.C. The only approved starter catalog currently checked in is New York, sourced from official venue websites. NY is therefore the configured first priority, followed deterministically by the remaining states. If the selected state has no approved records, the health check and run log still complete but the state is not marked covered. Add reviewed records to the existing fixture/import format before that state can advance. No runtime scraping occurs.

After all 51 regions have source-backed coverage, selection changes to refresh mode and chooses the thinnest state, then the stalest, then alphabetically. A partial unique index allows only one active task, and the claim RPC expires abandoned claims after 30 minutes. Record writes use a transactional RPC and unique external-source identity, making retries idempotent.

## One-time setup

1. Apply `supabase/migrations/20260804000000_venue_maintenance.sql` to the production Supabase project.
2. Generate a random token of at least 32 bytes (for example, `openssl rand -hex 32`).
3. In the deployed application environment (Netlify), set `MAINTENANCE_TOKEN` to that token. The existing server-only `SUPABASE_SERVICE_ROLE_KEY` and `NEXT_PUBLIC_SUPABASE_URL` are also required by the route. Redeploy after changing environment variables.
4. In GitHub repository **Settings → Secrets and variables → Actions**, add:
   - `LEXICON_APP_URL`: the deployed origin, such as `https://thelexicon.games`;
   - `LEXICON_MAINTENANCE_TOKEN`: the same random token.

GitHub receives neither the Supabase URL/key nor service-role credentials. The service key stays in the deployed server environment. Rotate the maintenance token if it is disclosed.

## Operation

The workflow runs Sundays and Wednesdays at 09:17 UTC (alternating three- and four-day gaps). To run it manually, open **Actions → Venue maintenance → Run workflow**, choose the branch, and select **Run workflow**. A database error or failed task returns non-2xx; `curl` prints the concise JSON response and the job fails visibly.

This performs useful maintenance and generates legitimate application/database activity, but it is **not a contractual guarantee** that Supabase will not pause or change free-tier projects. Monitor GitHub failures and Supabase policy separately.
