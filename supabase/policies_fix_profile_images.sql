-- =========================================
-- Artist Hub – RLS & Storage Policies (idempotent)
-- Fix: ersetzt IF NOT EXISTS durch DO $$ ... END $$ Blöcke
-- =========================================

-- 0) Optional: Zusatzfeld am Artist
alter table if exists public.artists
  add column if not exists footer_link text;

-- 1) Artists – RLS einschalten
alter table public.artists enable row level security;

-- 1a) Public darf nur aktive Artists sehen (für Public-Seiten / /artists, /a/[id])
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'artists'
      and polname = 'public_select_active_artists'
  ) then
    create policy "public_select_active_artists"
      on public.artists
      for select
      to public
      using (is_active = true);
  end if;
end$$;

-- 1b) Owner-CRUD: eingeloggte Artists nur auf eigene Zeile
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'artists'
      and polname = 'artist_own_crud'
  ) then
    create policy "artist_own_crud"
      on public.artists
      for all
      to authenticated
      using (user_id = auth.uid())
      with check (user_id = auth.uid());
  end if;
end$$;

-- 2) Storage – Bucket: profile-images
-- Hinweis: Bucket muss existieren und "Public" = ON haben (für SELECT).
-- RLS auf storage.objects ist standardmäßig aktiv.

-- 2a) INSERT (Upload) nur in eigenen Unterordner: profile-images/{uid}/...
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects'
      and polname = 'upload_own_avatar'
  ) then
    create policy "upload_own_avatar"
      on storage.objects
      for insert
      to authenticated
      with check (
        bucket_id = 'profile-images'
        and (storage.foldername(name))[1] = auth.uid()::text
      );
  end if;
end$$;

-- 2b) UPDATE nur eigene Dateien im eigenen Ordner
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects'
      and polname = 'update_own_avatar'
  ) then
    create policy "update_own_avatar"
      on storage.objects
      for update
      to authenticated
      using (
        bucket_id = 'profile-images'
        and (storage.foldername(name))[1] = auth.uid()::text
      )
      with check (
        bucket_id = 'profile-images'
        and (storage.foldername(name))[1] = auth.uid()::text
      );
  end if;
end$$;

-- 2c) DELETE nur eigene Dateien im eigenen Ordner
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects'
      and polname = 'delete_own_avatar'
  ) then
    create policy "delete_own_avatar"
      on storage.objects
      for delete
      to authenticated
      using (
        bucket_id = 'profile-images'
        and (storage.foldername(name))[1] = auth.uid()::text
      );
  end if;
end$$;

-- 2d) Öffentlicher Lesezugriff (damit next/image öffentlich laden kann)
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects'
      and polname = 'public_read_avatars'
  ) then
    create policy "public_read_avatars"
      on storage.objects
      for select
      to public
      using (bucket_id = 'profile-images');
  end if;
end$$;

