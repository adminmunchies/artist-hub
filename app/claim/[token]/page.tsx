// app/claim/[token]/page.tsx
import Link from "next/link";
import { notFound } from "next/navigation";
import { PLANS_BY_ROLE, getPlanById, type Role } from "@/lib/plans";

export const dynamic = "force-dynamic";

export default async function ClaimPage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ role?: string; plan?: string }>;
}) {
  const { token } = await params;
  const sp = await searchParams;

  const role = (sp.role as Role) || "artist";
  const planId = sp.plan || "artist_basic";

  const plan = getPlanById(role, planId);
  if (!plan) return notFound();

  const features = plan.features ?? [];

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="text-3xl font-semibold mb-6">Accept invite</h1>

      <p className="mb-2">
        You were invited as <strong>{role}</strong> with plan{" "}
        <strong>{plan.name}</strong>.
      </p>
      <p className="text-sm text-gray-500 mb-6">Token: {token.slice(0, 5)}… (MVP demo)</p>

      <h2 className="text-xl font-semibold mb-2">{plan.name}</h2>
      <ul className="list-disc pl-6 space-y-1 mb-6">
        {features.map((f, i) => (
          <li key={i}>{f}</li>
        ))}
      </ul>

      <div className="flex gap-4">
        <Link href={`/login?next=/dashboard`} className="underline">
          Sign in
        </Link>
        <Link href={`/login?next=/dashboard`} className="underline">
          Accept &amp; continue
        </Link>
        <Link href={`/pricing?role=${role}`} className="underline">
          Decline
        </Link>
      </div>
    </main>
  );
}
