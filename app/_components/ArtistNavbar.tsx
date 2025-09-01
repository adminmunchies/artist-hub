import Link from "next/link";
import { getRole } from "@/lib/role";

export default async function ArtistNavbar() {
  const { artistId } = await getRole();
  return (
    <header className="sticky top-0 z-10 border-b bg-white/80 backdrop-blur">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
        <nav className="flex items-center gap-5">
          <Link href="/" prefetch={false} className="font-semibold">Artist Hub</Link>
          <Link href="/" prefetch={false}>Works</Link>
          <Link href="/dashboard/profile" prefetch={false}>Profile</Link>
          <Link href="/dashboard/news" prefetch={false}>News</Link>
          <Link href="/dashboard/settings" prefetch={false}>Settings</Link>
        </nav>
        <div className="flex items-center gap-2">
          {artistId && (
            <Link href={`/a/${artistId}`} prefetch={false} className="rounded-full border px-4 py-1.5">
              My public page
            </Link>
          )}
          <a href="/auth/signout" className="rounded-full border px-4 py-1.5">Logout</a>
        </div>
      </div>
    </header>
  );
}

