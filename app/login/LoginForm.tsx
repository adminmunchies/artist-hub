// app/login/LoginForm.tsx
"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function LoginForm({ next }: { next: string }) {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${location.origin}${next}` },
    });
    if (error) setError(error.message);
    else setSent(true);
  }

  if (sent) {
    return (
      <div className="rounded-xl border p-4 text-sm">
        Check your inbox — we sent you a magic link.
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="your@email.com"
        className="w-full rounded-md border px-3 py-2"
      />
      <button className="rounded-md border px-4 py-2 text-sm">Send link</button>
      {error ? <div className="text-red-600 text-sm">{error}</div> : null}
    </form>
  );
}
