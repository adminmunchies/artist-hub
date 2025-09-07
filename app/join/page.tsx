// app/join/page.tsx
"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { Role } from "../../lib/plans";
import { getPlansByRole } from "../../lib/plans";

const ROLES: Role[] = ["artist", "curator", "gallery", "collector"];
const LABEL: Record<Role, string> = {
  artist: "Artist",
  curator: "Curator",
  gallery: "Gallery / Institution",
  collector: "Collector",
};
const BLURB: Record<Role, string> = {
  artist: "Create a clean profile, publish works and news, and get discovered.",
  curator: "Submit solo/group features and collaborate with artists and galleries.",
  gallery: "Show your program, announce shows, and link represented artists.",
  collector: "Save favorites, set interests, and get smart discovery tools.",
};

export default function JoinPage() {
  const params = useSearchParams();
  const router = useRouter();

  const initialRole = useMemo<Role>(() => {
    const q = (params.get("role") || "").toLowerCase();
    return ROLES.includes(q as Role) ? (q as Role) : "artist";
  }, [params]);

  const [role, setRole] = useState<Role>(initialRole);

  function selectRole(r: Role) {
    setRole(r);
    const sp = new URLSearchParams(Array.from(params.entries()));
    sp.set("role", r);
    router.replace(`/join?${sp.toString()}`);
  }

  const freePlan = getPlansByRole(role).find(p => p.isFree);

  return (
    <main className="pb-24 pt-6">
      <h1 className="text-3xl font-semibold">Join</h1>
      <p className="mt-2 text-sm" style={{ color: "#666" }}>
        Pick your role to get started. You can change or upgrade anytime.
      </p>

      <div className="tabs" role="tablist" aria-label="Choose role">
        {ROLES.map(r => (
          <button
            key={r}
            className="tab"
            role="tab"
            aria-current={role === r ? "page" : undefined}
            onClick={() => selectRole(r)}
          >
            {LABEL[r]}
          </button>
        ))}
      </div>

      <section className="mt-10">
        <div className="card">
          <h2 className="text-2xl font-semibold">{LABEL[role]}</h2>
          <p className="mt-2" style={{ color: "#666" }}>{BLURB[role]}</p>

          {freePlan && (
            <ul className="mt-4 list-disc space-y-1 pl-5 text-sm">
              {freePlan.features.slice(0, 4).map((f, i) => <li key={i}>{f}</li>)}
            </ul>
          )}

          <div className="mt-6" style={{ display: "flex", gap: 10 }}>
            <a href={`/onboarding/${role}`} className="btn">
              Continue — Free
            </a>
            <a href={`/pricing?role=${role}`} className="btn" style={{ borderColor: "#bbb" }}>
              See pricing
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
