"use client";

import { useRef, useState } from "react";

export default function AvatarUploader() {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setBusy(true);
    setMsg(null);
    try {
      const fd = new FormData();
      fd.append("file", f);
      const res = await fetch("/api/profile/avatar", { method: "POST", body: fd });
      const j = await res.json();
      if (!res.ok || !j?.ok) throw new Error(j?.error || "Upload failed");
      setMsg("Uploaded ✓");
      setTimeout(() => window.location.reload(), 350);
    } catch (err: any) {
      setMsg(err?.message || "Upload failed");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <label className="rounded-full border px-4 py-2 cursor-pointer">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={onChange}
          disabled={busy}
        />
        <span>{busy ? "Uploading…" : "Choose Image"}</span>
      </label>
      {msg && <p className="text-xs text-zinc-500">{msg}</p>}
      <p className="text-xs text-zinc-500">Allowed: JPG/PNG/WEBP, max 10MB.</p>
    </div>
  );
}
