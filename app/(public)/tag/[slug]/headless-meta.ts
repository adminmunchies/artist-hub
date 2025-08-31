import type { Metadata } from "next"
import { SITE_URL } from "@/lib/site"

export async function tagMeta(slug: string): Promise<Metadata> {
  const base = (SITE_URL ?? "http://localhost:3000").replace(/\/$/,"")
  const pretty = slug.split("-").map(s => s.charAt(0).toUpperCase()+s.slice(1)).join(" ")
  const title = `Tag: ${pretty} – Munchies Art Club`
  const description = `Artists and works related to “${pretty}”.`
  const canonical = `${base}/tag/${slug}`
  const ogImage = `${base}/api/og/tag/${slug}`

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: "Munchies Art Club",
      images: [{ url: ogImage, width: 1200, height: 630 }]
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage]
    }
  }
}
