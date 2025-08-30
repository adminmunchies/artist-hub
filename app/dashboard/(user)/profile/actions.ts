"use server";

import { redirect } from "next/navigation";
import { getSupabaseServer } from "@/lib/supabaseServer";

// Per ENV überschreibbar; sonst der vorhandene Bucket "profile-images"
const PROFILE_BUCKET =
  (process.env.NEXT_PUBLIC_PROFILE_BUCKET || "profile-images").trim();

async function getMyArtistId() {
  const supabase = await getSupabaseServer();
  const { data: au } = await supabase.auth.getUser();
  const uid = au?.user?.id;
  if (!uid) return null;

  const { data: a } = await supabase
    .from("artists")
    .select("id")
    .eq("user_id", uid)       // ← so heißt die FK bei dir
    .maybeSingle();

  return a?.id ?? null;
}

/**
 * Profiltext speichern – EIN Argument (formData)!
 */
export async function saveProfile(formData: FormData) {
  const supabase = await getSupabaseServer();
  const artistId = await getMyArtistId();
  if (!artistId) redirect("/");

  const name           = String(formData.get("name") ?? "");
  const city           = String(formData.get("city") ?? "");
  const bio            = String(formData.get("bio") ?? "");
  const instagram_url  = String(formData.get("instagram_url") ?? "");
  const website_url    = String(formData.get("website_url") ?? "");
  const disciplinesCsv = String(formData.get("disciplines") ?? "");

  const disciplines = disciplinesCsv
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  await supabase
    .from("artists")
    .update({
      name,
      city,
      bio,
      instagram_url,
      website_url,
      disciplines,
    })
    .eq("id", artistId);

  redirect(`/a/${artistId}`);
}

/**
 * Avatar hochladen – EIN Argument (formData)!
 */
export async function updateAvatar(formData: FormData) {
  const supabase = await getSupabaseServer();
  const artistId = await getMyArtistId();
  if (!artistId) redirect("/");

  // name="avatar" im <input>
  const file = formData.get("avatar") as File | null;
  if (!file || file.size === 0) {
    return { ok: false, message: "No file" };
  }

  const ts = Date.now();
  const safeName = file.name.replace(/[^a-z0-9.\-_]/gi, "_");
  const path = `artists/${artistId}/${ts}-${safeName}`;

  // supabase-js v2 akzeptiert Blob/File direkt
  const { error: upErr } = await supabase.storage
    .from(PROFILE_BUCKET)
    .upload(path, file, {
      upsert: true,
      contentType: file.type || "image/jpeg",
    });

  if (upErr) {
    console.error("avatar upload error:", upErr);
    return { ok: false, message: upErr.message || "Upload failed" };
  }

  const { data: pub } = supabase.storage.from(PROFILE_BUCKET).getPublicUrl(path);
  const publicUrl = pub?.publicUrl ?? null;

  await supabase
    .from("artists")
    .update({ avatar_url: publicUrl })
    .eq("id", artistId);

  redirect(`/a/${artistId}`);
}
