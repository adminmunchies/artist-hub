// app/(public)/artists/SearchBox.tsx
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";

export default function SearchBox() {
  const router = useRouter();
  const sp = useSearchParams();
  const [q, setQ] = useState(sp.get("q") ?? "");

  useEffect(() => {
    setQ(sp.get("q") ?? "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sp?.get("q")]);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const v = q.trim();
    const url = v ? `/artists?q=${encodeURIComponent(v)}` : `/artists`;
    router.push(url);
  }

  return (
    <form onSubmit={onSubmit} className="mb-6 flex gap-2">
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search artists, disciplines, tags, city…"
        className="flex-1 rounded-lg border px-3 py-2"
        aria-label="Search"
      />
      <button className="rounded-lg border px-4 py-2 hover:bg-gray-50" type="submit">
        Search
      </button>
    </form>
  );
}
