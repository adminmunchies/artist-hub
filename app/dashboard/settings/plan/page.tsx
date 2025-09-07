"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { getPlanById } from "../../../../lib/plans"; // <— relativ, NICHT "@/..."

export default function SettingsPlanPage() {
  const params = useSearchParams();
  const [planId, setPlanId] = useState<string | null>(null);

  const planFromUrl = useMemo(() => params.get("plan"), [params]);

  useEffect(() => {
    if (planFromUrl) {
      setPlanId(planFromUrl);
      try { localStorage.setItem("ah_plan", planFromUrl); } catch {}
      return;
    }
    try {
      const stored = localStorage.getItem("ah_plan");
      if (stored) setPlanId(stored);
    } catch {}
  }, [planFromUrl]);

  const plan = planId ? getPlanById(planId) : undefined;

  return (
    <main className="mx-auto w-full max-w-3xl">
      <h1 className="text-2xl font-semibold">Plan & billing</h1>
      <p className="mt-2 text-sm" style={{ color: "#666" }}>
        Manage your subscription, payment method, and invoices.
      </p>

      <div className="mt-6 card">
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <div>
            <div className="text-sm" style={{ color: "#666" }}>Current plan</div>
            <div className="text-base font-medium">
              {plan ? `${plan.name} (${plan.role})` : "Not detected (MVP mock)"}
            </div>
            {plan && (
              <ul className="mt-2 list-disc pl-5 text-sm">
                {plan.features.slice(0, 4).map((f, i) => <li key={i}>{f}</li>)}
              </ul>
            )}
          </div>
          <a href="/pricing" className="btn">Change plan</a>
        </div>

        <div className="mt-4" style={{ display: "flex", gap: 10 }}>
          <button
            className="btn"
            onClick={() => { try { localStorage.removeItem("ah_plan"); } catch {}; setPlanId(null); }}
          >
            Reset mock
          </button>
        </div>
      </div>

      <div className="mt-6 card">
        <div className="text-sm font-medium">Invoices</div>
        <p className="mt-2 text-sm" style={{ color: "#666" }}>
          Billing and invoices will appear here once enabled.
        </p>
      </div>
    </main>
  );
}
