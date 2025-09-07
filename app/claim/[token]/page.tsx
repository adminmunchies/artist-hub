"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams, useParams } from "next/navigation";
import type { Role } from "../../../lib/plans";
import { getPlanById } from "../../../lib/plans";

export default function ClaimPage() {
  const router = useRouter();
  const qs = useSearchParams();
  const { token } = useParams<{ token: string }>();

  const role = (qs.get("role") || "artist") as Role;
  const planId = qs.get("plan") || "artist_free";
  const email = qs.get("email") || "";
  const artistId = qs.get("artist_id") || "";

  const plan = useMemo(() => getPlanById(planId), [planId]);
  const [accepted, setAccepted] = useState(false);

  function accept() {
    try { localStorage.setItem("ah_plan", planId); } catch {}
    setAccepted(true);
    if (role === "artist" && artistId) {
      router.replace(`/onboarding/${role}`);
      return;
    }
    router.replace(`/dashboard/settings/plan?plan=${encodeURIComponent(planId)}`);
  }

  return (
    <main className="pb-24 pt-6">
      <h1 className="text-3xl font-semibold">Accept invite</h1>
      <p className="mt-2" style={{ color: "#666" }}>
        You were invited as <strong>{role}</strong>
        {plan ? ` with plan “${plan.name}”` : ""}.
      </p>
      {email && <p className="mt-1" style={{ color: "#666" }}>Prefilled email: {email}</p>}
      {artistId && <p className="mt-1" style={{ color: "#666" }}>Claiming artist profile: {artistId}</p>}

      <div className="card" style={{ marginTop: 16 }}>
        <p className="mt-1 text-sm" style={{ color: "#666" }}>
          Token: <code>{(token ?? "").toString().slice(0, 6)}…</code> (MVP demo)
        </p>

        {plan && (
          <>
            <h2 className="text-lg font-medium" style={{ marginTop: 12 }}>{plan.name}</h2>
            <ul className="mt-2 list-disc pl-5 text-sm">
              {plan.features.slice(0, 4).map((f, i) => <li key={i}>{f}</li>)}
            </ul>
          </>
        )}

        <div className="mt-6" style={{ display: "flex", gap: 10 }}>
          <a href="/login" className="btn" style={{ borderColor: "#bbb" }}>Sign in</a>
          <button className="btn" onClick={accept} disabled={accepted}>Accept & continue</button>
          <a href="/" className="btn" style={{ borderColor: "#bbb" }}>Decline</a>
        </div>
      </div>
    </main>
  );
}
