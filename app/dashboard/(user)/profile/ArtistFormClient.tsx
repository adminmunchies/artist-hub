'use client';

import { useActionState, useState } from 'react';

type Initial = {
  id: string;
  name: string;
  city: string;
  bio: string;
  instagram_url: string;
  website_url: string;
  disciplines_csv: string;
  profile_image_url: string;
};

/** Avatar-Upload-Komponente (zeigt kein URL-Text, setzt nur Preview + hidden Feld im Parent) */
function AvatarField({
  initialUrl,
  onChange,
}: {
  initialUrl?: string;
  onChange: (url: string) => void;
}) {
  const [preview, setPreview] = useState<string | undefined>(initialUrl);
  const [busy, setBusy] = useState(false);

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append('file', f);
      const res = await fetch('/api/profile/avatar', { method: 'POST', body: fd });
      const json = await res.json();
      if (!res.ok || !json?.ok) throw new Error(json?.error || res.statusText);
      setPreview(json.url as string);
      onChange(json.url as string); // an Parent durchreichen -> hidden input wird aktualisiert
    } catch (err: any) {
      alert(`Upload failed: ${err.message ?? String(err)}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid gap-2">
      <label className="text-sm font-medium">Profile Image</label>

      <label className="rounded-full border px-4 py-2 w-fit cursor-pointer">
        <input type="file" accept="image/*" className="hidden" onChange={onPick} />
        {busy ? 'Uploading…' : 'Upload Profile Image'}
      </label>

      {preview ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={preview}
          alt="Avatar"
          className="h-40 w-40 rounded-full object-cover border"
        />
      ) : (
        <div className="h-40 w-40 rounded-full border grid place-items-center text-sm text-gray-500">
          No image
        </div>
      )}
    </div>
  );
}

export default function ArtistFormClient({
  initial,
  action,
}: {
  initial: Initial;
  action: (state: unknown, formData: FormData) => Promise<unknown>;
}) {
  const [, formAction, pending] = useActionState(action, null);

  // Hier liegt der aktuell zu speichernde Avatar-Link
  const [avatarUrl, setAvatarUrl] = useState<string>(initial.profile_image_url || '');

  return (
    <form action={formAction} className="grid gap-4 max-w-2xl">
      {/* Immer mitsenden */}
      <input type="hidden" name="id" defaultValue={initial.id} />
      <input type="hidden" name="profile_image_url" value={avatarUrl} />

      {/* Avatar ganz oben */}
      <AvatarField initialUrl={initial.profile_image_url} onChange={setAvatarUrl} />

      {/* Restliche Felder */}
      <label className="grid gap-1">
        <span>Name</span>
        <input name="name" defaultValue={initial.name} className="border rounded p-2" />
      </label>

      <label className="grid gap-1">
        <span>City</span>
        <input name="city" defaultValue={initial.city} className="border rounded p-2" />
      </label>

      <label className="grid gap-1">
        <span>Bio</span>
        <textarea
          name="bio"
          defaultValue={initial.bio}
          className="border rounded p-2 min-h-[120px]"
        />
      </label>

      <label className="grid gap-1">
        <span>Instagram URL</span>
        <input
          name="instagram_url"
          defaultValue={initial.instagram_url}
          className="border rounded p-2"
        />
      </label>

      <label className="grid gap-1">
        <span>Website URL</span>
        <input
          name="website_url"
          defaultValue={initial.website_url}
          className="border rounded p-2"
        />
      </label>

      <label className="grid gap-1">
        <span>Disciplines (comma separated)</span>
        <input
          name="disciplines_csv"
          defaultValue={initial.disciplines_csv}
          className="border rounded p-2"
        />
      </label>

      <button type="submit" disabled={pending} className="rounded-xl px-4 py-2 border shadow-sm">
        {pending ? 'Saving…' : 'Save Profile'}
      </button>
    </form>
  );
}
