// app/_components/PublicFooter.tsx
import Link from "next/link";
import { cookies } from "next/headers";
import { getSupabaseServer } from "@/lib/supabaseServer";
import SystemStatusBadge from "@/app/_components/SystemStatusBadge";
import LoginInline from "@/app/_components/LoginInline";

function getAuthCookieName() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const m = url.match(/^https?:\/\/([a-z0-9-]+)\.supabase\.co/i);
  const ref = m?.[1] ?? "";
  return ref ? `sb-${ref}-auth-token` : "";
}

export default async function PublicFooter() {
  const jar = await cookies();
  const cookieName = getAuthCookieName();
  const hasAuth = cookieName ? !!jar.get(cookieName) : false;

  let user: any = null;
  if (hasAuth) {
    try {
      const supabase = await getSupabaseServer();
      const { data } = await supabase.auth.getUser();
      user = data?.user ?? null;
    } catch {
      user = null;
    }
  }

  return (
    <footer className="border-t mt-10">
      <div className="mx-auto max-w-6xl px-4 py-6 grid gap-4 md:grid-cols-3 items-start">
        <div className="text-sm opacity-80">© {new Date().getFullYear()} Artist Hub</div>

        <nav className="flex flex-wrap gap-4 justify-center text-sm">
          <Link href="/artists">Artists</Link>
          <Link href="/news">News</Link>
          <Link href="/pricing?role=artist">Pricing</Link>
          <Link href="/join">Join</Link>
        </nav>

        <div className="flex flex-col md:items-end gap-3">
          <div className="flex items-center gap-3">
            <SystemStatusBadge />
            {user ? (
              <>
                <Link href="/dashboard" className="rounded-full border px-3 py-1 text-sm">Dashboard</Link>
                <form action="/auth/signout" method="post">
                  <button type="submit" className="rounded-full border px-3 py-1 text-sm">Logout</button>
                </form>
              </>
            ) : (
              <Link href="/login" className="rounded-full border px-3 py-1 text-sm md:hidden">Sign in</Link>
            )}
          </div>

          {/* Inline login form (desktop only by default) */}
          {!user ? <LoginInline className="hidden md:block" /> : null}
        </div>
      </div>
    </footer>
  );
}
