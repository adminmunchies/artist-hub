// app/api/profile/avatar/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

const BUCKET_NAME = "avatars";
const COLUMN_AVATAR = "avatar_url";

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

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

    const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
    const safeBase = file.name.replace(/[^\w.-]+/g, "_").replace(/\.+/g, ".");
    const path = `${artist.id}/${Date.now()}-${safeBase}`;

    const { error: upErr } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(path, file, { contentType: file.type || `image/${ext}`, upsert: true });
    if (upErr) throw upErr;

    const { data: { publicUrl } } = supabase.storage.from(BUCKET_NAME).getPublicUrl(path);

    const { error: updErr } = await supabase
      .from("artists")
      .update({ [COLUMN_AVATAR]: publicUrl, updated_at: new Date().toISOString() })
      .eq("id", artist.id);
    if (updErr) throw updErr;

    // go to public profile to preview
    return NextResponse.redirect(new URL(`/a/${artist.id}`, req.url));
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: e?.message ?? "Upload failed" }, { status: 500 });
  }
}
