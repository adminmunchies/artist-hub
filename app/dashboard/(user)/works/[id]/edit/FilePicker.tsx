'use client';

import { useEffect, useRef, useState } from 'react';

export default function FilePicker({
  inputName,
  label = 'Choose image',
}: {
  inputName: string;
  label?: string;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  return (
    <div className="space-y-2">
      {preview ? (
        <img src={preview} alt="preview" className="w-full rounded-2xl border object-cover" />
      ) : (
        <div className="h-48 w-full rounded-2xl border bg-neutral-100 flex items-center justify-center text-sm text-neutral-500">
          No new image selected
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        name={inputName}
        accept="image/*"
        className="block w-full"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (!f) return setPreview(null);
          setPreview(URL.createObjectURL(f));
        }}
      />
    </div>
  );
}
