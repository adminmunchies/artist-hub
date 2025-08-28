"use client";

import Link from "next/link";
import { routes } from "@/lib/routes";
import { useFormStatus } from "react-dom";
import { updateWorkAction, deleteWorkAction } from "./actions";

type Work = {
  id: string;
  artist_id: string;
  title: string | null;
  image_url: string | null;
  thumbnail_url: string | null;
  published: boolean | null;
};

export default function EditFormClient({ work }: { work: Work }) {
  return (
    <div className="space-y-6">
      {/* UPDATE */}
      <form action={updateWorkAction} className="space-y-4 rounded-2xl border p-4">
        <input type="hidden" name="id" value={work.id} />

        <div className="space-y-1">
          <label className="text-sm font-medium">Title</label>
          <input
            name="title"
            defaultValue={work.title ?? ""}
            className="w-full rounded-lg border px-3 py-2"
            placeholder="Untitled"
          />
        </div>

        <label className="inline-flex items-center gap-2">
          <input type="checkbox" name="published" defaultChecked={!!work.published} />
          <span>Published</span>
        </label>

        <div className="flex items-center gap-3">
          <SubmitButton>Save</SubmitButton>
          <Link href={routes.workImage(work.id)} className="rounded-full border px-4 py-2">
            Change image
          </Link>
        </div>
      </form>

      {/* DELETE separat */}
      <form action={deleteWorkAction} className="rounded-2xl border p-4">
        <input type="hidden" name="id" value={work.id} />
        <DeleteButton />
      </form>

      {/* Links */}
      <div className="flex items-center gap-3">
        <Link
          href={routes.publicArtist(work.artist_id)}
          target="_blank"
          rel="noreferrer"
          className="rounded-full border px-4 py-2"
        >
          Preview
        </Link>
        <Link href={routes.dashboardWorks()} className="rounded-full border px-4 py-2">
          Back to Works
        </Link>
      </div>
    </div>
  );
}

function SubmitButton({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-full border px-4 py-2 disabled:opacity-60"
    >
      {pending ? "Saving..." : children}
    </button>
  );
}

function DeleteButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-full border px-4 py-2 text-red-600 disabled:opacity-60"
    >
      {pending ? "Deleting..." : "Delete"}
    </button>
  );
}
