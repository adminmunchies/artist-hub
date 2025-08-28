// app/api/profile/update/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { get: (n: string) => cookieStore.get(n)?.value } }
    );

    const { data: { user }, error: uErr } = await supabase.auth.getUser();
    if (uErr) throw uErr;
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: artist } = await supabase
      .from("artists")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!artist) return NextResponse.json({ error: "Artist not found" }, { status: 404 });

    const body: any = await req.json().catch(() => ({}));

    let normalizedDisciplines: string[] | undefined = undefined;
    if (typeof body.disciplines !== "undefined") {
      const csv = Array.isArray(body.disciplines) ? body.disciplines.join(",") : String(body.disciplines ?? "");
      normalizedDisciplines = csv
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
        .map((s) => s.toLowerCase())
        .filter((v, i, a) => a.indexOf(v) === i);
    }

    const updatePayload: Record<string, any> = { updated_at: new Date().toISOString() };
    if ("name" in body) updatePayload.name = String(body.name ?? "").trim() || null;
    if ("city" in body) updatePayload.city = String(body.city ?? "").trim() || null;
    if ("bio" in body) updatePayload.bio = String(body.bio ?? "");
    if ("instagram_url" in body) updatePayload.instagram_url = String(body.instagram_url ?? "").trim() || null;
    if ("website_url" in body) updatePayload.website_url = String(body.website_url ?? "").trim() || null;
    if (typeof normalizedDisciplines !== "undefined") {
      updatePayload.disciplines = normalizedDisciplines.length ? normalizedDisciplines : null;
    }

    const { error: upErr } = await supabase.from("artists").update(updatePayload).eq("id", artist.id);
    if (upErr) throw upErr;

    // return artistId for client-side redirect
    return NextResponse.json({ ok: true, artistId: artist.id });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: e?.message ?? "Server error" }, { status: 500 });
  }
}
