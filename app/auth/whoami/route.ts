// app/auth/whoami/route.ts
export const dynamic = "force-dynamic";

import { getSupabaseServer } from "@/lib/supabaseServer";

export async function GET() {
  const supa = await getSupabaseServer();
  const { data, error } = await supa.auth.getUser();
  return Response.json({
    ok: !error,
    user: data?.user ? { id: data.user.id, email: data.user.email } : null,
    error: error?.message ?? null,
  });
}
