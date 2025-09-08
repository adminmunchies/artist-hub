// app/_components/PublicNavbar.tsx
import Link from "next/link";
import { cookies } from "next/headers";
import { getSupabaseServer } from "@/lib/supabaseServer";
import SystemStatusBadge from "@/app/_components/SystemStatusBadge";
import PlanBadge from "@/app/_components/PlanBadge"; // <- neu

function getAuthCookieName() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const m = url.match(/^https?:\/\/([a-z0-9-]+)\.supabase\.co/i);
  const ref = m?.[1] ?? "";
  return ref ? `sb-${ref}-auth-token` : "";
}

export default async function PublicNavbar() {
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
      // leise bleiben, damit kein Next Overlay hochkommt
      user = null;
    }
  }

  return (
    <header className="border-b sticky top-0 z-40 bg-white/80 backdrop-blur">
      <div className="relative mx-auto max-w-6xl px-4 py-3 flex items-center gap-3">
        {/* Brand */}
        <Link href="/" className="font-semibold">Artist Hub</Link>

        {/* Desktop nav */}
        <nav className="ml-6 hidden md:flex items-center gap-4 text-sm">
          <Link href="/artists">Artists</Link>
          <Link href="/news">News</Link>
          <Link href="/pricing?role=artist">Pricing</Link>
          <Link href="/join">Join</Link>
        </nav>

        {/* Desktop actions */}
        <div className="ml-auto hidden md:flex items-center gap-3">
          <SystemStatusBadge className="inline-flex" />
          {user && <PlanBadge />} {/* <-- Plan/Upgrade Badge */}

          {user ? (
            <>
              <Link href="/dashboard" className="rounded-full border px-3 py-1 text-sm">Dashboard</Link>
              <form action="/auth/signout" method="post">
                <button type="submit" className="rounded-full border px-3 py-1 text-sm">Logout</button>
              </form>
            </>
          ) : (
            <Link href="/login" className="rounded-full border px-3 py-1 text-sm">Sign in</Link>
          )}
        </div>

        {/* Mobile: Hamburger menu (no JS, uses <details>) */}
        <details className="ml-auto md:hidden">
          <summary className="cursor-pointer rounded-full border px-3 py-1 text-sm flex items-center gap-2 list-none">
            <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" className="inline-block">
              <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            Menu
          </summary>

          <div className="mt-2 rounded-2xl border bg-white p-3 shadow-lg flex flex-col gap-2">
            <SystemStatusBadge className="self-start mb-2" />
            {user && (
              <div className="self-start mb-2">
                <PlanBadge />
              </div>
            )}

            <Link className="py-1" href="/artists">Artists</Link>
            <Link className="py-1" href="/news">News</Link>
            <Link className="py-1" href="/pricing?role=artist">Pricing</Link>
            <Link className="py-1" href="/join">Join</Link>

            <div className="h-px bg-gray-200 my-2" />

            {user ? (
              <>
                <Link className="rounded-full border px-3 py-1 text-sm text-center" href="/dashboard">Dashboard</Link>
                <form action="/auth/signout" method="post">
                  <button type="submit" className="w-full rounded-full border px-3 py-1 text-sm">Logout</button>
                </form>
              </>
            ) : (
              <Link href="/login" className="rounded-full border px-3 py-1 text-sm text-center">Sign in</Link>
            )}
          </div>
        </details>
      </div>
    </header>
  );
}
