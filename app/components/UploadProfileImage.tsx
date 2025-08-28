'use client';
import { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

async function compressToWebp(file: File, maxW = 2000, quality = 0.85): Promise<File> {
  const bitmap = await createImageBitmap(file);
  const ratio = Math.min(1, maxW / bitmap.width);
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * ratio);
  canvas.height = Math.round(bitmap.height * ratio);
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  const blob: Blob = await new Promise((res) => canvas.toBlob((b) => res(b!), 'image/webp', quality));
  return new File([blob], file.name.replace(/\.\w+$/, '.webp'), { type: 'image/webp' });
}

export default function UploadProfileImage() {
  const [file, setFile] = useState<File | null>(null);
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);

  async function handleUpload() {
    setMsg('');
    if (!file) { setMsg('Bitte Bild auswählen.'); return; }
    setBusy(true);

    // 1) Eingeloggt?
    const { data: u, error: uerr } = await supabase.auth.getUser();
    if (uerr || !u.user) { setMsg('Bitte zuerst einloggen.'); setBusy(false); return; }
    const uid = u.user.id;

    // 2) Große/ungeeignete Dateien automatisch kleiner machen
    let uploadFile = file;
    const isLarge = file.size > 8 * 1024 * 1024; // > 8MB
    const isRaster = /image\/(jpeg|jpg|png)/i.test(file.type);
    if (isLarge || isRaster) {
      try { uploadFile = await compressToWebp(file, 2000, 0.85); }
      catch (e:any) { setMsg('Kompression fehlgeschlagen: ' + e.message); setBusy(false); return; }
    }

    // 3) Pfad + Upload
    const ext = (uploadFile.name.split('.').pop() || 'webp').toLowerCase();
    const path = `${uid}/${Date.now()}.${ext}`;

    const { error: upErr } = await supabase
      .storage.from('profile-images')
      .upload(path, uploadFile, { cacheControl: '3600', upsert: false, contentType: uploadFile.type });
    if (upErr) { setMsg('Upload-Fehler: ' + upErr.message); setBusy(false); return; }

    // 4) Öffentliche URL
    const { data: pub } = supabase.storage.from('profile-images').getPublicUrl(path);
    const publicUrl = pub.publicUrl;

    // 5) Artist-Datensatz aktualisieren (funktioniert mit UNIQUE-Index oder mit meinem Code-Patch)
    const { error: dbErr } = await supabase
      .from('artists')
      .upsert({ user_id: uid, name: 'Untitled', profile_image_url: publicUrl }, { onConflict: 'user_id' });
    if (dbErr) { setMsg('DB-Update fehlgeschlagen: ' + dbErr.message); setBusy(false); return; }

    setMsg('Fertig ✅');
    setBusy(false);
  }

  return (
    <div className="space-y-3">
      <input type="file" accept="image/*" onChange={e => setFile(e.target.files?.[0] ?? null)} />
      <button
        onClick={handleUpload}
        disabled={!file || busy}
        className={`px-3 py-2 rounded text-white ${(!file || busy) ? 'bg-gray-400' : 'bg-black'}`}
      >
        {busy ? 'Lädt…' : 'Upload Profilbild'}
      </button>
      <p className="text-sm text-gray-600">Tipp: Große JPG/PNG werden automatisch auf max. 2000 px als WebP komprimiert.</p>
      <p>{msg}</p>
    </div>
  );
}
