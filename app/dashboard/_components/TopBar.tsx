"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

export default function TopBar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const active = (href: string) =>
    pathname.startsWith(href) ? "font-semibold" : "text-neutral-700";

  return (
    <header className="border-b">
      <div className="max-w-5xl mx-auto h-14 px-4 flex items-center justify-between">
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/dashboard/profile" className={active("/dashboard/profile")}>
            Profile
          </Link>
          <Link href="/" className={active("/dashboard/works")}>
            Works
          </Link>
          <Link href="/dashboard/exhibitions" className={active("/dashboard/exhibitions")}>
            Exhibitions
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <form action="/api/auth/logout" method="post" className="hidden md:block">
            <button className="rounded-full border px-4 py-2">Logout</button>
          </form>
          <button
            className="md:hidden rounded-full border px-3 py-2"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle Menu"
          >
            Menu
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t px-4 py-3 flex flex-col gap-3">
          <Link href="/dashboard/profile" onClick={() => setOpen(false)}>
            Profile
          </Link>
          <Link href="/" onClick={() => setOpen(false)}>
            Works
          </Link>
          <Link href="/dashboard/exhibitions" onClick={() => setOpen(false)}>
            Exhibitions
          </Link>
          <form action="/api/auth/logout" method="post">
            <button className="rounded-full border px-4 py-2 mt-2 w-full">Logout</button>
          </form>
        </div>
      )}
    </header>
  );
}
