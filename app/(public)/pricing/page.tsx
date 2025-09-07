// app/(public)/pricing/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { Role } from "../../../lib/plans";
import { getPlansByRole, type Plan } from "../../../lib/plans";
import PaywallModal from "../../../components/paywall/PaywallModal";

const ROLES: Role[] = ["artist", "curator", "gallery", "collector"];
const LABEL: Record<Role, string> = {
  artist: "Artist",
  curator: "Curator",
  gallery: "Gallery / Institution",
  collector: "Collector",
};

function PlansSection({ role, onPickPaid }: { role: Role; onPickPaid: (p: Plan) => void }) {
  const plans = getPlansByRole(role);
  return (
    <section className="mt-8">
      <div className="pricing-grid">
        {plans.map((p) => (
          <div key={p.id} className="card">
            <div className="flex items-baseline justify-between" style={{ display: "flex" }}>
              <h3 className="text-lg font-medium">{p.name}</h3>
              <span className="text-sm">{p.isFree ? "€0" : `€${p.priceMonthlyEUR}`}/mo</span>
            </div>

            <ul className="mt-3 list-disc space-y-1 pl-5 text-sm">
              {p.features.map((f, i) => (
                <li key={i}>{f}</li>
              ))}
            </ul>

            <div className="mt-5" style={{ display: "flex", justifyContent: "flex-end" }}>
              {p.isFree ? (
                <a href="/dashboard/settings/plan" className="btn">Choose Free</a>
              ) : (
                <button className="btn" onClick={() => onPickPaid(p)} aria-label={`Choose ${p.name}`}>
                  Choose plan
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function PricingPage() {
  const params = useSearchParams();
  const router = useRouter();

  const initialRole = useMemo<Role>(() => {
    const q = (params.get("role") || "").toLowerCase();
    return ROLES.includes(q as Role) ? (q as Role) : "artist";
  }, [params]);

  const [role, setRole] = useState<Role>(initialRole);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Plan | null>(null);

  useEffect(() => { setRole(initialRole); }, [initialRole]);

  function selectRole(r: Role) {
    setRole(r);
    const sp = new URLSearchParams(Array.from(params.entries()));
    sp.set("role", r);
    router.replace(`/pricing?${sp.toString()}`);
  }

  function onPickPaid(p: Plan) {
    setSelected(p);
    setOpen(true);
  }

  return (
    <main className="pb-24 pt-6">
      <div>
        <h1 className="text-3xl font-semibold">Pricing & Plans</h1>
        <p className="mt-2 text-sm" style={{ color: "#666" }}>
          Change or cancel anytime. Prices include VAT where applicable.
        </p>

        {/* Role tabs */}
        <div className="tabs" role="tablist" aria-label="Choose role">
          {ROLES.map((r) => (
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
      </div>

      {/* only one section visible */}
      <h2 className="text-2xl font-semibold capitalize" style={{ marginTop: 18 }}>
        {LABEL[role]}
      </h2>
      <PlansSection role={role} onPickPaid={onPickPaid} />

      {selected && (
        <PaywallModal
          open={open}
          title={`Upgrade to ${selected.name}`}
          subhead={`You’re choosing the ${selected.role} plan.`}
          benefits={selected.features}
          priceLabel={`€${selected.priceMonthlyEUR}/mo`}
          ctaHref={`/api/checkout?plan=${encodeURIComponent(selected.id)}`}
          onClose={() => setOpen(false)}
        />
      )}
    </main>
  );
}
