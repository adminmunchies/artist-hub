'use server';

import { getSupabaseServer } from '@/lib/supabaseServer';
import { revalidatePath } from 'next/cache';

export async function makeMeAdmin() {
  const supabase = await getSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('admin_users')
    .upsert({ user_id: user.id });

  if (error) throw error;

  revalidatePath('/auth/debug');
}
