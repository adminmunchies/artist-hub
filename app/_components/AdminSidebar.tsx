// app/_components/AdminSidebar.tsx
import Link from "next/link";

export default function AdminSidebar() {
  return (
    <aside className="w-56 shrink-0 border-r bg-white/70 backdrop-blur min-h-screen">
      <div className="p-4 border-b">
        <Link href="/" prefetch={false} className="rounded-full border px-3 py-1.5 inline-block">
          Back to Public
        </Link>
      </div>

      <nav className="p-4 space-y-2">
        <Link href="/dashboard/admin" prefetch={false} className="block rounded-lg border px-3 py-2 hover:bg-gray-50">
          News
        </Link>
        <Link href="/dashboard/admin/settings" prefetch={false} className="block rounded-lg border px-3 py-2 hover:bg-gray-50">
          Settings
        </Link>
      </nav>

      <div className="p-4 mt-auto">
        <a href="/auth/signout" className="rounded-full border px-3 py-1.5 inline-block">
          Logout
        </a>
      </div>
    </aside>
  );
}

