-- Spire: brugerprofiler (namespaced for at undgå kollision med andre apps i projektet)
create table if not exists public.spire_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  visningsnavn text,
  titel text,
  afdeling text,
  avatar_farve text,
  avatar_url text,
  updated_at timestamptz default now()
);

alter table public.spire_profiles enable row level security;

drop policy if exists "spire_profiles_select_all" on public.spire_profiles;
create policy "spire_profiles_select_all"
  on public.spire_profiles for select using (true);

drop policy if exists "spire_profiles_insert_own" on public.spire_profiles;
create policy "spire_profiles_insert_own"
  on public.spire_profiles for insert with check (auth.uid() = id);

drop policy if exists "spire_profiles_update_own" on public.spire_profiles;
create policy "spire_profiles_update_own"
  on public.spire_profiles for update using (auth.uid() = id) with check (auth.uid() = id);

-- Opret profil-række automatisk ved ny bruger
create or replace function public.handle_new_spire_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.spire_profiles (id, visningsnavn)
  values (new.id, coalesce(new.raw_user_meta_data->>'visningsnavn', split_part(new.email, '@', 1)))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_spire on auth.users;
create trigger on_auth_user_created_spire
  after insert on auth.users
  for each row execute function public.handle_new_spire_user();

-- Storage-bucket til profilbilleder
insert into storage.buckets (id, name, public)
values ('spire-avatars', 'spire-avatars', true)
on conflict (id) do nothing;

drop policy if exists "spire_avatars_read" on storage.objects;
create policy "spire_avatars_read"
  on storage.objects for select using (bucket_id = 'spire-avatars');

drop policy if exists "spire_avatars_insert_own" on storage.objects;
create policy "spire_avatars_insert_own"
  on storage.objects for insert
  with check (bucket_id = 'spire-avatars' and auth.uid()::text = (storage.foldername(name))[1]);

drop policy if exists "spire_avatars_update_own" on storage.objects;
create policy "spire_avatars_update_own"
  on storage.objects for update
  using (bucket_id = 'spire-avatars' and auth.uid()::text = (storage.foldername(name))[1]);

drop policy if exists "spire_avatars_delete_own" on storage.objects;
create policy "spire_avatars_delete_own"
  on storage.objects for delete
  using (bucket_id = 'spire-avatars' and auth.uid()::text = (storage.foldername(name))[1]);
