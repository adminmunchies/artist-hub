"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type Props = { currentUrl?: string };

export default function ImageUploadField({ currentUrl }: Props) {
  const [preview, setPreview] = useState<string | undefined>(currentUrl);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const ext = file.name.split(".").pop() || "jpg";
    const name = `${crypto.randomUUID()}.${ext}`;

    const { error } = await supabase.storage.from("works").upload(name, file);
    if (error) {
      alert(error.message);
      return;
    }

    const { data } = supabase.storage.from("works").getPublicUrl(name);
    const url = data.publicUrl;
    setPreview(url);

    const hidden = document.getElementById("image_url") as HTMLInputElement;
    if (hidden) hidden.value = url;
  }

  return (
    <div className="space-y-3">
      <label className="block text-sm">Image</label>
      <input type="file" accept="image/*" onChange={handleFile} />
      <input id="image_url" name="image_url" type="hidden" defaultValue={currentUrl} />
      {preview ? (
        <div className="overflow-hidden rounded-xl border">
          <img src={preview} alt="" className="w-full h-auto object-cover" />
        </div>
      ) : null}
    </div>
  );
}
