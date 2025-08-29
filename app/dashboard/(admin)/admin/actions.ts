// app/dashboard/(admin)/admin/actions.ts
"use server";

import { getSupabaseServer } from "@/lib/supabaseServer";
import { isAdmin } from "@/lib/auth/isAdmin";
import { revalidatePath } from "next/cache";

function parseTags(raw: string | null): string[] {
  return (raw ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean)
    .slice(0, 5);
}

function absolutize(u: string, base: string) {
  try {
    return new URL(u, base).href;
  } catch {
    return u;
  }
}

// Scraper für Titel, Beschreibung, Bild
async function fetchMeta(url: string) {
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 7000);

    const res = await fetch(url, {
      signal: ctrl.signal,
      headers: { "user-agent": "Mozilla/5.0" },
      cache: "no-store",
    });

    clearTimeout(t);
    if (!res.ok) return null;

    const html = await res.text();
    const pick = (re: RegExp) => {
      const m = html.match(re);
      return m?.[1]?.trim() || null;
    };

    const ogImage =
      pick(/<meta\s+(?:property|name)=["']og:image["']\s+content=["']([^"']+)["']/i) ||
      pick(/<meta\s+(?:property|name)=["']twitter:image(?::src)?["']\s+content=["']([^"']+)["']/i);

    const ogTitle =
      pick(/<meta\s+(?:property|name)=["']og:title["']\s+content=["']([^"']+)["']/i) ||
      pick(/<title>([^<]+)<\/title>/i);

    const ogDesc =
      pick(/<meta\s+(?:property|name)=["']og:description["']\s+content=["']([^"']+)["']/i) ||
      pick(/<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i);

    return {
      title: ogTitle,
      excerpt: ogDesc,
      image_url: ogImage ? absolutize(ogImage, url) : null,
    };
  } catch {
    return null;
  }
}

export async function createLink(formData: FormData) {
  const supabase = await getSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !isAdmin(user)) return { error: "Not allowed" };

  const url = String(formData.get("url") || "").trim();
  let title = (String(formData.get("title") || "").trim() || null) as string | null;
  let image_url = (String(formData.get("image_url") || "").trim() || null) as string | null;
  let excerpt = (String(formData.get("excerpt") || "").trim() || null) as string | null;
  const published = formData.get("published") === "on";
  const featured = formData.get("featured") === "on";
  const tags = parseTags(formData.get("tags") as string | null);

  if (!url) return { error: "URL is required" };

  // Nur auto-scrapen, wenn Felder fehlen
  if (!image_url || !title || !excerpt) {
    const meta = await fetchMeta(url);
    if (meta) {
      title = title || meta.title;
      excerpt = excerpt || meta.excerpt;
      image_url = image_url || meta.image_url;
    }
  }

  const { error } = await supabase.from("admin_links").insert({
    url,
    title,
    image_url,
    excerpt,
    tags,
    published,
    featured,
    created_by: user.id,
  });
  if (error) return { error: error.message };

  revalidatePath("/dashboard/admin");
  revalidatePath("/");
  return { ok: true };
}

export async function removeLink(formData: FormData) {
  const supabase = await getSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !isAdmin(user)) return { error: "Not allowed" };

  const id = String(formData.get("id") || "");
  if (!id) return { error: "Missing id" };

  const { error } = await supabase.from("admin_links").delete().eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/dashboard/admin");
  revalidatePath("/");
  return { ok: true };
}

export async function toggleFeatured(formData: FormData) {
  const supabase = await getSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !isAdmin(user)) return { error: "Not allowed" };

  const id = String(formData.get("id") || "");
  const nextVal = String(formData.get("featured") || "false") === "true";
  if (!id) return { error: "Missing id" };

  const { error } = await supabase.from("admin_links").update({ featured: nextVal }).eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/dashboard/admin");
  revalidatePath("/");
  return { ok: true };
}

export async function togglePublished(formData: FormData) {
  const supabase = await getSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !isAdmin(user)) return { error: "Not allowed" };

  const id = String(formData.get("id") || "");
  const nextVal = String(formData.get("published") || "false") === "true";
  if (!id) return { error: "Missing id" };

  const { error } = await supabase.from("admin_links").update({ published: nextVal }).eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/dashboard/admin");
  revalidatePath("/");
  return { ok: true };
}

// Bestehende Links nachträglich mit OpenGraph/Meta füllen
export async function refetchMeta(formData: FormData) {
  const supabase = await getSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !isAdmin(user)) return { error: "Not allowed" };

  const id = String(formData.get("id") || "");
  const url = String(formData.get("url") || "");
  if (!id || !url) return { error: "Missing id/url" };

  const meta = await fetchMeta(url);
  if (!meta) return { error: "Could not fetch meta" };

  const { error } = await supabase
    .from("admin_links")
    .update({
      image_url: meta.image_url,
      title: meta.title,
      excerpt: meta.excerpt,
    })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/dashboard/admin");
  revalidatePath("/");
  return { ok: true };
}
