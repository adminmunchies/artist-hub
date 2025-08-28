export const dynamic = "force-dynamic";
export const revalidate = 0;

import Link from "next/link";
import { createServerSupabase } from "@/lib/supabaseServer";
import { signOut } from "@/app/auth/actions";

export default async function AuthBar() {
  const supabase = await createServerSupabase();
  const { data: auth } = await supabase.auth.getUser();
  const user = auth?.user ?? null;

  let artistId: string | null = null;
  if (user) {
    const { data: artist } = await supabase
      .from("artists")
      .select("id")
      .eq("owner_id", user.id)
      .maybeSingle();
    artistId = artist?.id ?? null;
  }

  return (
    <div className="w-full border-b bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-6">
          <Link href="/" className="font-semibold">Artist Hub</Link>
          {user ? (
            <nav className="hidden md:flex items-center gap-4 text-sm">
              {artistId ? <Link href={`/a/${artistId}`} className="hover:underline">Profile</Link> : null}
              <Link href="/dashboard" className="hover:underline">Works</Link>
              <Link href="/dashboard/exhibitions" className="hover:underline">Exhibitions</Link>
              <Link href="/dashboard/settings" className="hover:underline">Settings</Link>
            </nav>
          ) : null}
        </div>

        {user ? (
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="text-sm underline">Dashboard</Link>
            <form action={signOut}>
              <button type="submit" className="rounded border px-3 py-1 text-sm">Logout</button>
            </form>
          </div>
        ) : (
          <Link href="/login" className="rounded border px-3 py-1 text-sm">Login</Link>
        )}
      </div>
    </div>
  );
}
