"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type Props = {
  currentUrl?: string;
  hiddenFieldId?: string;          // primäres Feldname (default: "image_url")
  extraHiddenFieldIds?: string[];  // z.B. ["thumbnail_url"]
};

const ACCEPTED = ["image/jpeg", "image/png", "image/webp"];
const MAX_MB = 12;

// Optionale Konvertierung in WebP (leise fail-safe)
async function toWebP(file: File): Promise<File> {
  try {
    if (file.type === "image/webp") return file;
    const bmp = await createImageBitmap(file);
    const canvas = document.createElement("canvas");
    canvas.width = bmp.width;
    canvas.height = bmp.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(bmp, 0, 0);
    const blob = await new Promise<Blob | null>((res) =>
      canvas.toBlob((b) => res(b), "image/webp", 0.92)
    );
    if (!blob) return file;
    return new File([blob], file.name.replace(/\.\w+$/, ".webp"), { type: "image/webp" });
  } catch {
    return file;
  }
}

export default function ImageUploadField({
  currentUrl,
  hiddenFieldId = "image_url",
  extraHiddenFieldIds = [],
}: Props) {
  // Ein einziger "source of truth" für alle Hidden-Felder
  const [value, setValue] = useState<string>(currentUrl ?? "");
  const [preview, setPreview] = useState<string | undefined>(currentUrl);
  const [busy, setBusy] = useState(false);

  // Falls der Server nach Save mit neuem Wert rendert
  useEffect(() => {
    setValue(currentUrl ?? "");
    setPreview(currentUrl ?? undefined);
  }, [currentUrl]);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ACCEPTED.includes(file.type)) {
      alert("Please upload JPG/PNG/WEBP.");
      return;
    }
    if (file.size > MAX_MB * 1024 * 1024) {
      alert(`Max file size is ${MAX_MB} MB.`);
      return;
    }

    setBusy(true);
    const uploadFile = await toWebP(file);
    const name = `${crypto.randomUUID()}-${uploadFile.name}`;

    const { error } = await supabase.storage.from("works").upload(name, uploadFile, { upsert: false });
    if (error) {
      setBusy(false);
      alert(error.message);
      return;
    }

    const { data } = supabase.storage.from("works").getPublicUrl(name);
    const url = data.publicUrl;

    // Jetzt kontrolliert setzen – diese Werte werden SICHER mit dem Form abgesendet
    setValue(url);
    setPreview(url);
    setBusy(false);
  }

  return (
    <div className="space-y-3">
      <label className="block text-sm">Image</label>
      <input type="file" accept={ACCEPTED.join(",")} onChange={handleFile} disabled={busy} />

      {/* Hidden inputs: controlled value -> kommt garantiert im Server an */}
      <input id={hiddenFieldId} name={hiddenFieldId} type="hidden" value={value} readOnly />
      {extraHiddenFieldIds.map((id) => (
        <input key={id} id={id} name={id} type="hidden" value={value} readOnly />
      ))}

      {preview ? (
        <div className="overflow-hidden rounded-xl border">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview} alt="" className="w-full h-auto object-cover" />
        </div>
      ) : null}

      {busy ? <div className="text-xs opacity-70">Uploading…</div> : null}
    </div>
  );
}
