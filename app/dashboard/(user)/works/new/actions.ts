'use server';

import { redirect } from 'next/navigation';
import { getSupabaseServer } from '@/lib/supabaseServer';
import { routes } from '@/lib/routes';

export type NewWorkState = { ok?: boolean; error?: string };

export async function createWorkAction(
  _prev: NewWorkState | undefined,
  formData: FormData
): Promise<NewWorkState | void> {
  const supabase = await getSupabaseServer();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated.' };

  const title = String(formData.get('title') || '').trim();
  const description = String(formData.get('description') || '').trim();
  const published = !!formData.get('is_published');
  const file = formData.get('file') as File | null;

  // Lookup artist for this user
  const { data: artist, error: artistErr } = await supabase
    .from('artists')
    .select('id')
    .eq('user_id', user.id)
    .single();

  if (artistErr || !artist) return { error: 'Artist profile not found.' };

  // Create row first
  const { data: created, error: insertErr } = await supabase
    .from('works')
    .insert({
      title,
      description,
      artist_id: artist.id,
      published,         // canonical
      is_published: published, // keep legacy in sync
    })
    .select('id')
    .single();

  if (insertErr || !created) return { error: insertErr?.message || 'Insert failed.' };

  const workId: string = created.id;

  // Optional image upload
  if (file && typeof file.name === 'string' && file.size > 0) {
    const ext = (file.name.split('.').pop() || 'jpg').toLowerCase();
    const path = `${artist.id}/${workId}-${Date.now()}.${ext}`;

    const { error: upErr } = await supabase.storage
      .from('works')
      .upload(path, file, { upsert: true, contentType: file.type || undefined });

    if (upErr) return { error: upErr.message };

    const publicUrl = supabase.storage.from('works').getPublicUrl(path).data.publicUrl;

    const { error: upRowErr } = await supabase
      .from('works')
      .update({ image_url: publicUrl })
      .eq('id', workId);

    if (upRowErr) return { error: upRowErr.message };
  }

  // back to list
  redirect(routes.dashboardWorks());
}
