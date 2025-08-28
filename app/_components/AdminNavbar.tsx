import Link from "next/link";

export default function AdminNavbar() {
  return (
    <header className="sticky top-0 z-10 border-b bg-white/80 backdrop-blur">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
        <nav className="flex items-center gap-5">
          <Link href="/" prefetch={false} className="font-semibold">Artist Hub</Link>
          <Link href="/dashboard/admin" prefetch={false}>News</Link>
          <Link href="/dashboard/admin/settings" prefetch={false}>Settings</Link>
        </nav>
        <div className="flex items-center gap-2">
          <a href="/auth/signout" className="rounded-full border px-4 py-1.5">Logout</a>
        </div>
      </div>
    </header>
  );
}
