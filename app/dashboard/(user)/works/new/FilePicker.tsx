"use client";
import { useState } from "react";
export default function FilePicker({ inputName, label }: { inputName: string; label: string }) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  return (
    <div className="space-y-2">
      <div className="aspect-video bg-gray-50 rounded-md overflow-hidden">
        {previewUrl ? <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" /> : null}
      </div>
      <input
        id={`${inputName}-input`}
        name={inputName}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) setPreviewUrl(URL.createObjectURL(f));
        }}
      />
      <label htmlFor={`${inputName}-input`} className="inline-block px-4 py-2 rounded-md border cursor-pointer">
        {label}
      </label>
    </div>
  );
}
