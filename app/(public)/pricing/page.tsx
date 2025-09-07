// app/(public)/pricing/page.tsx
import Link from "next/link";
import { PLANS_BY_ROLE, type Role } from "@/lib/plans";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const ROLES: Role[] = ["artist", "curator", "gallery", "collector"];

function sanitizeRole(input?: string): Role {
  const key = (input ?? "artist").toLowerCase();
  return (ROLES as readonly string[]).includes(key) ? (key as Role) : "artist";
}

export default async function PricingPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string }>;
}) {
  const sp = await searchParams;
  const role = sanitizeRole(sp?.role);
  const plans = PLANS_BY_ROLE[role] ?? PLANS_BY_ROLE.artist; // Fallback garantiert Array

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-3xl font-semibold mb-2">Pricing &amp; Plans</h1>
      <p className="text-gray-500 mb-6">
        Change or cancel anytime. Prices include VAT where applicable.
      </p>

      <div className="flex gap-3 mb-8">
        {ROLES.map((r) => (
          <Link
            key={r}
            href={`/pricing?role=${r}`}
            prefetch={false}
            className={`rounded-full px-3 py-1 border ${
              r === role ? "bg-black text-white" : "bg-white text-black"
            }`}
          >
            {r === "gallery" ? "Gallery / Institution" : r[0].toUpperCase() + r.slice(1)}
          </Link>
        ))}
      </div>

      <h2 className="text-xl font-semibold mb-4">
        {role[0].toUpperCase() + role.slice(1)}
      </h2>

      <div className="grid gap-6 md:grid-cols-3">
        {(plans ?? []).map((plan) => (
          <div key={plan.id} className="rounded-2xl border p-5">
            <div className="flex items-center justify-between mb-2">
              <div className="font-semibold">{plan.name}</div>
              <div className="text-sm text-gray-600">€{plan.monthly}/mo</div>
            </div>

            <ul className="list-disc ml-5 mb-5">
              {plan.bullets.map((b, i) => (
                <li key={i}>{b}</li>
              ))}
            </ul>

            <Link
              href={
                plan.id.endsWith("_free")
                  ? `/claim/DEMO123?role=${role}&plan=${plan.id}`
                  : `/login?next=/dashboard`
              }
              prefetch={false}
              className="inline-block rounded-md border px-3 py-1"
            >
              {plan.id.endsWith("_free") ? "Choose Free" : "Choose plan"}
            </Link>
          </div>
        ))}
      </div>
    </main>
  );
}
