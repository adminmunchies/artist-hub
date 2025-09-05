"use client";

import { useActionState } from "react";
import { updateWorkAction, deleteWorkAction } from "../actions";

type Work = {
  id: string;
  title: string | null;
  image_url: string | null;
  thumbnail_url: string | null;
  published: boolean | null;
};

export default function EditFormClient({ work }: { work: Work }) {
  const [, updateAction] = useActionState(updateWorkAction, undefined);
  const [, deleteAction] = useActionState(deleteWorkAction, undefined);

  return (
    <div className="space-y-8">
      {/* Update */}
      <form action={updateAction} className="space-y-4 rounded-2xl border p-4">
        <input type="hidden" name="id" value={work.id} />
        <div>
          <label className="block text-sm mb-1">Title</label>
          <input
            name="title"
            defaultValue={work.title ?? ""}
            className="w-full rounded-md border px-3 py-2"
            placeholder="Untitled"
          />
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="published"
            defaultChecked={work.published === true}
            className="h-4 w-4"
          />
          Published (visible on public)
        </label>

        <div className="flex items-center gap-3">
          <button className="rounded-full border px-4 py-2">Save</button>
        </div>
      </form>

      {/* Danger zone */}
      <form
        action={deleteAction}
        className="rounded-2xl border border-red-200 bg-red-50 p-4"
        onSubmit={(e) => {
          if (!confirm("Delete this work? This cannot be undone.")) {
            e.preventDefault();
          }
        }}
      >
        <input type="hidden" name="id" value={work.id} />
        <button className="rounded-full border border-red-300 px-4 py-2 text-red-700">
          Delete work
        </button>
      </form>
    </div>
  );
}
