// app/dashboard/(user)/news/actions.ts
"use server";

import { getSupabaseServer } from "@/lib/supabaseServer";
import { scrapeOG } from "@/lib/og";

function parseTags(input: string): string[] {
  const seen = new Set<string>();
  for (const raw of (input || "").split(",").map(s => s.trim())) {
    if (!raw) continue;
    const k = raw.toLowerCase();
    if (!seen.has(k)) seen.add(k);
  }
  return Array.from(seen).slice(0, 8);
}

export async function addArtistNewsAction(formData: FormData) {
  const url = String(formData.get("url") || "").trim();
  const tagsRaw = String(formData.get("tags") || "");
  if (!/^https?:\/\//i.test(url)) {
    return { ok: false, error: "Invalid URL" };
  }

  const supabase = await getSupabaseServer();
  const { data: me } = await supabase.auth.getUser();
  const uid = me?.user?.id;
  if (!uid) return { ok: false, error: "Not signed in" };

  // Artist der Session bestimmen
  const { data: artist } = await supabase
    .from("artists")
    .select("id")
    .eq("user_id", uid)
    .limit(1)
    .single();

  if (!artist?.id) return { ok: false, error: "No artist mapped to this user" };

  // 1) Insert der News (RLS: artist_id gehört zum aktuellen User)
  const { data: inserted, error: insErr } = await supabase
    .from("artist_news")
    .insert({
      artist_id: artist.id,
      url,
      tags: parseTags(tagsRaw),
      published: true,
    })
    .select("id")
    .single();

  if (insErr) return { ok: false, error: insErr.message };

  // 2) OG-Daten holen und zurückschreiben (RLS: UPDATE ist erlaubt)
  const og = await scrapeOG(url);
  if (og.image || og.title) {
    await supabase
      .from("artist_news")
      .update({
        image_url: og.image ?? null,
        title: og.title ?? null,
      })
      .eq("id", inserted.id)
      .limit(1);
  }

  return { ok: true, id: inserted.id };
}

export async function deleteArtistNewsAction(id: string) {
  const supabase = await getSupabaseServer();
  const { error } = await supabase.from("artist_news").delete().eq("id", id);
  return { ok: !error, error: error?.message ?? null };
}
