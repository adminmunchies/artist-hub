"use server";

import { createServerSupabase } from "@/lib/supabaseServer";

type State = { ok: boolean; error?: string };

export async function saveSettings(_: State, formData: FormData): Promise<State> {
  try {
    const supabase = await createServerSupabase();
    const { data } = await supabase.auth.getUser();
    const user = data?.user ?? null;
    if (!user) return { ok: false, error: "Not authenticated" };

    const name = (formData.get("name") as string | null)?.trim() ?? "";
    const city = (formData.get("city") as string | null)?.trim() ?? "";
    const bioRaw = (formData.get("bio") as string | null) ?? "";
    const bio = bioRaw.slice(0, 800);
    const instagram_url = (formData.get("instagram_url") as string | null)?.trim() ?? "";
    const website_url = (formData.get("website_url") as string | null)?.trim() ?? "";
    const disciplinesInput = (formData.get("disciplines") as string | null) ?? "";
    const disciplines = disciplinesInput
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    let profile_image_url: string | undefined;

    const file = formData.get("profile_image") as File | null;
    if (file && file.size > 0) {
      if (file.size > 10 * 1024 * 1024) {
        return { ok: false, error: "File too large (max 10MB)" };
      }
      const mime = file.type;
      if (!["image/jpeg", "image/png", "image/webp"].includes(mime)) {
        return { ok: false, error: "Unsupported file type" };
      }

      const arrayBuffer = await file.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      const path = `${user.id}/${Date.now()}_${file.name}`;

      const up = await supabase.storage
        .from("profile-images")
        .upload(path, bytes, { contentType: mime, upsert: false });

      if (up.error) return { ok: false, error: up.error.message };

      const pub = supabase.storage.from("profile-images").getPublicUrl(path);
      profile_image_url = pub.data.publicUrl;
    }

    const updatePayload: Record<string, any> = {
      name,
      city,
      bio,
      instagram_url,
      website_url,
      disciplines,
    };
    if (profile_image_url) updatePayload.profile_image_url = profile_image_url;

    const { error: updErr } = await supabase
      .from("artists")
      .update(updatePayload)
      .eq("owner_id", user.id);

    if (updErr) return { ok: false, error: updErr.message };

    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e?.message ?? "Unknown error" };
  }
}
