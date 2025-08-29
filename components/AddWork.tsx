'use client';
import { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

export default function AddWork() {
  const [title, setTitle] = useState('');
  const [year, setYear] = useState('');
  const [medium, setMedium] = useState('');
  const [dimensions, setDimensions] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function compressToWebP(input: File, maxSize = 2000): Promise<File> {
    const bitmap = await createImageBitmap(input);
    const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height));
    const w = Math.round(bitmap.width * scale);
    const h = Math.round(bitmap.height * scale);
    const canvas = document.createElement('canvas');
    canvas.width = w; canvas.height = h;
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(bitmap, 0, 0, w, h);
    const blob: Blob = await new Promise(res => canvas.toBlob(b => res(b!), 'image/webp', 0.9));
    return new File([blob], input.name.replace(/\.\w+$/, '') + '.webp', { type: 'image/webp' });
  }

  async function onSave() {
    setMsg(null);
    if (!file) { setMsg('Bitte Datei wählen.'); return; }
    setBusy(true);
    try {
      const { data: auth } = await supabase.auth.getUser();
      const uid = auth.user?.id;
      if (!uid) throw new Error('Nicht eingeloggt.');

      const { data: artist, error: aErr } = await supabase
        .from('artists').select('id').eq('user_id', uid).maybeSingle();
      if (aErr) throw aErr;
      if (!artist) throw new Error('Artist-Datensatz nicht gefunden.');

      const webp = await compressToWebP(file);
      const path = `${uid}/${Date.now()}.webp`;

      const up = await supabase.storage.from('works')
        .upload(path, webp, { cacheControl: '3600', upsert: false, contentType: webp.type });
      if (up.error) throw up.error;

      const { data: pub } = supabase.storage.from('works').getPublicUrl(path);
      const image_url = pub.publicUrl;

      const { error: insErr } = await supabase.from('works').insert({
        artist_id: artist.id,
        title: title || null,
        year: year ? Number(year) : null,
        medium: medium || null,
        dimensions: dimensions || null,
        image_url,
        is_active: true
      });
      if (insErr) throw insErr;

      setMsg('Work gespeichert ✅');
      setTitle(''); setYear(''); setMedium(''); setDimensions('');
      setFile(null); (document.getElementById('work-file') as HTMLInputElement).value = '';
    } catch (e:any) {
      setMsg('Fehler: ' + e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="space-y-3">
      <h2 className="text-xl font-semibold">Work hinzufügen</h2>
      <input className="w-full border p-2" placeholder="Titel" value={title} onChange={e=>setTitle(e.target.value)} />
      <input className="w-full border p-2" placeholder="Jahr (z.B. 2025)" value={year} onChange={e=>setYear(e.target.value)} />
      <input className="w-full border p-2" placeholder="Medium" value={medium} onChange={e=>setMedium(e.target.value)} />
      <input className="w-full border p-2" placeholder="Maße" value={dimensions} onChange={e=>setDimensions(e.target.value)} />
      <input id="work-file" type="file" accept="image/*" onChange={e=>setFile(e.target.files?.[0] ?? null)} />
      <button className="px-4 py-2 bg-black text-white rounded" disabled={busy} onClick={onSave}>
        {busy ? 'Speichern…' : 'Work speichern'}
      </button>
      {msg && <p className="text-sm">{msg}</p>}
      <p className="text-xs text-gray-500">Tipp: Große JPG/PNG werden automatisch auf max. 2000px als WebP komprimiert.</p>
    </section>
  );
}

