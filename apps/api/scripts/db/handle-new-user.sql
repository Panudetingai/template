-- Mirror every new auth user into public.users so foreign keys (e.g. onboarding)
-- always resolve — regardless of whether the user signed up via email/password
-- (with or without email confirmation) or an OAuth provider.
--
-- Apply with: bun run db:functions   (or paste into the Supabase SQL editor)

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (
    id,
    email,
    username,
    avatar_url,
    free,
    created_at,
    updated_at,
    last_active_at
  )
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(
      new.raw_user_meta_data ->> 'username',
      new.raw_user_meta_data ->> 'name'
    ),
    new.raw_user_meta_data ->> 'avatar_url',
    'free',
    now(),
    now(),
    now()
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();
