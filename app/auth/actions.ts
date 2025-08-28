'use server';

import { redirect } from 'next/navigation';
import { getSupabaseServer } from '@/lib/supabaseServer';

export async function signOutAction() {
  const supabase = await getSupabaseServer();
  // Supabase Session + Cookies serverseitig beenden
  await supabase.auth.signOut().catch(() => {});
  // optional: Cache-busting von geschützten Pages erzwingen
  // (nicht zwingend, aber hilft bei „hängenden“ UI-Zuständen)
  redirect('/'); // direkt zurück auf die Startseite
}
