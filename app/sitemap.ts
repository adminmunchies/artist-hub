import type { MetadataRoute } from "next"
import { SITE_URL } from "@/lib/site"
import { getSupabaseAdmin } from "@/lib/supabaseAdmin"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await getSupabaseAdmin()
  const base = (SITE_URL ?? "http://localhost:3000").replace(/\/$/, "")

  const urls: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${base}/artists`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
  ]

  const { data: artists, error: eA } = await supabase
    .from("artists")
    .select("id,updated_at,created_at")
    .order("updated_at", { ascending: false })
    .limit(500)

  const { data: works, error: eW } = await supabase
    .from("works")
    .select("id,updated_at,created_at,published")
    .eq("published", true)
    .order("updated_at", { ascending: false })
    .limit(2000)

  // WICHTIG: Hier KEIN updated_at selektieren – existiert in diesen Tabellen nicht
  const { data: articles, error: eAn } = await supabase
    .from("site_articles")
    .select("id,created_at,published")
    .eq("published", true)
    .order("created_at", { ascending: false })
    .limit(1000)

  const { data: news, error: eN } = await supabase
    .from("artist_news")
    .select("id,created_at,published")
    .eq("published", true)
    .order("created_at", { ascending: false })
    .limit(1000)

  const last = (r: any) => new Date(r?.updated_at ?? r?.created_at ?? Date.now())

  ;(artists ?? []).forEach((a: any) => {
    urls.push({ url: `${base}/a/${a.id}`, lastModified: last(a), changeFrequency: "weekly", priority: 0.7 })
  })
  ;(works ?? []).forEach((w: any) => {
    urls.push({ url: `${base}/w/${w.id}`, lastModified: last(w), changeFrequency: "weekly", priority: 0.7 })
  })
  ;(articles ?? []).forEach((s: any) => {
    urls.push({ url: `${base}/an/${s.id}`, lastModified: last(s), changeFrequency: "weekly", priority: 0.6 })
  })
  ;(news ?? []).forEach((n: any) => {
    urls.push({ url: `${base}/news/${n.id}`, lastModified: last(n), changeFrequency: "weekly", priority: 0.6 })
  })

  console.log("sitemap-counts", {
    artists: (artists ?? []).length,
    works: (works ?? []).length,
    admin_articles: (articles ?? []).length,
    artist_news: (news ?? []).length,
    eA: eA?.message ?? null,
    eW: eW?.message ?? null,
    eAn: eAn?.message ?? null,
    eN: eN?.message ?? null,
  })

  return urls
}
