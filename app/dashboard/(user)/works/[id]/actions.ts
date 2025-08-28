// app/dashboard/works/[id]/actions.ts
'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getSupabaseServer } from '@/lib/supabaseServer';
import { routes } from '@/lib/routes';

export async function updateWorkAction(formData: FormData) {
  const supabase = await getSupabaseServer();

  const id = String(formData.get('id') || '');
  const title = String(formData.get('title') || '').trim();
  const description = String(formData.get('description') || '').trim();
  const published = formData.get('published') === 'on';

  await supabase
    .from('works')
    .update({ title, description, published })
    .eq('id', id);

  revalidatePath(routes.dashboardWorks());
  redirect(routes.dashboardWorks());
}

export async function deleteWorkAction(formData: FormData) {
  const supabase = await getSupabaseServer();
  const id = String(formData.get('id') || '');

  await supabase.from('works').delete().eq('id', id);

  revalidatePath(routes.dashboardWorks());
  redirect(routes.dashboardWorks());
}
