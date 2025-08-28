'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

const BIO_MAX = 800;

type Artist = {
  id: string;
  user_id: string;
  name: string | null;
  bio: string | null;
  instagram: string | null;
  website: string | null;
  location: string | null;
  disciplines: string[] | null;
  is_active: boolean;
};

export default function EditProfile() {
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [artist, setArtist] = useState<Artist | null>(null);
  const [disciplinesInput, setDisciplinesInput] = useState('');

  useEffect(() => {
    (async () => {
      setLoading(true);
      setErr(null);
      const { data: { user }, error: userErr } = await supabase.auth.getUser();
      if (userErr || !user) { setErr('Bitte einloggen.'); setLoading(false); return; }

      const { data: row, error: aErr } = await supabase
        .from('artists')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (aErr) { setErr(aErr.message); setLoading(false); return; }

      if (!row) {
        const { data: created, error: cErr } = await supabase
          .from('artists')
          .insert({ user_id: user.id, name: 'Untitled', is_active: false })
          .select('*')
          .single();
        if (cErr) { setErr(cErr.message); setLoading(false); return; }
        setArtist(created as Artist);
        setDisciplinesInput('');
      } else {
        setArtist(row as Artist);
        setDisciplinesInput(((row as Artist).disciplines ?? []).join(', '));
      }
      setLoading(false);
    })();
  }, []);

  async function save() {
    if (!artist) return;
    setMsg(null); setErr(null);

    if ((artist.bio?.length ?? 0) > BIO_MAX) {
      setErr(`Bio too long. Max ${BIO_MAX} characters.`);
      return;
    }

    const payload = {
      name: artist.name?.trim() || null,
      bio: artist.bio?.trim() || null,
      instagram: artist.instagram?.trim() || null,
      website: artist.website?.trim() || null,
      location: artist.location?.trim() || null,
      disciplines: disciplinesInput.split(',').map(s => s.trim()).filter(Boolean),
      is_active: artist.is_active,
    };

    const { error } = await supabase.from('artists').update(payload).eq('id', artist.id);
    if (error) setErr(error.message);
    else setMsg('Profile saved.');
  }

  if (loading) return <div className="p-4 text-sm">Lade Profil…</div>;
  if (err) return <div className="p-4 text-red-600">{err}</div>;
  if (!artist) return null;

  const bioLen = artist.bio?.length ?? 0;

  return (
    <div className="max-w-2xl space-y-4">
      {msg && <div className="rounded bg-green-50 text-green-800 px-3 py-2 text-sm">{msg}</div>}

      <label className="block">
        <span className="text-sm font-medium">Name</span>
        <input className="mt-1 w-full rounded border px-3 py-2"
          value={artist.name ?? ''} onChange={e => setArtist({ ...artist, name: e.target.value })}/>
      </label>

      <label className="block">
        <span className="text-sm font-medium">Bio</span>
        <textarea className="mt-1 w-full rounded border px-3 py-2" rows={6}
          maxLength={BIO_MAX}
          value={artist.bio ?? ''} onChange={e => setArtist({ ...artist, bio: e.target.value })}/>
        <div className="flex justify-between text-[11px] opacity-60 mt-1">
          <span>Tip: concise 3–6 sentences (max {BIO_MAX} chars).</span>
          <span>{bioLen}/{BIO_MAX}</span>
        </div>
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium">Instagram</span>
          <input className="mt-1 w-full rounded border px-3 py-2" placeholder="@handle or URL"
            value={artist.instagram ?? ''} onChange={e => setArtist({ ...artist, instagram: e.target.value })}/>
        </label>
        <label className="block">
          <span className="text-sm font-medium">Website</span>
          <input className="mt-1 w-full rounded border px-3 py-2" placeholder="https://…"
            value={artist.website ?? ''} onChange={e => setArtist({ ...artist, website: e.target.value })}/>
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium">Location</span>
          <input className="mt-1 w-full rounded border px-3 py-2"
            value={artist.location ?? ''} onChange={e => setArtist({ ...artist, location: e.target.value })}/>
        </label>
        <label className="block">
          <span className="text-sm font-medium">Disciplines (comma separated)</span>
          <input className="mt-1 w-full rounded border px-3 py-2" placeholder="Painting, Sculpture, …"
            value={disciplinesInput} onChange={e => setDisciplinesInput(e.target.value)}/>
        </label>
      </div>

      <label className="inline-flex items-center gap-2">
        <input type="checkbox" checked={artist.is_active}
          onChange={e => setArtist({ ...artist, is_active: e.target.checked })}/>
        <span className="text-sm">Publicly visible (is_active)</span>
      </label>

      <div>
        <button onClick={save} className="rounded-2xl border px-4 py-2 text-sm font-medium hover:shadow">
          Save profile
        </button>
      </div>

      <p className="text-xs text-gray-500">Only you can edit your profile (RLS). Public only sees it when <em>is_active</em> is enabled.</p>
    </div>
  );
}
