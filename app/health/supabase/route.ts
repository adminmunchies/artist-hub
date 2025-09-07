// app/health/supabase/route.ts
export const dynamic = "force-dynamic";
import supabaseAdmin from "@/lib/supabaseAdmin";

export async function GET() {
  try {
    const { error } = await supabaseAdmin.from("admin_links").select("id").limit(1);
    if (error) {
      return Response.json({ ok: false, where: "query", error: error.message }, { status: 500 });
    }
    return Response.json({ ok: true });
  } catch (e: any) {
    return Response.json({ ok: false, where: "exception", error: String(e?.message || e) }, { status: 500 });
  }
}
