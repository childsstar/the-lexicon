-- The Lexicon — pasted army list imports MVP

create table if not exists public.army_lists (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references auth.users (id) on delete cascade,
  profile_id     uuid references public.profiles (id) on delete set null,
  name           text,
  game_system    text,
  faction        text,
  points_total   numeric,
  raw_text       text not null check (length(trim(raw_text)) > 0),
  parsed_json    jsonb,
  parser_status  text not null default 'pending'
                   check (parser_status in ('pending', 'succeeded', 'failed')),
  parser_error   text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index if not exists army_lists_user_created_idx
  on public.army_lists (user_id, created_at desc);

create index if not exists army_lists_profile_idx
  on public.army_lists (profile_id);

create trigger army_lists_set_updated_at
  before update on public.army_lists
  for each row execute function public.set_updated_at();

alter table public.army_lists enable row level security;

create policy "Users can read their own army lists"
  on public.army_lists for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can insert their own army lists"
  on public.army_lists for insert
  to authenticated
  with check ((select auth.uid()) = user_id and (profile_id is null or profile_id = user_id));

create policy "Users can update their own army lists"
  on public.army_lists for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id and (profile_id is null or profile_id = user_id));

create policy "Users can delete their own army lists"
  on public.army_lists for delete
  to authenticated
  using ((select auth.uid()) = user_id);
