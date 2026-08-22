-- Supabase Storage only: HRMS business records remain in MongoDB.
-- A private bucket avoids exposing employee profile images through permanent public URLs.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'profile-pictures',
  'profile-pictures',
  false,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "profile owners can read" on storage.objects;
drop policy if exists "profile owners can upload" on storage.objects;
drop policy if exists "profile owners can update" on storage.objects;
drop policy if exists "profile owners can delete" on storage.objects;

create policy "profile owners can read" on storage.objects for select to authenticated
using (
  bucket_id = 'profile-pictures'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
);

create policy "profile owners can upload" on storage.objects for insert to authenticated
with check (
  bucket_id = 'profile-pictures'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
);

create policy "profile owners can update" on storage.objects for update to authenticated
using (
  bucket_id = 'profile-pictures'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
)
with check (
  bucket_id = 'profile-pictures'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
);

create policy "profile owners can delete" on storage.objects for delete to authenticated
using (
  bucket_id = 'profile-pictures'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
);
