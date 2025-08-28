// app/api/works/[id]/image/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

type RouteParams = { params: { id: string } };

export const runtime = "nodejs"; // oder "edge", wenn du magst

// Hilfsfunktion: saubere Supabase-Server-Instanz mit Cookie-Weitergabe
function createSb(cookieStore: ReturnType<typeof cookies>) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesList) {
          try {
            cookiesList.forEach(({ name, value, options }: any) =>
              cookieStore.set({ name, value, ...options })
            );
          } catch {}
        },
      },
    }
  );
}

export async function POST(req: Request, { params }: RouteParams) {
  try {
    const workId = params.id; // <- in Route-Handlern NICHT awaiten
    if (!workId) {
      return NextResponse.json({ error: "Missing work id" }, { status: 400 });
    }

    const form = await req.formData();
    const file = form.get("file") as File | null;
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }
    if (!/^image\/(jpeg|png|webp)$/.test(file.type)) {
      return NextResponse.json({ error: "Only JPG/PNG/WEBP allowed" }, { status: 415 });
    }
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "Max 10MB" }, { status: 413 });
    }

    const cookieStore = cookies();
    const supabase = createSb(cookieStore);

    // User + Artist ermitteln (Ownership-Check)
    const { data: auth } = await supabase.auth.getUser();
    const user = auth?.user;
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: artist, error: aErr } = await supabase
      .from("artists")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (aErr) throw aErr;
    if (!artist) return NextResponse.json({ error: "Artist not found" }, { status: 404 });

    // gehört das Work wirklich dem Artist?
    const { data: work, error: wErr } = await supabase
      .from("works")
      .select("id, artist_id")
      .eq("id", workId)
      .maybeSingle();

    if (wErr) throw wErr;
    if (!work || work.artist_id !== artist.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Upload in Storage
    const bucket =
      process.env.NEXT_PUBLIC_SUPABASE_WORKS_BUCKET || "works"; // passe ggf. an
    const path = `works/${workId}/${Date.now()}-${(file.name || "upload").replace(
      /[^a-zA-Z0-9._-]/g,
      "_"
    )}`;

    const { error: upErr } = await supabase.storage
      .from(bucket)
      .upload(path, file, { contentType: file.type, upsert: true });

    if (upErr) {
      return NextResponse.json({ error: upErr.message }, { status: 500 });
    }

    // Public URL holen
    const { data: pub } = supabase.storage.from(bucket).getPublicUrl(path);
    const image_url = pub?.publicUrl;
    if (!image_url) {
      return NextResponse.json(
        { error: "Could not obtain public URL" },
        { status: 500 }
      );
    }

    // DB updaten
    const { error: updErr } = await supabase
      .from("works")
      .update({ image_url, updated_at: new Date().toISOString() })
      .eq("id", workId);

    if (updErr) {
      return NextResponse.json({ error: updErr.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, image_url }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message ?? "Server error" },
      { status: 500 }
    );
  }
}
