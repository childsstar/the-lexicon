# Venue Seed Format

The venue seed importer accepts a JSON array of objects. This format is for local/admin-reviewed seed data only; do not commit real scraped production data or run imports automatically.

## Required fields

Each row must include:

- `name` — public venue name.
- `venue_type` — one of the app-supported venue types such as `game_store`, `club`, `event_space`, or `private`.
- Location, either:
  - `city`, `region_code`, and `country_code`, or
  - `formatted_address`.

`latitude` and `longitude` are strongly preferred for safe dedupe and future radius search. If one coordinate is supplied, both must be supplied.

## Optional fields

- `website`
- `phone`
- `email`
- `discord_invite_url`
- `instagram_url`
- `facebook_url`
- `venue_categories` — array of strings.
- `supported_game_systems` — array of strings.
- `source` — source system name, for provenance only.
- `source_id` — source-specific stable id.
- `source_url`
- `confidence` — number from `0` to `1`.
- `external_payload` — source-specific JSON object retained for audit/debugging.

## Import safety

- The importer defaults to dry-run and prints a summary only.
- Writes require `--apply` and must use a server-side Supabase service role key, never a browser-exposed anon key.
- Matching must use provenance, normalized phone, address, and coordinate signals. Name-only matches are intentionally ambiguous and must not be auto-updated.
