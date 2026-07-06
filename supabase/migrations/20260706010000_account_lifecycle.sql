-- The Lexicon — account lifecycle helpers
-- Deletes all user-owned application data for an authenticated user in one
-- Postgres transaction. The application then removes the matching Supabase
-- Auth user with the Admin API, which cascades any remaining auth-owned rows.

create or replace function public.delete_account_owned_data(target_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is distinct from target_user_id then
    raise exception 'Cannot delete another user account.' using errcode = '42501';
  end if;

  delete from public.army_lists where user_id = target_user_id;
  delete from public.armies where user_id = target_user_id;
  delete from public.battles where logged_by = target_user_id;
  delete from public.connections
    where requester_id = target_user_id or addressee_id = target_user_id;

  delete from public.venue_external_sources
    where venue_id in (
      select id from public.venues where created_by = target_user_id
    );
  delete from public.venues where created_by = target_user_id;
  delete from public.campaigns where created_by = target_user_id;

  update public.battles set opponent_id = null where opponent_id = target_user_id;
  update public.venues
    set claimed_by = null, claimed_at = null
    where claimed_by = target_user_id;

  delete from public.profiles where id = target_user_id;
end;
$$;

revoke all on function public.delete_account_owned_data(uuid) from public;
grant execute on function public.delete_account_owned_data(uuid) to authenticated;
