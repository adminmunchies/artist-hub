'use client';
import { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');

  async function signIn() {
    setMsg('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setMsg(error ? 'Login fehlgeschlagen: ' + error.message : 'Eingeloggt ✅');
  }

  return (
    <div className="space-y-2">
      <input className="border p-2 w-full" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
      <input className="border p-2 w-full" placeholder="Passwort" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
      <button onClick={signIn} className="px-3 py-2 rounded bg-black text-white">Login</button>
      <p>{msg}</p>
    </div>
  );
}
