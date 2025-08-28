// app/works/[id]/image/ReplaceImageForm.tsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ReplaceImageForm({
  workId,
  artistId,
}: { workId: string; artistId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setBusy(true);
    const fd = new FormData(e.currentTarget);
    const res = await fetch(`/api/works/${workId}/image`, { method: "POST", body: fd });
    setBusy(false);

    if (!res.ok) {
      const t = await res.text().catch(() => "");
      alert(t || "Upload failed");
      return;
    }

    // Nach Erfolg direkt zum öffentlichen Profil
    router.push(`/a/${artistId}`);
  };

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <label className="block text-sm">Select image</label>
      <input
        name="file"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        required
        className="w-full rounded-md border px-3 py-2"
      />
      <p className="text-xs text-neutral-500">Allowed: JPG/PNG/WEBP, max 10 MB.</p>
      <div className="flex gap-3 pt-2">
        <button disabled={busy} className="rounded-full bg-black px-4 py-2 text-white">
          {busy ? "Uploading…" : "Save image"}
        </button>
        <button type="button" onClick={() => router.back()} className="rounded-full border px-4 py-2">
          Cancel
        </button>
      </div>
    </form>
  );
}
