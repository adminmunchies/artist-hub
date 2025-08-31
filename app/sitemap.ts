import type { MetadataRoute } from "next";
import { getSupabaseServer } from "@/lib/supabaseServer";
import { SITE_URL } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await getSupabaseServer();

  const urls: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`,        lastModified: new Date(), changeFrequency: "daily",  priority: 1 },
    { url: `${SITE_URL}/artists`, lastModified: new Date(), changeFrequency: "daily",  priority: 0.8 },
  ];

  // Artists
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

  // Works (published)
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

  // Artist News (published) – ACHTUNG: artist_news hat i. d. R. KEIN updated_at
  const { data: news } = await supabase
    .from("artist_news")
    .select("id, created_at, published")
    .eq("published", true)
    .order("created_at", { ascending: false })
    .limit(1000);

  (news ?? []).forEach((n: any) => {
    urls.push({
      url: `${SITE_URL}/an/${n.id}`,
      lastModified: n.created_at ? new Date(n.created_at) : new Date(),
      changeFrequency: "weekly",
      priority: 0.6,
    });
  });

  return urls;
}
