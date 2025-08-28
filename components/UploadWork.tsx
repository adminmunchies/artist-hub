'use client';

import { useRef, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

async function compressToWebp(file: File, maxw = 2000, quality = 0.85): Promise<File> {
  const bmp = await createImageBitmap(file);
  const ratio = Math.min(1, maxw / bmp.width);
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bmp.width * ratio);
  canvas.height = Math.round(bmp.height * ratio);
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(bmp, 0, 0, canvas.width, canvas.height);
  const blob: Blob = await new Promise(res => canvas.toBlob(b => res(b as Blob), 'image/webp', quality));
  return new File([blob], file.name.replace(/\.\w+$/, '.webp'), { type: 'image/webp' });
}

// SWC-sichere Slug-Funktion
function slugify(s: string) {
  return s
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export default function UploadWork() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [year, setYear] = useState<number | ''>('');
  const [medium, setMedium] = useState('');
  const [dimensions, setDimensions] = useState('');
  const [imageCredit, setImageCredit] = useState(''); // NEW
  const [active, setActive] = useState(true);

  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  function pickFile() { fileInputRef.current?.click(); }
  function takeFile(f: File | null) {
    setFile(f); setPreview(f ? URL.createObjectURL(f) : null);
  }
  function onDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault(); const f = e.dataTransfer.files?.[0] ?? null; if (f) takeFile(f);
  }

  async function handleSubmit() {
    setMsg(null); setErr(null);
    if (!file) { setErr('Bitte ein Bild auswählen.'); return; }
    if (!title.trim()) { setErr('Titel ist erforderlich.'); return; }
    setBusy(true);

    const { data: { user }, error: uErr } = await supabase.auth.getUser();
    if (uErr || !user) { setErr('Bitte einloggen.'); setBusy(false); return; }

    const { data: artist, error: aErr } = await supabase
      .from('artists').select('id,name').eq('user_id', user.id).maybeSingle();
    if (aErr || !artist) { setErr('Kein Artist-Profil gefunden.'); setBusy(false); return; }

    try {
      const webp = await compressToWebp(file);
      const base = [artist.name ? slugify(artist.name) : null, title ? slugify(title) : 'work', year ? String(year) : null]
        .filter(Boolean).join('-');
      const filename = `${base}-${Date.now()}.webp`;
      const path = `${user.id}/${filename}`;

      const { error: upErr } = await supabase.storage.from('works').upload(path, webp, { upsert: true });
      if (upErr) throw upErr;

      const { data: pub } = supabase.storage.from('works').getPublicUrl(path);
      const image_url = pub.publicUrl;

      const { error: insErr } = await supabase.from('works').insert({
        artist_id: artist.id,
        title: title.trim(),
        year: year === '' ? null : Number(year),
        medium: medium.trim() || null,
        dimensions: dimensions.trim() || null,
        image_url,
        image_credit: imageCredit.trim() || null, // NEW (optional)
        is_active: active,
      });
      if (insErr) throw insErr;

      setMsg('Work angelegt.');
      window.location.href = '/dashboard/works';
    } catch (e: any) {
      setErr(e.message || 'Upload fehlgeschlagen.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-5">
      {msg && <div className="rounded bg-green-50 text-green-800 px-3 py-2 text-sm">{msg}</div>}
      {err && <div className="rounded bg-red-50 text-red-700 px-3 py-2 text-sm">{err}</div>}

      {/* IMAGE PICKER */}
      <div className="space-y-2">
        <span className="text-sm font-medium">Image</span>
        <div
          onClick={pickFile}
          onDragOver={(e) => e.preventDefault()}
          onDrop={onDrop}
          role="button"
          className="rounded-xl border border-dashed p-6 cursor-pointer hover:bg-neutral-50 transition"
          aria-label="Bild auswählen"
        >
          {!preview ? (
            <div className="flex items-center justify-between gap-4">
              <div className="text-sm opacity-70">Wähle ein Bild aus oder ziehe es hierher.</div>
              <button type="button" className="rounded-2xl border px-3 py-1.5 text-sm hover:shadow">Choose image</button>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <img src={preview} alt="" className="w-24 h-24 object-cover rounded-lg" />
              <div className="text-sm">
                <div className="font-medium">{file?.name}</div>
                <button type="button" onClick={() => takeFile(null)} className="mt-1 underline text-xs">
                  entfernen / anderes Bild wählen
                </button>
              </div>
            </div>
          )}
        </div>
        <input ref={fileInputRef} type="file" accept="image/*" onChange={e => takeFile(e.target.files?.[0] ?? null)} className="sr-only" />
        <div className="text-[11px] opacity-60">Auto-Resize ~2000px, Ausgabe <code>.webp</code> (Q 85%).</div>
      </div>

      {/* FORM */}
      <label className="block">
        <span className="text-sm font-medium">Title *</span>
        <input className="mt-1 w-full rounded border px-3 py-2" value={title} onChange={e => setTitle(e.target.value)} />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium">Year</span>
          <input className="mt-1 w-full rounded border px-3 py-2" type="number"
            value={year} onChange={e => setYear(e.target.value === '' ? '' : Number(e.target.value))} />
        </label>
        <label className="block">
          <span className="text-sm font-medium">Medium</span>
          <input className="mt-1 w-full rounded border px-3 py-2" value={medium} onChange={e => setMedium(e.target.value)} />
        </label>
      </div>

      {/* kürzere Dimensions + neues Credit-Feld nebeneinander */}
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium">Dimensions (e.g., 120×90 cm)</span>
          <input className="mt-1 w-full rounded border px-3 py-2" value={dimensions} onChange={e => setDimensions(e.target.value)} />
        </label>
        <label className="block">
          <span className="text-sm font-medium">Image credit / Photographer (optional)</span>
          <input className="mt-1 w-full rounded border px-3 py-2" placeholder="e.g., Photo: Jane Doe"
            value={imageCredit} onChange={e => setImageCredit(e.target.value)} />
          <p className="text-[11px] opacity-60 mt-1">Leer lassen ⇒ „Image credit by the artist“.</p>
        </label>
      </div>

      {/* FOOTER */}
      <div className="flex items-center gap-4 pt-2">
        <label className="inline-flex items-center gap-2">
          <input type="checkbox" checked={active} onChange={e => setActive(e.target.checked)} />
          <span className="text-sm">Publicly visible (is_active)</span>
        </label>
        <button className="ml-auto rounded-2xl border px-4 py-2 text-sm font-medium hover:shadow disabled:opacity-50"
          disabled={busy} onClick={handleSubmit}>
          {busy ? 'Uploading…' : 'Create work'}
        </button>
      </div>
    </div>
  );
}
