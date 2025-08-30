import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const host = base.replace(/^https?:\/\//, "");
  return {
    rules: [
      { userAgent: "*", allow: "/" },
      { userAgent: "Google-Extended", allow: "/" },
      { userAgent: "GPTBot", allow: "/" },
      { userAgent: "PerplexityBot", allow: "/" },
      { userAgent: "CCBot", allow: "/" },
    ],
    sitemap: [`${base}/sitemap.xml`],
    host,
  };
}
