// app/dashboard/works/[id]/edit/EditFormClient.tsx
"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { EditState } from "./page";

type Work = {
  id: string;
  title: string | null;
  description: string | null;
  image_url: string | null;
  published: boolean;
};

type Props = {
  work: Work;
  saveAction: (
    prev: EditState | undefined,
    formData: FormData
  ) => Promise<EditState | void>;
  deleteAction: (
    prev: EditState | undefined,
    formData: FormData
  ) => Promise<EditState | void>;
};

export default function EditFormClient({ work, saveAction, deleteAction }: Props) {
  const [state, saveFormAction] = useActionState(saveAction, {});
  const [delState, deleteFormAction] = useActionState(deleteAction, {});
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (state?.ok || state?.error) {
      const t = setTimeout(() => {}, 2000);
      return () => clearTimeout(t);
    }
  }, [state]);

  // AJAX Upload -> keine Navigation zur API-Seite
  const onReplace = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setUploading(true);
    try {
      const fd = new FormData(e.currentTarget as HTMLFormElement);
      const res = await fetch(`/api/works/${work.id}/image`, { method: "POST", body: fd });
      if (!res.ok) {
        const msg = await res.text().catch(() => "");
        alert(msg || "Upload failed");
      } else {
        // Seite aktualisieren, damit das neue Bild erscheint
        router.refresh();
      }
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
      {/* ---- Save Form ---- */}
      <form action={saveFormAction} className="space-y-4">
        <input type="hidden" name="id" defaultValue={work.id} />

        <div className="space-y-2">
          <label className="block text-sm font-medium">Title</label>
          <input
            name="title"
            defaultValue={work.title ?? ""}
            className="w-full rounded-md border px-3 py-2"
            placeholder="Title"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium">Description</label>
          <textarea
            name="description"
            defaultValue={work.description ?? ""}
            className="w-full min-h-[120px] rounded-md border px-3 py-2"
            placeholder="Description"
          />
        </div>

        <label className="flex items-center gap-2 pt-1 text-sm">
          <input
            type="checkbox"
            name="published"
            defaultChecked={!!work.published}
            className="h-4 w-4"
          />
          <span>Published (visible on public)</span>
        </label>

        {state?.error ? (
          <div className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
            {state.error}
          </div>
        ) : null}

        <button
          type="submit"
          className="rounded-full bg-black px-4 py-2 text-sm text-white"
        >
          Save
        </button>
      </form>

      {/* ---- Right: Preview + Replace + Delete ---- */}
      <div className="space-y-4">
        <figure className="overflow-hidden rounded-2xl border">
          <div className="aspect-[4/3] bg-neutral-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={preview || work.image_url || ""}
              alt={work.title || "work"}
              className="h-full w-full object-cover"
            />
          </div>
          <figcaption className="px-3 py-2 text-sm text-neutral-600">
            {work.title || "Untitled"}
          </figcaption>
        </figure>

        {/* Replace Image (AJAX) */}
        <form onSubmit={onReplace} className="rounded-2xl border p-3 space-y-2">
          <p className="text-sm font-medium">Replace image</p>
          <input
            name="file"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="block w-full cursor-pointer rounded-md border px-3 py-2 text-sm"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return setPreview(null);
              const reader = new FileReader();
              reader.onload = () => setPreview(String(reader.result || ""));
              reader.readAsDataURL(file);
            }}
            required
          />
          <p className="text-xs text-neutral-500">
            Allowed: JPG/PNG/WEBP, max 10 MB.
          </p>
          <button
            type="submit"
            className="rounded-full border px-4 py-2 text-sm"
            disabled={uploading}
          >
            {uploading ? "Uploading…" : "Upload"}
          </button>
        </form>

        {/* Delete */}
        <form action={deleteFormAction} className="self-start">
          <input type="hidden" name="id" defaultValue={work.id} />
          {delState?.error ? (
            <div className="mb-3 rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
              {delState.error}
            </div>
          ) : null}
          <button
            type="submit"
            className="rounded-full border border-red-300 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
          >
            Delete
          </button>
        </form>
      </div>
    </div>
  );
}
