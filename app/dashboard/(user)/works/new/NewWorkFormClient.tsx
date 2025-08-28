'use client';

import { useActionState, useState } from 'react';
import { createWorkAction, type NewWorkState } from './actions';

export default function NewWorkFormClient() {
  const [preview, setPreview] = useState<string | null>(null);
  const [state, formAction] = useActionState(createWorkAction, {} as NewWorkState);

  return (
    <form action={formAction} className="grid grid-cols-1 gap-8 md:grid-cols-2">
      <div className="space-y-3">
        <div className="aspect-[4/3] overflow-hidden rounded-2xl border bg-neutral-100">
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="Preview" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-neutral-500">
              No image
            </div>
          )}
        </div>

        <input
          type="file"
          name="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={(e) => {
            const f = e.currentTarget.files?.[0];
            if (f) setPreview(URL.createObjectURL(f));
          }}
        />
        <p className="text-xs text-neutral-500">Allowed: JPG/PNG/WEBP, max 10MB.</p>
      </div>

      <div className="space-y-4">
        {state?.error ? (
          <div className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
            {state.error}
          </div>
        ) : null}

        <div className="space-y-2">
          <label className="text-sm font-medium">Title</label>
          <input name="title" className="w-full rounded-md border px-3 py-2" placeholder="Title" />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Description</label>
          <textarea
            name="description"
            className="min-h-[120px] w-full rounded-md border px-3 py-2"
            placeholder="Description"
          />
        </div>

        <div className="flex items-center gap-2">
          <input id="is_published" name="is_published" type="checkbox" className="h-4 w-4" />
          <label htmlFor="is_published" className="text-sm">
            Published (visible on public)
          </label>
        </div>

        <button className="rounded-full border px-4 py-2">Create Work</button>
      </div>
    </form>
  );
}
