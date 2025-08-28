"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { saveSettings } from "./actions";

type Artist = {
  id?: string;
  name?: string | null;
  city?: string | null;
  bio?: string | null;
  instagram_url?: string | null;
  website_url?: string | null;
  disciplines?: string[] | null;
  profile_image_url?: string | null;
};

export default function SettingsForm({ initial }: { initial: Artist }) {
  const [state, formAction, pending] = useActionState(saveSettings, { ok: false } as any);
  const [preview, setPreview] = useState<string | null>(initial.profile_image_url ?? null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (state?.ok && fileRef.current) {
      fileRef.current.value = "";
    }
  }, [state?.ok]);

  return (
    <form action={formAction} encType="multipart/form-data" className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="h-20 w-20 overflow-hidden rounded-full bg-gray-100">
          {preview ? <img src={preview} alt="Profile" className="h-20 w-20 object-cover" /> : null}
        </div>
        <div className="space-y-2">
          <input type="file" name="profile_image" ref={fileRef}
                 accept="image/png,image/jpeg,image/webp"
                 onChange={(e) => {
                   const f = e.target.files?.[0];
                   if (f) setPreview(URL.createObjectURL(f));
                 }}
                 className="text-sm" />
          <div className="text-xs text-gray-500">JPEG/PNG/WebP · max 10MB</div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="block">
          <div className="mb-1 text-sm">Name</div>
          <input name="name" defaultValue={initial.name ?? ""} className="w-full rounded border px-3 py-2" />
        </label>
        <label className="block">
          <div className="mb-1 text-sm">City</div>
          <input name="city" defaultValue={initial.city ?? ""} className="w-full rounded border px-3 py-2" />
        </label>
      </div>

      <label className="block">
        <div className="mb-1 text-sm">Bio (max 800 chars)</div>
        <textarea name="bio" maxLength={800}
                  defaultValue={initial.bio ?? ""}
                  rows={6}
                  className="w-full rounded border px-3 py-2" />
      </label>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="block">
          <div className="mb-1 text-sm">Instagram URL</div>
          <input name="instagram_url" defaultValue={initial.instagram_url ?? ""} className="w-full rounded border px-3 py-2" />
        </label>
        <label className="block">
          <div className="mb-1 text-sm">Website URL</div>
          <input name="website_url" defaultValue={initial.website_url ?? ""} className="w-full rounded border px-3 py-2" />
        </label>
      </div>

      <label className="block">
        <div className="mb-1 text-sm">Disciplines (comma separated)</div>
        <input
          name="disciplines"
          defaultValue={(initial.disciplines ?? []).join(", ")}
          placeholder="sculpture, painting, installation"
          className="w-full rounded border px-3 py-2"
        />
      </label>

      <div className="flex items-center gap-3">
        <button disabled={pending}
                className="rounded border px-4 py-2">
          {pending ? "Saving…" : "Save"}
        </button>
        {state?.error ? (
          <div className="text-sm text-red-600">Error: {state.error}</div>
        ) : state?.ok ? (
          <div className="text-sm text-green-600">Saved</div>
        ) : null}
      </div>
    </form>
  );
}
