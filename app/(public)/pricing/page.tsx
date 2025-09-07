// app/(public)/pricing/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { PLANS_BY_ROLE, type Role } from "@/lib/plans";

export const metadata: Metadata = {
  title: "Pricing & Plans – Artist Hub",
};

type SP = { role?: string };

export default async function PricingPage({
  searchParams,
}: {
  searchParams: Promise<SP>;
}) {
  const sp = await searchParams;
  const role = (sp.role as Role) || "artist";
  const plans = PLANS_BY_ROLE[role];

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-semibold mb-6">Pricing & Plans</h1>

      <div className="flex gap-2 mb-8">
        {(["artist", "curator", "gallery", "collector"] as Role[]).map((r) => (
          <Link
            key={r}
            href={`/pricing?role=${r}`}
            className={`rounded-full border px-3 py-1 text-sm ${
              r === role ? "bg-gray-200" : ""
            }`}
            prefetch={false}
          >
            {r === "gallery" ? "Gallery / Institution" : r[0].toUpperCase() + r.slice(1)}
          </Link>
        ))}
      </div>

      <section>
        <h2 className="text-xl font-medium mb-4">
          {role[0].toUpperCase() + role.slice(1)}
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((p) => (
            <div key={p.id} className="rounded-2xl border p-5">
              <div className="text-lg font-medium mb-2">{p.title}</div>
              <div className="mb-3 text-sm opacity-70">{p.price}</div>
              <ul className="list-disc pl-5 mb-4 text-sm">
                {p.features.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
              <Link
                href={`/claim/DEMO123?role=${role}&plan=${p.id}`}
                className="rounded-md border px-3 py-2 text-sm"
                prefetch={false}
              >
                {p.price.startsWith("€0") ? "Choose Free" : "Choose plan"}
              </Link>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
