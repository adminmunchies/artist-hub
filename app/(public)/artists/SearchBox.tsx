// app/(public)/artists/SearchBox.tsx
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SearchBox() {
  const [v, setV] = useState("");
  const router = useRouter();

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const url = v ? `/search?q=${encodeURIComponent(v)}` : `/search`;
        router.push(url);
      }}
      className="flex gap-2"
    >
      <input
        value={v}
        onChange={(e) => setV(e.target.value)}
        placeholder="Search artists, disciplines, tags, city…"
        aria-label="Search"
        className="w-full border rounded-md px-3 py-2"
      />
      <button className="border rounded-md px-4">Search</button>
    </form>
  );
}
