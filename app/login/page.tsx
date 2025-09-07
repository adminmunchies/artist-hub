"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const site =
    (typeof process !== "undefined" &&
      process.env.NEXT_PUBLIC_SITE_URL) ||
    (typeof window !== "undefined" ? window.location.origin : "");

  async function sendLink(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setError(null);
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${site}/dashboard` },
    });
    setLoading(false);
    if (error) setError(error.message);
    else setSent(true);
  }

  if (sent) {
    return (
      <main className="pb-24 pt-6">
        <h1 className="text-3xl font-semibold">Check your inbox</h1>
        <p className="mt-2" style={{ color: "#666" }}>
          We’ve sent a magic sign-in link to <strong>{email}</strong>.
        </p>
        <p className="mt-4">
          <a className="btn" href="/">Back to home</a>
        </p>
      </main>
    );
  }

  return (
    <main className="pb-24 pt-6">
      <h1 className="text-3xl font-semibold">Sign in</h1>
      <form onSubmit={sendLink} className="card" style={{ marginTop: 16, maxWidth: 420 }}>
        <label className="text-sm" style={{ color: "#666" }}>Email</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="btn"
          placeholder="you@example.com"
          style={{ width: "100%", marginTop: 8 }}
        />
        {error && <p className="mt-2" style={{ color: "crimson" }}>{error}</p>}
        <div className="mt-4" style={{ display: "flex", gap: 10 }}>
          <button className="btn" type="submit" disabled={loading}>
            {loading ? "Sending…" : "Send magic link"}
          </button>
          <a className="btn" style={{ borderColor: "#bbb" }} href="/">Cancel</a>
        </div>
      </form>
    </main>
  );
}
