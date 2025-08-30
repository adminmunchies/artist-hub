import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

function clean(v: FormDataEntryValue | null): string | null {
  const s = (v ?? "").toString().trim();
  return s.length ? s : null;
}

export async function POST(req: NextRequest) {
  const form = await req.formData();

  const payload = {
    id: 1,
    website_url: clean(form.get("website_url")),
    footer_tagline: clean(form.get("footer_tagline")),
    footer_logo_url: clean(form.get("footer_logo_url")),
    instagram_url: clean(form.get("instagram_url")),
    bluesky_url: clean(form.get("bluesky_url")),
    youtube_url: clean(form.get("youtube_url")),
    tiktok_url: clean(form.get("tiktok_url")),
    privacy_url: clean(form.get("privacy_url")),
    terms_url: clean(form.get("terms_url")),
    ask_kurt_url: clean(form.get("ask_kurt_url")),
    ask_kurt_image_url: clean(form.get("ask_kurt_image_url")),
    artist_submit_url: clean(form.get("artist_submit_url")),
    artist_submit_image_url: clean(form.get("artist_submit_image_url")),
  };

  const admin = getSupabaseAdmin();
  const { error } = await admin
    .from("site_settings")
    .upsert(payload, { onConflict: "id" });

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
  }

  const url = new URL("/", req.url);
  return NextResponse.redirect(url, 303);
}
