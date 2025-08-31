// app/sitemap.ts
import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = getSupabaseAdmin();

  const urls: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/artists`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
  ];

  // Artists
  const { data: artists } = await supabase
    .from("artists")
    .select("id, updated_at, created_at")
    .order("updated_at", { ascending: false })
    .limit(500);

  (artists ?? []).forEach((a: any) => {
    const lm = a?.updated_at ?? a?.created_at;
    urls.push({
      url: `${SITE_URL}/a/${a.id}`,
      lastModified: lm ? new Date(lm) : new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    });
  });

  // Works (published)
  const { data: works } = await supabase
    .from("works")
    .select("id, updated_at, created_at, published")
    .eq("published", true)
    .order("updated_at", { ascending: false })
    .limit(2000);

  (works ?? []).forEach((w: any) => {
    const lm = w?.updated_at ?? w?.created_at;
    urls.push({
      url: `${SITE_URL}/w/${w.id}`,
      lastModified: lm ? new Date(lm) : new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    });
  });

  // Admin Articles (site_articles – published)
  const { data: articles } = await supabase
    .from("site_articles")
    .select("id, updated_at, created_at, published")
    .eq("published", true)
    .order("created_at", { ascending: false })
    .limit(1000);

  (articles ?? []).forEach((s: any) => {
    const lm = s?.updated_at ?? s?.created_at;
    urls.push({
      url: `${SITE_URL}/an/${s.id}`,
      lastModified: lm ? new Date(lm) : new Date(),
      changeFrequency: "weekly",
      priority: 0.6,
    });
  });

  // Artist News (artist_news – published)
  const { data: news } = await supabase
    .from("artist_news")
    .select("id, updated_at, created_at, published")
    .eq("published", true)
    .order("created_at", { ascending: false })
    .limit(1000);

  (news ?? []).forEach((n: any) => {
    const lm = n?.updated_at ?? n?.created_at;
    urls.push({
      url: `${SITE_URL}/news/${n.id}`,
      lastModified: lm ? new Date(lm) : new Date(),
      changeFrequency: "weekly",
      priority: 0.6,
    });
  });

  return urls;
}
