"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseServer } from "@/lib/supabaseServer";

function parseTags(raw: unknown): string[] {
  return String(raw ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 8); // sanftes Limit
}

async function getCurrentArtistId() {
  const supabase = await getSupabaseServer();
  const { data: auth } = await supabase.auth.getUser();
  const uid = auth?.user?.id;
  if (!uid) throw new Error("Not signed in");

  // Wir gehen davon aus: artists.user_id verweist auf auth.user.id
  const { data: artist } = await supabase
    .from("artists")
    .select("id")
    .eq("user_id", uid)
    .limit(1)
    .maybeSingle();

  if (!artist?.id) throw new Error("No artist profile linked to this account.");
  return artist.id as string;
}

export async function addNews(formData: FormData) {
  const url = String(formData.get("url") || "").trim();
  const tags = parseTags(formData.get("tags"));

  if (!url) throw new Error("URL is required.");

  const supabase = await getSupabaseServer();
  const artistId = await getCurrentArtistId();

  const { error } = await supabase.from("artist_news").insert({
    artist_id: artistId,
    url,
    tags, // <— neu
    published: true, // öffentlich
  });

  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/news");
}

export async function updateTags(formData: FormData) {
  const id = String(formData.get("id") || "");
  const tags = parseTags(formData.get("tags"));

  if (!id) throw new Error("Missing news id.");

  const supabase = await getSupabaseServer();
  const { error } = await supabase
    .from("artist_news")
    .update({ tags })
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/news");
}

export async function deleteNews(formData: FormData) {
  const id = String(formData.get("id") || "");
  if (!id) throw new Error("Missing news id.");

  const supabase = await getSupabaseServer();
  const { error } = await supabase.from("artist_news").delete().eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/news");
}

