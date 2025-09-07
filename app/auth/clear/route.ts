// app/auth/clear/route.ts
// Dev helper: clear Supabase auth cookies (legacy + current) to stop refresh_token errors.
export const dynamic = "force-dynamic";

import { cookies } from "next/headers";

function cookieNames() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const m = url.match(/^https?:\/\/([a-z0-9-]+)\.supabase\.co/i);
  const ref = m?.[1] ?? "";
  const names: string[] = [];
  if (ref) names.push(`sb-${ref}-auth-token`);         // current project cookie
  names.push("sb-dein-projekt-auth-token");            // legacy placeholder cookie
  return names;
}

async function clearAll() {
  const jar = await cookies();
  const names = cookieNames();
  for (const name of names) {
    try {
      jar.set(name, "", { path: "/", maxAge: 0, httpOnly: true, sameSite: "lax" });
    } catch {
      // ignore — only valid inside route handlers (which we are)
    }
  }
  return names;
}

export async function POST() {
  const cleared = await clearAll();
  return Response.json({ ok: true, cleared });
}

// Allow GET in local dev for convenience
export async function GET() {
  return POST();
}
