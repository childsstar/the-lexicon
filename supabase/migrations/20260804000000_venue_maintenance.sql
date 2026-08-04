create table if not exists public.maintenance_runs (
  id uuid primary key default gen_random_uuid(),
  task_name text not null,
  status text not null check (status in ('running', 'completed', 'failed')),
  selected_state text,
  run_mode text check (run_mode in ('initial_seed', 'refresh')),
  source text,
  records_checked integer not null default 0,
  records_created integer not null default 0,
  records_updated integer not null default 0,
  records_rejected integer not null default 0,
  error_message text,
  started_at timestamptz not null default now(),
  completed_at timestamptz
);

alter table public.maintenance_runs enable row level security;
revoke all on public.maintenance_runs from anon, authenticated;
create unique index if not exists maintenance_runs_one_active_task_idx
  on public.maintenance_runs (task_name) where status = 'running';
create index if not exists maintenance_runs_started_at_idx on public.maintenance_runs (started_at desc);

create or replace function public.begin_venue_maintenance(requested_task_name text)
returns table(run_id uuid, selected_state text, run_mode text)
language plpgsql security definer set search_path = public
as $$
declare
  priority text[] := array['NY','AL','AK','AZ','AR','CA','CO','CT','DE','DC','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY'];
  chosen text;
  chosen_mode text;
begin
  -- Recover only genuinely abandoned claims; normal overlap is rejected by the unique index.
  update public.maintenance_runs set status = 'failed', error_message = 'Run claim expired.', completed_at = now()
    where task_name = requested_task_name and status = 'running' and started_at < now() - interval '30 minutes';

  select state into chosen from unnest(priority) with ordinality p(state, position)
  where not exists (
    select 1 from public.venues v join public.venue_external_sources s on s.venue_id = v.id
    where v.country_code = 'US' and v.region_code = p.state and v.canonical_source = 'import'
      and v.source_of_truth = 'import' and s.source_id is not null
  ) order by position limit 1;
  chosen_mode := 'initial_seed';

  if chosen is null then
    chosen_mode := 'refresh';
    select v.region_code into chosen
    from public.venues v join public.venue_external_sources s on s.venue_id = v.id
    where v.country_code = 'US' and v.region_code = any(priority) and v.canonical_source = 'import'
      and v.source_of_truth = 'import' and s.source_id is not null
    group by v.region_code order by count(*) asc, min(v.last_seen_at) asc nulls first, v.region_code asc limit 1;
  end if;

  insert into public.maintenance_runs(task_name, status, selected_state, run_mode, source)
  values(requested_task_name, 'running', chosen, chosen_mode, 'checked_in_official_websites')
  returning id into run_id;
  selected_state := chosen; run_mode := chosen_mode;
  return next;
exception when unique_violation then
  return;
end;
$$;

create or replace function public.upsert_maintenance_venue(venue_data jsonb, source_data jsonb)
returns uuid language plpgsql security definer set search_path = public
as $$
declare venue_uuid uuid; source_name text := source_data->>'source'; external_id text := source_data->>'source_id';
begin
  if source_name is null or external_id is null then raise exception 'Stable source identity is required'; end if;
  select venue_id into venue_uuid from public.venue_external_sources where source = source_name and source_id = external_id for update;
  if venue_uuid is null then
    insert into public.venues(name, venue_type, city, region_code, country_code, formatted_address, region, latitude, longitude, website, phone, email, discord_invite_url, instagram_url, facebook_url, venue_categories, supported_game_systems, canonical_source, source_of_truth, confidence, source_payload, last_seen_at)
    values(venue_data->>'name', venue_data->>'venue_type', venue_data->>'city', venue_data->>'region_code', venue_data->>'country_code', venue_data->>'formatted_address', venue_data->>'region', (venue_data->>'latitude')::double precision, (venue_data->>'longitude')::double precision, venue_data->>'website', venue_data->>'phone', venue_data->>'email', venue_data->>'discord_invite_url', venue_data->>'instagram_url', venue_data->>'facebook_url', coalesce(array(select jsonb_array_elements_text(venue_data->'venue_categories')), '{}'), coalesce(array(select jsonb_array_elements_text(venue_data->'supported_game_systems')), '{}'), 'import', 'import', (venue_data->>'confidence')::real, venue_data->'source_payload', coalesce((venue_data->>'last_seen_at')::timestamptz, now())) returning id into venue_uuid;
    insert into public.venue_external_sources(venue_id, source, source_id, source_url, external_name, external_payload, confidence, last_seen_at)
    values(venue_uuid, source_name, external_id, source_data->>'source_url', source_data->>'external_name', source_data->'external_payload', (source_data->>'confidence')::real, coalesce((source_data->>'last_seen_at')::timestamptz, now()));
  else
    update public.venues set
      city=coalesce(nullif(venue_data->>'city',''),city), region_code=coalesce(nullif(venue_data->>'region_code',''),region_code), country_code=coalesce(nullif(venue_data->>'country_code',''),country_code),
      formatted_address=coalesce(nullif(venue_data->>'formatted_address',''),formatted_address), region=coalesce(nullif(venue_data->>'region',''),region), latitude=coalesce((venue_data->>'latitude')::double precision,latitude), longitude=coalesce((venue_data->>'longitude')::double precision,longitude),
      website=coalesce(nullif(venue_data->>'website',''),website), phone=coalesce(nullif(venue_data->>'phone',''),phone), email=coalesce(nullif(venue_data->>'email',''),email), last_seen_at=coalesce((venue_data->>'last_seen_at')::timestamptz,now())
    where id=venue_uuid;
    update public.venue_external_sources set source_url=coalesce(nullif(source_data->>'source_url',''),source_url), external_name=coalesce(nullif(source_data->>'external_name',''),external_name), external_payload=coalesce(source_data->'external_payload',external_payload), confidence=coalesce((source_data->>'confidence')::real,confidence), last_seen_at=coalesce((source_data->>'last_seen_at')::timestamptz,now()) where source=source_name and source_id=external_id;
  end if;
  return venue_uuid;
end;
$$;

create or replace function public.finish_venue_maintenance(requested_run_id uuid, run_status text, checked_count integer, created_count integer, updated_count integer, rejected_count integer, failure_message text default null)
returns void language sql security definer set search_path = public
as $$ update public.maintenance_runs set status=run_status, records_checked=checked_count, records_created=created_count, records_updated=updated_count, records_rejected=rejected_count, error_message=left(failure_message,500), completed_at=now() where id=requested_run_id and status='running'; $$;

revoke all on function public.begin_venue_maintenance(text) from public, anon, authenticated;
revoke all on function public.upsert_maintenance_venue(jsonb,jsonb) from public, anon, authenticated;
revoke all on function public.finish_venue_maintenance(uuid,text,integer,integer,integer,integer,text) from public, anon, authenticated;
grant execute on function public.begin_venue_maintenance(text), public.upsert_maintenance_venue(jsonb,jsonb), public.finish_venue_maintenance(uuid,text,integer,integer,integer,integer,text) to service_role;
