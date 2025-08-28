// app/works/[id]/edit/DeleteButton.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DeleteButton({ workId }: { workId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const onDelete = async () => {
    if (!confirm("Delete this work? This cannot be undone.")) return;
    setBusy(true);
    const res = await fetch(`/api/works/${workId}/delete`, { method: "DELETE" });
    setBusy(false);
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      alert(j?.error || "Delete failed.");
      return;
    }
    router.push("/dashboard/works");
  };

  return (
    <button
      type="button"
      onClick={onDelete}
      disabled={busy}
      className="rounded-full border border-red-300 px-4 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-60"
    >
      {busy ? "Deleting…" : "Delete"}
    </button>
  );
}
