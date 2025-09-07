// app/login/LoginForm.tsx
"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function LoginForm({ next }: { next: string }) {
  const [email, setEmail] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: window.location.origin + (next || "/dashboard"),
      },
    });
    if (error) {
      alert(error.message);
    } else {
      alert("Check your email for a magic link!");
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <label className="block text-sm">Email</label>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full rounded-md border px-3 py-2"
        placeholder="you@example.com"
        required
      />
      <button type="submit" className="rounded-full bg-black text-white px-4 py-2">
        Send magic link
      </button>
    </form>
  );
}
