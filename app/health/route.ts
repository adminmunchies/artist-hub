// app/health/route.ts
export const dynamic = "force-dynamic";

import supabaseAdmin from "@/lib/supabaseAdmin";

export async function GET() {
  const env = {
    NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    NEXT_PUBLIC_SITE_URL: !!process.env.NEXT_PUBLIC_SITE_URL,
  };

  const db = { ok: false as boolean, error: null as string | null };
  try {
    const { error } = await supabaseAdmin.from("admin_links").select("id").limit(1);
    if (error) db.error = error.message;
    else db.ok = true;
  } catch (e: any) {
    db.error = String(e?.message || e);
  }

  const anon = { ok: false as boolean, error: null as string | null, status: null as number | null };
  try {
    const base = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const url = `${base}/rest/v1/admin_links?select=id&published=eq.true&featured=eq.true&limit=1`;
    const r = await fetch(url, { headers: { apikey: anonKey, Authorization: `Bearer ${anonKey}` }, cache: "no-store" });
    anon.status = r.status;
    anon.ok = r.ok;
    if (!r.ok) anon.error = `status ${r.status}`;
  } catch (e: any) {
    anon.error = String(e?.message || e);
  }

  const ok = env.NEXT_PUBLIC_SUPABASE_URL && env.NEXT_PUBLIC_SUPABASE_ANON_KEY && db.ok;

  return Response.json({ ok, env, db, anon, now: new Date().toISOString(), uptime_s: Math.floor(process.uptime()) });
}
