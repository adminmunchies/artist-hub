-- =========================================
-- Storage RLS policies for buckets: works, exhibitions
-- Owner-only write via first folder segment = auth.uid()
-- Public read so Next.js can load images
-- =========================================

-- WORKS
create policy "upload_own_work"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'works'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "update_own_work"
on storage.objects for update
to authenticated
using (
  bucket_id = 'works'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'works'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "delete_own_work"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'works'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "public_read_works"
on storage.objects for select
to public
using (bucket_id = 'works');

-- EXHIBITIONS
create policy "upload_own_exhibition"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'exhibitions'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "update_own_exhibition"
on storage.objects for update
to authenticated
using (
  bucket_id = 'exhibitions'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'exhibitions'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "delete_own_exhibition"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'exhibitions'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "public_read_exhibitions"
on storage.objects for select
to public
using (bucket_id = 'exhibitions');
