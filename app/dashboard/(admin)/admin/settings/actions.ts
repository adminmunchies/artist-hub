// app/dashboard/(admin)/settings/actions.ts
"use server";

import { getSupabaseServer } from "@/lib/supabaseServer";
import { isAdmin } from "@/lib/auth/isAdmin";
import { revalidatePath } from "next/cache";

const SINGLETON_ID = "singleton";

export async function saveSettings(formData: FormData) {
  const supabase = await getSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !isAdmin(user)) {
    return { error: "Not allowed" };
  }

  const payload = {
    id: SINGLETON_ID,
    website_url: (formData.get("website_url") as string) || null,
    footer_logo_url: (formData.get("footer_logo_url") as string) || null,
    footer_tagline: (formData.get("footer_tagline") as string) || null,

    instagram_url: (formData.get("instagram_url") as string) || null,
    bluesky_url: (formData.get("bluesky_url") as string) || null,
    youtube_url: (formData.get("youtube_url") as string) || null,
    tiktok_url: (formData.get("tiktok_url") as string) || null,

    privacy_url: (formData.get("privacy_url") as string) || null,
    terms_url: (formData.get("terms_url") as string) || null,

    ask_kurt_url: (formData.get("ask_kurt_url") as string) || null,
    ask_kurt_image_url: (formData.get("ask_kurt_image_url") as string) || null,

    artist_submit_url: (formData.get("artist_submit_url") as string) || null,
    artist_submit_image_url: (formData.get("artist_submit_image_url") as string) || null,
  };

  const { error } = await supabase
    .from("site_settings")
    .upsert(payload, { onConflict: "id" });

  if (error) return { error: error.message };

  // Footer hängt im Layout: beides neu rendern
  revalidatePath("/", "layout");
  revalidatePath("/dashboard/(admin)/settings");

  return { ok: true };
}
