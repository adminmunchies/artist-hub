// app/api/works/[id]/image/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file" }, { status: 400 });
    }
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "Max 10 MB" }, { status: 400 });
    }

    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookies) {
            try {
              cookies.forEach(({ name, value, options }: any) =>
                cookieStore.set({ name, value, ...options })
              );
            } catch {}
          },
        },
      }
    );

    // Auth
    const { data: auth } = await supabase.auth.getUser();
    const user = auth?.user;
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Artist des Users
    const { data: artist } = await supabase
      .from("artists")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();
    if (!artist) return NextResponse.json({ error: "Artist not found" }, { status: 404 });

    // Work prüfen (gehört zu Artist?)
    const { data: work } = await supabase
      .from("works")
      .select("id, artist_id")
      .eq("id", params.id)
      .maybeSingle();
    if (!work || work.artist_id !== artist.id) {
      return NextResponse.json({ error: "Work not found" }, { status: 404 });
    }

    // Upload nach Storage (Bucket: "works")
    const path = `${work.id}/${Date.now()}_${file.name}`;
    const { error: upErr } = await supabase.storage
      .from("works")
      .upload(path, file, { upsert: true, contentType: file.type || "image/*" });
    if (upErr) throw upErr;

    const { data: pub } = await supabase.storage.from("works").getPublicUrl(path);
    const image_url = pub.publicUrl;

    const { error: updErr } = await supabase
      .from("works")
      .update({ image_url, updated_at: new Date().toISOString() })
      .eq("id", work.id);
    if (updErr) throw updErr;

    return NextResponse.json({ ok: true, image_url });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Upload failed" }, { status: 500 });
  }
}
