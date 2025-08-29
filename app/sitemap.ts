// app/sitemap.ts
import type { MetadataRoute } from "next";
import { getSupabaseServer } from "@/lib/supabaseServer";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const BASE = process.env.SITE_URL || "http://localhost:3000";
  const now = new Date();

  const urls: MetadataRoute.Sitemap = [
    { url: `${BASE}/`,        lastModified: now, changeFrequency: "daily",  priority: 1.0 },
    { url: `${BASE}/artists`, lastModified: now, changeFrequency: "daily",  priority: 0.8 },
  ];

  // Artists (öffentliche Profilseiten)
  const supabase = await getSupabaseServer();
  const { data: artists } = await supabase.from("artists").select("id").limit(5000);

  for (const a of artists ?? []) {
    urls.push({
      url: `${BASE}/a/${a.id}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    });
  }

  // WICHTIG: admin_links NICHT hinzufügen, solange ihr keine internen /news/[id]-Seiten habt.
  // (Sitemaps sollen nur eigene, erreichbare URLs der Domain enthalten.)

  return urls;
}
