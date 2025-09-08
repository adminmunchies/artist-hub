import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabaseServer";

export async function POST(req: Request) {
  const form = await req.formData();
  const on = form.get("network_opt_in") === "on";

  const supa = await getSupabaseServer();
  const { data: { user } = {} } = await supa.auth.getUser();
  if (!user) return NextResponse.json({ ok:false }, { status:401 });

  const { error } = await supa.from("profiles")
    .update({ network_opt_in: on })
    .eq("id", user.id);

  return NextResponse.json({ ok: !error, error: error?.message ?? null });
}
