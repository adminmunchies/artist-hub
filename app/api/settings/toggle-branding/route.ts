import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabaseServer";

export async function POST(req: Request) {
  const form = await req.formData();
  const hide = form.get("hide_branding") === "on";

  const supa = await getSupabaseServer();
  const { data: { user } = {} } = await supa.auth.getUser();
  if (!user) return NextResponse.json({ ok:false }, { status:401 });

  const { error } = await supa.from("profiles")
    .update({ hide_branding: hide })
    .eq("id", user.id);

  return NextResponse.json({ ok: !error, error: error?.message ?? null });
}
