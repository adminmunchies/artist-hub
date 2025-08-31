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
const collectFromKeys = (obj: any, keys: string[]) =>
  keys.flatMap(k => collectTexts(obj?.[k]))

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await getSupabaseAdmin()
  const base = (SITE_URL ?? "http://localhost:3000").replace(/\/$/, "")

  const urls: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${base}/artists`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
  ]

  const [{ data: artists }, { data: works }, { data: articles }, { data: news }] = await Promise.all([
    supabase.from("artists").select("*").order("updated_at", { ascending: false }).limit(500),
    supabase.from("works").select("*").eq("published", true).order("updated_at", { ascending: false }).limit(5000),
    supabase.from("site_articles").select("*").eq("published", true).order("created_at", { ascending: false }).limit(1000),
    supabase.from("artist_news").select("*").eq("published", true).order("created_at", { ascending: false }).limit(3000),
  ])

  const last = (r: any) => new Date(r?.updated_at ?? r?.created_at ?? Date.now())

  ;(artists ?? []).forEach((a: any) => urls.push({ url: `${base}/a/${a.id}`,   lastModified: last(a), changeFrequency: "weekly", priority: 0.7 }))
  ;(works ?? []).forEach  ((w: any) => urls.push({ url: `${base}/w/${w.id}`,   lastModified: last(w), changeFrequency: "weekly", priority: 0.7 }))
  ;(articles ?? []).forEach((s: any) => urls.push({ url: `${base}/an/${s.id}`, lastModified: last(s), changeFrequency: "weekly", priority: 0.6 }))
  ;(news ?? []).forEach   ((n: any) => urls.push({ url: `${base}/news/${n.id}`,lastModified: last(n), changeFrequency: "weekly", priority: 0.6 }))

  // ---- Tag-Ernte (Works / News / Artists) ----
  type TMeta = { count: number; last: Date }
  const tagMap = new Map<string, TMeta>()
  const addTag = (raw: any, when: Date) => {
    const slug = toSlug(raw)
    if (!slug) return
    const cur = tagMap.get(slug)
    if (!cur) tagMap.set(slug, { count: 1, last: when })
    else tagMap.set(slug, { count: cur.count + 1, last: cur.last > when ? cur.last : when })
  }

  // Works: tags (wenn vorhanden)
  ;(works ?? []).forEach((w: any) => {
    const lm = last(w)
    collectFromKeys(w, ["tags"]).forEach(t => addTag(t, lm))
  })

  // Artist News: wenn tags fehlen, Phrasen aus dem Titel verwenden (z. B. "Parallel Vienna", "Kogo Gallery")
  ;(news ?? []).forEach((n: any) => {
    const lm = last(n)
    const pool = collectFromKeys(n, ["tags"])
    if (pool.length > 0) {
      pool.forEach(t => addTag(t, lm))
    } else if (typeof n?.title === "string") {
      const candidates = (n.title as string).match(/\b([A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z0-9]+)+)\b/g) || []
      candidates.forEach(t => addTag(t, lm))
    }
  })

  // Artists: disciplines (+ optional tags, falls existieren)
  ;(artists ?? []).forEach((a: any) => {
    const lm = last(a)
    collectFromKeys(a, ["disciplines","tags"]).forEach(t => addTag(t, lm))
  })

  const totalTags = tagMap.size
  const minCount = totalTags > 200 ? 2 : 1
  const tagEntries = Array.from(tagMap.entries())
    .filter(([_, v]) => v.count >= minCount)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 500)
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
