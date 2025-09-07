// app/_components/PublicNavbar.tsx
import Link from "next/link";
import { getSupabaseServer } from "@/lib/supabaseServer";

export default async function PublicNavbar() {
  const supabase = await getSupabaseServer();
  const { data } = await supabase.auth.getUser();
  const user = data?.user ?? null;

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
        <div className="ml-auto hidden md:flex items-center gap-2">
          {user ? (
            <>
              <Link
                href="/dashboard"
                className="rounded-full border px-3 py-1 text-sm"
              >
                Dashboard
              </Link>
              <form action="/auth/signout" method="post">
                <button
                  type="submit"
                  className="rounded-full border px-3 py-1 text-sm"
                >
                  Logout
                </button>
              </form>
            </>
          ) : (
            <Link
              href="/login"
              className="rounded-full border px-3 py-1 text-sm"
            >
              Sign in
            </Link>
          )}
        </div>

        {/* Mobile: Hamburger menu (no JS, uses <details>) */}
        <details className="ml-auto md:hidden">
          <summary className="cursor-pointer rounded-full border px-3 py-1 text-sm flex items-center gap-2 list-none">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              aria-hidden="true"
              className="inline-block"
            >
              <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            Menu
          </summary>

          <div className="mt-2 rounded-2xl border bg-white p-3 shadow-lg flex flex-col gap-2">
            <Link className="py-1" href="/artists">Artists</Link>
            <Link className="py-1" href="/news">News</Link>
            <Link className="py-1" href="/pricing?role=artist">Pricing</Link>
            <Link className="py-1" href="/join">Join</Link>

            <div className="h-px bg-gray-200 my-2" />

            {user ? (
              <>
                <Link
                  className="rounded-full border px-3 py-1 text-sm text-center"
                  href="/dashboard"
                >
                  Dashboard
                </Link>
                <form action="/auth/signout" method="post">
                  <button
                    type="submit"
                    className="w-full rounded-full border px-3 py-1 text-sm"
                  >
                    Logout
                  </button>
                </form>
              </>
            ) : (
              <Link
                href="/login"
                className="rounded-full border px-3 py-1 text-sm text-center"
              >
                Sign in
              </Link>
            )}
          </div>
        </details>
      </div>
    </header>
  );
}
