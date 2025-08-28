'use client';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

type Work = { id: string; title: string | null; year: number | null; medium: string | null; dimensions: string | null; image_url: string; is_active: boolean | null; };

export default function WorksList() {
  const [works, setWorks] = useState<Work[]>([]);
  const [artistName, setArtistName] = useState<string>('Artworks');
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => { (async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setErr('Nicht eingeloggt'); setLoading(false); return; }
    const { data: artist } = await supabase.from('artists').select('id,name').eq('user_id', user.id).maybeSingle();
    if (!artist) { setErr('Kein Artist-Profil'); setLoading(false); return; }
    if (artist.name) setArtistName(`Artworks — ${artist.name}`);
    const { data } = await supabase
      .from('works')
      .select('id,title,year,medium,dimensions,image_url,is_active')
      .eq('artist_id', artist.id)
      .order('year', { ascending: false });
    setWorks((data || []) as Work[]);
    setLoading(false);
  })(); }, []);

  async function onToggle(id: string, val: boolean) {
    await supabase.from('works').update({ is_active: val }).eq('id', id);
    setWorks(ws => ws.map(w => w.id === id ? { ...w, is_active: val } : w));
  }

  function storagePath(url: string) {
    const m = '/storage/v1/object/public/works/';
    const i = url.indexOf(m);
    return i === -1 ? null : url.substring(i + m.length);
  }

  async function onDelete(id: string, url: string) {
    if (!confirm('Diese Arbeit löschen?')) return;
    const p = storagePath(url);
    if (p) await supabase.storage.from('works').remove([p]);
    await supabase.from('works').delete().eq('id', id);
    setWorks(ws => ws.filter(w => w.id !== id));
  }

  if (loading) return <div className="p-6">Lade…</div>;
  if (err) return <div className="p-6 text-red-600">{err}</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">{artistName}</h1>
        <div className="flex gap-2">
          <a href="/dashboard/works/new" className="rounded-2xl border px-3 py-2 text-sm">+ Add Work</a>
          <a href="/dashboard/profile" className="rounded-2xl border px-3 py-2 text-sm">Profile</a>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {works.map(w => (
          <div key={w.id} className="rounded-2xl border p-3 space-y-2">
            <img src={`${w.image_url}?width=800&quality=75&resize=cover`} alt={w.title ?? ''} className="w-full aspect-[4/3] object-cover rounded-lg" />
            <div className="text-sm font-medium underline">
              <a href={`/w/${w.id}`}>{w.title ?? 'Untitled'} {w.year ? `(${w.year})` : ''}</a>
            </div>
            <div className="text-[11px] opacity-60">{[w.medium, w.dimensions].filter(Boolean).join(' · ')}</div>
            <div className="flex items-center justify-between pt-1">
              <label className="text-xs inline-flex items-center gap-2">
                Sichtbar
                <input type="checkbox" checked={!!w.is_active} onChange={e => onToggle(w.id, e.target.checked)} />
              </label>
              <div className="flex gap-2">
                <a href={`/dashboard/works/${w.id}`} className="text-xs rounded-lg border px-2 py-1">Edit</a>
                <button onClick={() => onDelete(w.id, w.image_url)} className="text-xs rounded-lg border px-2 py-1 hover:bg-red-50">Löschen</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
