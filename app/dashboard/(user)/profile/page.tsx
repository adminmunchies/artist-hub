// app/dashboard/profile/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Artist = {
  id: string;
  name: string | null;
  city: string | null;
  bio: string | null;
  instagram_url: string | null;
  website_url: string | null;
  avatar_url: string | null;
  disciplines: string[] | null;
};

export default function ProfilePage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [artist, setArtist] = useState<Artist | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Prefill laden
  useEffect(() => {
    (async () => {
      const res = await fetch("/api/profile/me", { cache: "no-store" });
      const json = await res.json();
      if (json?.artist) setArtist(json.artist);
    })();
  }, []);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return setPreviewUrl(null);
    const u = URL.createObjectURL(f);
    setPreviewUrl(u);
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);

    const fd = new FormData(e.currentTarget);
    const rawDisciplines = String(fd.get("disciplines") || "");

    const payload: Record<string, unknown> = {
      name: String(fd.get("name") || "").trim(),
      city: String(fd.get("city") || "").trim(),
      bio: String(fd.get("bio") || ""),
      instagram_url: String(fd.get("instagram_url") || "").trim(),
      website_url: String(fd.get("website_url") || "").trim(),
      disciplines: rawDisciplines.split(",").map(s => s.trim()).filter(Boolean),
    };

    // leere Werte nicht überschreiben
    for (const [k, v] of Object.entries(payload)) {
      if (typeof v === "string" && v.trim() === "") delete (payload as any)[k];
      if (Array.isArray(v) && v.length === 0) delete (payload as any)[k];
    }

    const res = await fetch("/api/profile/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      alert(JSON.stringify(err));
      setSaving(false);
      return;
    }

    const data = await res.json().catch(() => ({} as any));
    router.push(data?.artistId ? `/a/${data.artistId}` : "/artists");
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <h1 className="text-3xl font-semibold mb-8">Profile</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* LEFT: Avatar */}
        <div>
          <div className="border rounded-2xl p-4">
            <div className="mb-4">
              <div className="text-sm mb-2">Avatar</div>
              <div className="aspect-square w-48 rounded-xl border overflow-hidden bg-gray-50 flex items-center justify-center">
                {previewUrl ? (
                  <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                ) : artist?.avatar_url ? (
                  <img src={artist.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xs text-gray-500">No image selected</span>
                )}
              </div>
            </div>

            <form
              key={artist?.id || "new"}
              action="/api/profile/avatar"
              method="POST"
              encType="multipart/form-data"
              className="space-y-3"
            >
              <input
                type="file"
                name="file"
                accept="image/*"
                onChange={onFileChange}
                className="w-full rounded-md border px-3 py-2"
                required
              />
              <div>
                <button type="submit" className="rounded-full border px-5 py-2">
                  Save Avatar
                </button>
              </div>
              <p className="text-xs text-gray-500">
                After saving you’ll be redirected to your public profile.
              </p>
            </form>
          </div>
        </div>

        {/* RIGHT: Text fields */}
        <div>
          <form key={artist?.id || "new"} onSubmit={onSubmit} className="space-y-6">
            <div>
              <label className="block text-sm mb-1">Name</label>
              <input
                name="name"
                defaultValue={artist?.name ?? ""}
                placeholder="Artist name"
                className="w-full rounded-md border px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm mb-1">City</label>
              <input
                name="city"
                defaultValue={artist?.city ?? ""}
                placeholder="Vienna"
                className="w-full rounded-md border px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm mb-1">Bio</label>
              <textarea
                name="bio"
                defaultValue={artist?.bio ?? ""}
                placeholder="Short bio"
                rows={5}
                className="w-full rounded-md border px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm mb-1">Instagram URL</label>
              <input
                name="instagram_url"
                defaultValue={artist?.instagram_url ?? ""}
                placeholder="https://instagram.com/…"
                className="w-full rounded-md border px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm mb-1">Website URL</label>
              <input
                name="website_url"
                defaultValue={artist?.website_url ?? ""}
                placeholder="https://example.com"
                className="w-full rounded-md border px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm mb-1">Disciplines (comma separated)</label>
              <input
                name="disciplines"
                defaultValue={
                  Array.isArray(artist?.disciplines) ? artist!.disciplines.join(", ") : ""
                }
                placeholder="sculpture, installation, painting"
                className="w-full rounded-md border px-3 py-2"
              />
              <p className="text-xs text-gray-500 mt-1">Example: sculpture, installation, painting</p>
            </div>

            <button type="submit" disabled={saving} className="rounded-full border px-5 py-2">
              {saving ? "Saving…" : "Save"}
            </button>
            <p className="text-xs text-gray-500">After saving you’ll be redirected to your public profile.</p>
          </form>
        </div>
      </div>
    </div>
  );
}
