'use client';

import { useState, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function AvatarUpload({
  value,
  onUploaded,
}: {
  value?: string;
  onUploaded: (url: string) => void;
}) {
  const [preview, setPreview] = useState<string | undefined>(value);
  const [pending, setPending] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  function pick() {
    inputRef.current?.click();
  }

  async function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.type)) {
      alert('Bitte JPG, PNG oder WebP wählen.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      alert('Maximal 10 MB.');
      return;
    }

    setPending(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert('Bitte einloggen.');
        return;
      }

      const ext = file.name.split('.').pop() || 'jpg';
      const path = `${user.id}/${Date.now()}.${ext}`;

      const { error: upErr } = await supabase.storage
        .from('profile-images')
        .upload(path, file, { upsert: false });

      if (upErr) {
        alert('Upload fehlgeschlagen: ' + upErr.message);
        return;
      }

      const { data } = supabase.storage.from('profile-images').getPublicUrl(path);
      const url = data.publicUrl;

      setPreview(url);
      onUploaded(url);
    } finally {
      setPending(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  return (
    <div className="grid gap-2">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={pick}
          disabled={pending}
          className="rounded-xl px-3 py-2 border shadow-sm"
        >
          {pending ? 'Uploading…' : 'Upload Profile Image'}
        </button>
        {preview ? (
          <span className="text-sm opacity-70 truncate max-w-[360px]">{preview}</span>
        ) : null}
      </div>

      {preview ? (
        <img
          src={preview}
          alt="Profile preview"
          className="mt-2 h-32 w-32 rounded-full object-cover border"
        />
      ) : (
        <div className="mt-2 h-32 w-32 rounded-full border flex items-center justify-center text-sm opacity-60">
          no image
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        style={{ display: 'none' }}
        onChange={onChange}
      />
    </div>
  );
}
