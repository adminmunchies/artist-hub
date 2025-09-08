import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabaseServer";

export async function GET() {
  try {
    const supa = await getSupabaseServer();

    // Aktuellen User holen (still → kein Overlay, wenn nicht eingeloggt)
    const { data: u } = await supa.auth.getUser();
    const uid = u?.user?.id;
    if (!uid) {
      return NextResponse.json({ plan: "free" });
    }

    // Plan aus profiles lesen
    const { data, error } = await supa
      .from("profiles")
      .select("plan, network_opt_in, hide_branding")
      .eq("id", uid)
      .single();

    if (error) {
      // Falls Tabelle/Row noch nicht existiert, serverseitig Free zurückgeben
      return NextResponse.json({ plan: "free" });
    }

    return NextResponse.json({
      plan: data?.plan ?? "free",
      network_opt_in: !!data?.network_opt_in,
      hide_branding: !!data?.hide_branding,
    });
  } catch {
    return NextResponse.json({ plan: "free" });
  }
}

