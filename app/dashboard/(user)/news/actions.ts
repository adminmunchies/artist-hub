"use server";

import { getSupabaseServer } from "@/lib/supabaseServer";
import { revalidatePath } from "next/cache";

function toHttp(u: string) {
  if (!u) return "";
  return /^https?:\/\//i.test(u) ? u : `https://${u}`;
}
function absolutizeUrl(src: string, base: string) {
  try { return new URL(src, base).toString(); } catch { return src; }
}

// robuste Metadaten-Extraktion
async function fetchMetadata(targetUrl: string) {
  const result = { title: null as string | null, image_url: null as string | null };
  try {
    const resp = await fetch(targetUrl, {
      headers: {
        "user-agent": "Mozilla/5.0 (compatible; ArtistHubBot/1.0; +https://example.com/bot)",
        accept: "text/html,application/xhtml+xml",
      },
      redirect: "follow",
    });
    const html = await resp.text();
    const getMeta = (name: string, attr = "property") => {
      const re = new RegExp(`<meta[^>]+${attr}=["']${name}["'][^>]*content=["']([^"']+)["'][^>]*>`, "i");
      return html.match(re)?.[1] ?? null;
    };
    const getMetaName = (name: string) => getMeta(name, "name");
    const ogTitle = getMeta("og:title") || getMetaName("twitter:title");
    const titleTag = html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1];
    const ogImg = getMeta("og:image") || getMetaName("twitter:image");
    result.title = (ogTitle ?? titleTag ?? null)?.trim() || null;
    result.image_url = ogImg ? absolutizeUrl(ogImg, targetUrl) : null;
  } catch {}
  if (!result.title) {
    try { result.title = new URL(targetUrl).hostname.replace(/^www\./, ""); } catch { result.title = targetUrl; }
  }
  return result;
}

// Link hinzufügen → published: true (sofort öffentlich)
export async function addNewsAction(formData: FormData) {
  const supabase = await getSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { data: artist } = await supabase
    .from("artists")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!artist?.id) return;

  const raw = (formData.get("url") as string) || "";
  const url = toHttp(raw.trim());
  if (!url) return;

  const meta = await fetchMetadata(url);

  await supabase.from("artist_news").insert({
    artist_id: artist.id,
    url,
    title: meta.title,
    image_url: meta.image_url,
    published: true, // <<< konsistent
  });

  revalidatePath("/dashboard/news");
  revalidatePath("/");
  revalidatePath(`/a/${artist.id}`);
}

// Link löschen
export async function deleteNewsAction(formData: FormData) {
  const supabase = await getSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const id = formData.get("id") as string;
  if (!id) return;

  await supabase.from("artist_news").delete().eq("id", id);

  revalidatePath("/dashboard/news");
  revalidatePath("/");
}

// Optional: Refresh
export async function refreshNewsAction(formData: FormData) {
  const supabase = await getSupabaseServer();
  const id = formData.get("id") as string;
  const url = formData.get("url") as string;
  if (!id || !url) return;

  const meta = await fetchMetadata(url);
  await supabase.from("artist_news").update({
    title: meta.title,
    image_url: meta.image_url,
  }).eq("id", id);

  revalidatePath("/dashboard/news");
  revalidatePath("/");
}

