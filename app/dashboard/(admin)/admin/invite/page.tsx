// app/dashboard/admin/invite/page.tsx
"use client";

import { useMemo, useState } from "react";
import type { Role } from "../../../../lib/plans";
import { getPlansByRole } from "../../../../lib/plans";

const ROLES: Role[] = ["artist", "curator", "gallery", "collector"];

export default function AdminInvitePage() {
  const [role, setRole] = useState<Role>("artist");
  const [planId, setPlanId] = useState<string>("artist_free");
  const [email, setEmail] = useState("");
  const [artistId, setArtistId] = useState(""); // optional: für "claim profile"
  const [link, setLink] = useState<string | null>(null);

  const plans = useMemo(() => getPlansByRole(role), [role]);

  function makeToken() {
    return Math.random().toString(36).slice(2) + Date.now().toString(36);
  }

  function buildLink() {
    const token = makeToken();
    const base =
      typeof window !== "undefined"
        ? window.location.origin
        : "http://localhost:3031";

    const url = new URL(`${base}/claim/${token}`);
    url.searchParams.set("role", role);
    url.searchParams.set("plan", planId);
    if (email) url.searchParams.set("email", email);
    if (artistId) url.searchParams.set("artist_id", artistId);

    setLink(url.toString());
  }

  return (
    <main className="pb-24 pt-6">
      <h1 className="text-2xl font-semibold">Admin · Invite / Claim (MVP)</h1>
      <p className="mt-2" style={{ color: "#666" }}>
        Create a magic link to invite users or let an artist claim a profile.
      </p>

      <div className="card" style={{ marginTop: 16 }}>
        <div style={{ display: "grid", gap: 12, gridTemplateColumns: "1fr 1fr" }}>
          <label>
            <div className="text-sm" style={{ color: "#666" }}>Role</div>
            <select
              className="btn"
              value={role}
              onChange={(e) => {
                const r = e.target.value as Role;
                setRole(r);
                const first = getPlansByRole(r)[0];
                setPlanId(first.id);
              }}
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {r === "gallery" ? "gallery / institution" : r}
                </option>
              ))}
            </select>
          </label>

          <label>
            <div className="text-sm" style={{ color: "#666" }}>Plan</div>
            <select className="btn" value={planId} onChange={(e) => setPlanId(e.target.value)}>
              {plans.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.isFree ? "€0" : `€${p.priceMonthlyEUR}/mo`})
                </option>
              ))}
            </select>
          </label>

          <label>
            <div className="text-sm" style={{ color: "#666" }}>
              Email (optional, prefill)
            </div>
            <input
              className="btn"
              style={{ width: "100%" }}
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>

          <label>
            <div className="text-sm" style={{ color: "#666" }}>
              Artist ID (optional, claim profile)
            </div>
            <input
              className="btn"
              style={{ width: "100%" }}
              placeholder="uuid… (optional)"
              value={artistId}
              onChange={(e) => setArtistId(e.target.value)}
            />
          </label>
        </div>

        <div className="mt-6" style={{ display: "flex", gap: 10 }}>
          <button className="btn" onClick={buildLink}>Generate link</button>
          <a className="btn" href="/pricing" style={{ borderColor: "#bbb" }}>
            See pricing
          </a>
        </div>

        {link && (
          <div className="mt-6 card">
            <div className="text-sm" style={{ color: "#666" }}>Magic link</div>
            <p style={{ wordBreak: "break-all", marginTop: 6 }}>
              <a href={link}>{link}</a>
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
