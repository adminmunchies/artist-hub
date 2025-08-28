"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function SearchBox() {
  const router = useRouter();
  const sp = useSearchParams();
  const [val, setVal] = useState(sp.get("q") ?? "");

  // sync wenn Back/Forward genutzt wird
  useEffect(() => setVal(sp.get("q") ?? ""), [sp]);

  // debounce & URL-Param aktualisieren
  useEffect(() => {
    const t = setTimeout(() => {
      const q = val.trim();
      const params = new URLSearchParams(Array.from(sp.entries()));
      if (q) params.set("q", q);
      else params.delete("q");
      router.replace(`/artists?${params.toString()}`, { scroll: false });
    }, 300);
    return () => clearTimeout(t);
  }, [val]); // bewusst minimal

  return (
    <div className="sticky top-0 z-10 bg-white/70 backdrop-blur border-b py-4 mb-6">
      <div className="max-w-6xl mx-auto px-4">
        <input
          value={val}
          onChange={(e) => setVal(e.target.value)}
          placeholder="Search artists, tags, disciplines, locations…"
          className="w-full rounded-2xl border px-4 py-3 text-base"
          autoFocus
        />
      </div>
    </div>
  );
}
