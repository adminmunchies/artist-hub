import type { MetadataRoute } from "next";
import { getSupabaseServer } from "@/lib/supabaseServer";
import { SITE_URL } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await getSupabaseServer();

  const urls: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/artists`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
  ];

  const { data: artists } = await supabase
    .from("artists")
    .select("id, updated_at")
    .order("updated_at", { ascending: false })
    .limit(500);

  (artists ?? []).forEach((a: any) => {
    urls.push({
      url: `${SITE_URL}/a/${a.id}`,
      lastModified: a.updated_at ? new Date(a.updated_at) : new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    });
  });

  const { data: works } = await supabase
    .from("works")
    .select("id, updated_at, published")
    .eq("published", true)
    .order("updated_at", { ascending: false })
    .limit(2000);

  (works ?? []).forEach((w: any) => {
    urls.push({
      url: `${SITE_URL}/w/${w.id}`,
      lastModified: w.updated_at ? new Date(w.updated_at) : new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    });
  });

  const { data: articles } = await supabase
    .from("site_articles")
    .select("id, updated_at, published")
    .eq("published", true)
    .order("updated_at", { ascending: false })
    .limit(1000);

  (articles ?? []).forEach((s: any) => {
    urls.push({
      url: `${SITE_URL}/an/${s.id}`,
      lastModified: s.updated_at ? new Date(s.updated_at) : new Date(),
      changeFrequency: "weekly",
      priority: 0.6,
    });
  });

  return urls;
}
