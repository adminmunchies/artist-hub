import type { MetadataRoute } from "next"
import { SITE_URL } from "@/lib/site"
import { getSupabaseAdmin } from "@/lib/supabaseAdmin"

export const runtime = "nodejs"
export const revalidate = 300

const toSlug = (s: string) =>
  (s ?? "").toString().toLowerCase()
    .normalize("NFKD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")

function collectTexts(v: any, out: string[] = []): string[] {
  if (v == null) return out
  const push = (x: any) => { if (x != null) out.push(String(x)) }
  if (typeof v === "string" || typeof v === "number" || typeof v === "boolean") { push(v); return out }
  if (Array.isArray(v)) { v.forEach(x => collectTexts(x, out)); return out }
  if (typeof v === "object") {
    const pref = ["slug","name","title","label","value","text"]
    pref.forEach(k => { if (k in v) push((v as any)[k]) })
    Object.values(v).forEach(x => collectTexts(x, out))
    return out
  }
  return out
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await getSupabaseAdmin()
  const base = (SITE_URL ?? "http://localhost:3000").replace(/\/$/, "")

  const urls: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${base}/artists`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
  ]

  const [{ data: artists }, { data: works }, { data: articles }, { data: news }] = await Promise.all([
    supabase.from("artists").select("id,updated_at,created_at").order("updated_at", { ascending: false }).limit(500),
    supabase.from("works").select("id,updated_at,created_at,published,tags").eq("published", true).order("updated_at", { ascending: false }).limit(5000),
    supabase.from("site_articles").select("id,created_at,published").eq("published", true).order("created_at", { ascending: false }).limit(1000),
    supabase.from("artist_news").select("id,created_at,published").eq("published", true).order("created_at", { ascending: false }).limit(1000),
  ])

  const last = (r: any) => new Date(r?.updated_at ?? r?.created_at ?? Date.now())

  ;(artists ?? []).forEach((a: any) => urls.push({ url: `${base}/a/${a.id}`, lastModified: last(a), changeFrequency: "weekly", priority: 0.7 }))
  ;(works ?? []).forEach((w: any) => urls.push({ url: `${base}/w/${w.id}`, lastModified: last(w), changeFrequency: "weekly", priority: 0.7 }))
  ;(articles ?? []).forEach((s: any) => urls.push({ url: `${base}/an/${s.id}`, lastModified: last(s), changeFrequency: "weekly", priority: 0.6 }))
  ;(news ?? []).forEach((n: any) => urls.push({ url: `${base}/news/${n.id}`, lastModified: last(n), changeFrequency: "weekly", priority: 0.6 }))

  // Top-Tags aus Works
  const tagMap = new Map<string, { count: number; last: Date }>()
  ;(works ?? []).forEach((w: any) => {
    const ts = last(w)
    const pool = collectTexts(w?.tags)
    pool.forEach(raw => {
      const slug = toSlug(raw)
      if (!slug) return
      const cur = tagMap.get(slug)
      if (!cur) tagMap.set(slug, { count: 1, last: ts })
      else tagMap.set(slug, { count: cur.count + 1, last: cur.last > ts ? cur.last : ts })
    })
  })

  const tagEntries = Array.from(tagMap.entries())
    .filter(([_, v]) => v.count >= 2)            // Schwellwert anpassbar
    .sort((a, b) => b[1].count - a[1].count)     // häufigste zuerst
    .slice(0, 500)                                // Safety-Limit
    .map(([slug, meta]) => ({
      url: `${base}/tag/${slug}`,
      lastModified: meta.last,
      changeFrequency: "weekly" as const,
      priority: 0.5 as const,
    }))

  urls.push(...tagEntries)

  console.log("sitemap-counts", {
    artists: (artists ?? []).length,
    works: (works ?? []).length,
    admin_articles: (articles ?? []).length,
    artist_news: (news ?? []).length,
    tags: tagEntries.length,
  })

  return urls
}
