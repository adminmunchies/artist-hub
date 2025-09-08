'use client';

import { useMemo, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';

type Props = { className?: string };

export default function LoginInline({ className = '' }: Props) {
  // Create a browser Supabase client (keeps session in cookies → compatible with getSupabaseServer)
  const supabase = useMemo(
    () =>
      createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      ),
    []
  );

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    setErr(null);

    try {
      if (mode === 'signin') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        setMsg('Signed in. Redirecting…');
        // Refresh server session
        window.location.assign('/dashboard');
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setMsg('Account created. Please check your email to confirm.');
      }
    } catch (e: any) {
      setErr(e?.message || String(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={`rounded-2xl border p-4 shadow-sm w-[min(100%,22rem)] bg-white ${className}`}>
      <form onSubmit={submit} className="space-y-3">
        <div className="text-base font-semibold">
          {mode === 'signin' ? 'Sign in' : 'Create account'}
        </div>

        <label className="block">
          <span className="sr-only">Email</span>
          <input
            type="email"
            required
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border px-3 py-2 text-sm bg-yellow-100/60"
            autoComplete="email"
          />
        </label>

        <label className="block">
          <span className="sr-only">Password</span>
          <input
            type="password"
            required
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border px-3 py-2 text-sm bg-yellow-100/60"
            autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
            minLength={6}
          />
        </label>

        {err ? <p className="text-xs text-red-600">{err}</p> : null}
        {msg ? <p className="text-xs text-green-600">{msg}</p> : null}

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={busy}
            className="rounded-full border px-4 py-1.5 text-sm disabled:opacity-60"
          >
            {busy ? 'Working…' : mode === 'signin' ? 'Sign in' : 'Sign up'}
          </button>

          <button
            type="button"
            onClick={() => setMode((m) => (m === 'signin' ? 'signup' : 'signin'))}
            className="text-xs underline decoration-dotted"
          >
            {mode === 'signin' ? 'Create account' : 'I already have an account'}
          </button>
        </div>
      </form>
    </div>
  );
}
