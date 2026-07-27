# Old World event MVP: architecture and deployment note

## Reused architecture

- `GAMES` remains the canonical Universe → Realm → Game registry; the Old World identity is `warhammer` / `the-old-world` / `the-old-world`.
- `ActiveUniverseProvider` continues to persist a selection in browser storage. Armies and Muster now consume its canonical game key.
- `army_lists` remains the army/import aggregate. The importer saves the authenticated `user_id`, original text, conservative parsed JSON and generated project-owned sigil.
- `army_matchups` remains the sealed exchange. Each side receives an immutable JSON snapshot at lock time and `buildMatchupView` redacts the opposing snapshot until both timestamps exist.
- Existing participant RLS, invitation join RPC, cancellation RPC and authenticated server routes are extended rather than replaced.

## Migration

Run `supabase link --project-ref <production-project-ref>` followed by `supabase db push --linked` in each environment. Migration `20260727000000_ensure_army_lists_game_key.sql` is the idempotent production repair: it adds nullable `game_key`, preserves existing values, backfills recognized legacy display strings/parser metadata/raw roster text (and a legacy `realm_key` when present), restores the canonical-value check and user/game index, and notifies PostgREST to reload its schema cache. It removes no content and keeps `game_system` for compatibility. If the REST API still reports a schema-cache error after the push, run `notify pgrst, 'reload schema';` in the Supabase SQL Editor (or use Dashboard → Settings → API → Reload schema), then retry the import.

## Privacy decisions

Matchup snapshots are copies rather than references, so edits to a live army cannot mutate a submitted list. API reads are viewer-specific and never return an opposing snapshot before simultaneous reveal. Cancellation clears live locks through the existing RPC. The safest MVP behavior is no unlock/swap action once a side has submitted; cancellation is explicit and does not reveal either list.

The existing participant `SELECT` policy is still row-level rather than column-level. Production clients must use authenticated matchup API routes—not direct table reads—for snapshot redaction. Moving reads and locks entirely behind a redacting `SECURITY DEFINER` RPC is the highest-priority post-event hardening task.

## Deliberate limits

The parser does not validate legality, official points or profiles. It preserves unknown section lines as unverified entries. The fixture is documentation/development input rather than an automatic production seed, because auth user UUIDs must be created by the local Supabase environment.
