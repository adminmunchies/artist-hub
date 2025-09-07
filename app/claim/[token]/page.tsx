// app/claim/[token]/page.tsx
import Link from "next/link";
import { getPlanById, type Role } from "@/lib/plans";

type P = { token: string };
type SP = { role?: string; plan?: string };

export default async function ClaimPage({
  params,
  searchParams,
}: {
  params: Promise<P>;
  searchParams: Promise<SP>;
}) {
  const { token } = await params;
  const sp = await searchParams;

  const role = (sp.role as Role) || "artist";
  const planId = sp.plan || `${role}_basic`;
  const plan = getPlanById(role, planId);

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-semibold mb-4">Accept invite</h1>
      <p className="mb-6">
        You were invited as <strong>{role}</strong> with plan{" "}
        <strong>{plan?.title ?? "—"}</strong>.
      </p>
      <p className="text-xs text-gray-500 mb-8">Token: {token.slice(0, 5)}… (MVP demo)</p>

      {plan ? (
        <>
          <h2 className="text-xl font-medium mb-2">{plan.title}</h2>
          <ul className="list-disc pl-6 mb-6">
            {plan.features.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
        </>
      ) : null}

      <div className="flex gap-4">
        <Link href={`/login?next=/dashboard`} className="rounded-md border px-4 py-2 text-sm">
          Sign in
        </Link>
        <Link
          href={`/dashboard/settings/plan?plan=${encodeURIComponent(planId)}`}
          className="rounded-md border px-4 py-2 text-sm"
        >
          Accept & continue
        </Link>
        <Link href="/" className="text-sm underline">Decline</Link>
      </div>
    </main>
  );
}
