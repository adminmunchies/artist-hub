// app/join/page.tsx
import Link from "next/link";
import { PLANS_BY_ROLE, type Role } from "@/lib/plans";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const ROLES: Role[] = ["artist", "curator", "gallery", "collector"];

function sanitizeRole(input?: string): Role {
  const key = (input ?? "artist").toLowerCase();
  return (ROLES as readonly string[]).includes(key) ? (key as Role) : "artist";
}

export default async function JoinPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string }>;
}) {
  const sp = await searchParams;
  const role = sanitizeRole(sp?.role);
  const freePlan = (PLANS_BY_ROLE[role] ?? []).find((p) =>
    p.id.endsWith("_free")
  );

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-3xl font-semibold mb-6">Join</h1>

      <div className="flex gap-3 mb-8">
        {ROLES.map((r) => (
          <Link
            key={r}
            href={`/join?role=${r}`}
            prefetch={false}
            className={`rounded-full px-3 py-1 border ${
              r === role ? "bg-black text-white" : "bg-white text-black"
            }`}
          >
            {r === "gallery" ? "Gallery / Institution" : r[0].toUpperCase() + r.slice(1)}
          </Link>
        ))}
      </div>

      <h2 className="text-xl font-semibold mb-3">
        {role[0].toUpperCase() + role.slice(1)}
      </h2>

      <ul className="list-disc ml-5 mb-6">
        {(PLANS_BY_ROLE[role]?.[0]?.bullets ?? [
          "Simple public profile",
          role === "artist" ? "Publish works & news" : "Follow artists & news",
          "Get discovered",
        ])
          .slice(0, 4)
          .map((b, i) => (
            <li key={i}>{b}</li>
          ))}
      </ul>

      <div className="flex gap-6">
        {freePlan ? (
          <Link
            href={`/claim/DEMO123?role=${role}&plan=${freePlan.id}`}
            prefetch={false}
            className="underline"
          >
            Continue — Free
          </Link>
        ) : null}

        <Link
          href={`/pricing?role=${role}`}
          prefetch={false}
          className="underline"
        >
          See pricing
        </Link>
      </div>
    </main>
  );
}
