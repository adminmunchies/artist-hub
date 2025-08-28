// app/dashboard/works/[id]/edit/ImagePicker.tsx
"use client";

import { useState } from "react";

export default function ImagePicker({
  name = "file",
  label = "New image (optional)",
}: {
  name?: string;
  label?: string;
}) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  return (
    <div className="space-y-2 pt-2">
      <label className="block text-sm font-medium">{label}</label>

      <div
        className="flex min-h-[200px] items-center justify-center rounded-lg border bg-neutral-50 p-3 text-xs text-neutral-500"
      >
        {previewUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={previewUrl}
            alt="new image preview"
            className="max-h-[360px] w-auto rounded-xl"
          />
        ) : (
          "No new image selected"
        )}
      </div>

      <input
        type="file"
        name={name}
        accept="image/jpeg,image/png,image/webp"
        className="block w-full rounded-md border px-3 py-2"
        onChange={(e) => {
          const file = e.currentTarget.files?.[0] || null;
          if (file) {
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
          } else {
            setPreviewUrl(null);
          }
        }}
      />

      <p className="text-xs text-neutral-500">
        Allowed: JPG/PNG/WEBP, max 10 MB.
      </p>
    </div>
  );
}
