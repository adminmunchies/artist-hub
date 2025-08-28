import Link from 'next/link';
import { getSupabaseServer } from '@/lib/supabaseServer';

export default async function PublicNavbar() {
  const supabase = await getSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  let dashboardHref: string | null = null;

  if (user) {
    const { data: adminRow } = await supabase
      .from('admin_users')
      .select('user_id')
      .eq('user_id', user.id)
      .maybeSingle();

    dashboardHref = adminRow ? '/dashboard/admin' : '/dashboard/works';
  }

  return (
    <header className="sticky top-0 z-10 border-b bg-white/80 backdrop-blur">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
        <nav className="flex items-center gap-4">
          <Link href="/" className="font-semibold" prefetch={false}>
            Artist Hub
          </Link>
          <Link href="/artists" className="hover:underline" prefetch={false}>
            Artists
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          {dashboardHref ? (
            <Link href={dashboardHref} className="rounded-full border px-4 py-1.5" prefetch={false}>
              Dashboard
            </Link>
          ) : (
            <Link href="/auth/login" className="rounded-full border px-4 py-1.5" prefetch={false}>
              Login
            </Link>
          )}
          {user && (
            <a href="/auth/signout" className="rounded-full border px-4 py-1.5">
              Logout
            </a>
          )}
        </div>
      </div>
    </header>
  );
}
