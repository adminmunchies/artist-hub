'use server';
import { redirect } from 'next/navigation';
import { routes } from '@/lib/routes';
import { createServerSupabaseAction } from '@/lib/supabaseServer';

export async function loginAction(formData: FormData) {
  const email = String(formData.get('email') ?? '');
  const password = String(formData.get('password') ?? '');
  const redirectTo = String(formData.get('redirectTo') ?? routes.dashboardWorks());
  const supabase = await createServerSupabaseAction();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: 'Login failed. Check email/password.' };
  redirect(redirectTo);
}

export async function logoutAction() {
  const supabase = await createServerSupabaseAction();
  await supabase.auth.signOut();
  redirect(routes.home());
}
