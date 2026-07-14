-- The Lexicon — matchup join hardening + cancellation.
--
-- 1. Joining by invite code moves into a SECURITY DEFINER function.
--    The old "An invited opponent can join by user id" UPDATE policy
--    checked only `opponent_user_id is null and auth.uid() <> creator`,
--    trusting the app to scope the update by invite code in its WHERE
--    clause. A direct PostgREST caller supplies their own WHERE, so any
--    authenticated user could claim every open matchup without knowing
--    a single code. The function below owns the code lookup itself, and
--    the policy is dropped.
--
--    It also returns a specific outcome (not_found / own_matchup /
--    already_claimed / ...) so the app can say what actually went wrong
--    instead of one catch-all rejection — something RLS made impossible
--    before, since a non-participant can't read the row to find out.
--
-- 2. cancel_matchup makes the (previously unreachable) 'cancelled'
--    status real: either participant can cancel a matchup that hasn't
--    revealed, and source armies no longer committed to any live
--    matchup get their locked_at flag cleared.

drop policy if exists "An invited opponent can join by user id" on public.army_matchups;

create or replace function public.join_matchup_by_code(code text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  m public.army_matchups%rowtype;
  uid uuid := auth.uid();
begin
  if uid is null then
    raise exception 'Sign in to join a matchup.' using errcode = '42501';
  end if;

  select * into m from public.army_matchups where invite_code = code;
  if not found then
    return jsonb_build_object('outcome', 'not_found');
  end if;

  if m.creator_user_id = uid then
    return jsonb_build_object('outcome', 'own_matchup', 'matchup_id', m.id);
  end if;

  if m.opponent_user_id = uid then
    return jsonb_build_object('outcome', 'already_joined', 'matchup_id', m.id);
  end if;

  if m.opponent_user_id is not null then
    return jsonb_build_object('outcome', 'already_claimed');
  end if;

  if m.status = 'cancelled' then
    return jsonb_build_object('outcome', 'cancelled');
  end if;

  update public.army_matchups set opponent_user_id = uid where id = m.id;

  return jsonb_build_object(
    'outcome', 'joined',
    'matchup_id', m.id,
    -- Lock *state* only — never list contents. Lets the app tell the
    -- joiner whether the creator's list is already sealed in.
    'creator_locked', m.creator_locked_at is not null
  );
end;
$$;

revoke all on function public.join_matchup_by_code(text) from public;
grant execute on function public.join_matchup_by_code(text) to authenticated;

create or replace function public.cancel_matchup(matchup_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  m public.army_matchups%rowtype;
  uid uuid := auth.uid();
begin
  if uid is null then
    raise exception 'Sign in to cancel a matchup.' using errcode = '42501';
  end if;

  select * into m from public.army_matchups where id = matchup_id;
  if not found then
    return jsonb_build_object('outcome', 'not_found');
  end if;

  if uid <> m.creator_user_id and (m.opponent_user_id is null or uid <> m.opponent_user_id) then
    return jsonb_build_object('outcome', 'not_participant');
  end if;

  if m.status = 'revealed' then
    return jsonb_build_object('outcome', 'already_revealed');
  end if;

  if m.status <> 'cancelled' then
    update public.army_matchups set status = 'cancelled' where id = m.id;

    -- Clear the visible "locked" flag on source armies that are no
    -- longer committed to any live matchup. SECURITY DEFINER matters
    -- here: it lets a cancel unlock *both* sides' armies, which the
    -- caller's own RLS could never touch.
    update public.army_lists a
      set locked_at = null
      where a.id in (m.creator_army_id, m.opponent_army_id)
        and a.locked_at is not null
        and not exists (
          select 1 from public.army_matchups x
          where x.id <> m.id
            and x.status <> 'cancelled'
            and (
              (x.creator_army_id = a.id and x.creator_locked_at is not null)
              or (x.opponent_army_id = a.id and x.opponent_locked_at is not null)
            )
        );
  end if;

  return jsonb_build_object('outcome', 'cancelled');
end;
$$;

revoke all on function public.cancel_matchup(uuid) from public;
grant execute on function public.cancel_matchup(uuid) to authenticated;
