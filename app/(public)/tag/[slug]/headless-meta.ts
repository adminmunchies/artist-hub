import type { Metadata } from "next"
import { SITE_URL } from "@/lib/site"

const base = (SITE_URL ?? "http://localhost:3000").replace(/\/$/, "")
export function tagMeta(slug: string, human?: string): Metadata {
  const label = human || slug.replace(/-/g, " ")
  const title = `Tag: ${label} – Munchies Art Club`
  const description = `Explore artists, works and news tagged with “${label}”.`
  const canonical = `${base}/tag/${slug}`
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      type: "website",
      url: canonical,
      title,
      description,
      images: [{ url: `${base}/og-default.png` }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`${base}/og-default.png`],
    },
  }
}
