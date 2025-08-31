import type { Metadata } from "next"
import { SITE_URL } from "@/lib/site"

export const metadata: Metadata = (() => {
  const base = (SITE_URL ?? "http://localhost:3000").replace(/\/$/,"")
  const title = "Artists – Munchies Art Club"
  const description = "Recently updated artist profiles."
  const og = `${base}/api/og/artists`

  return {
    title,
    description,
    alternates: { canonical: `${base}/artists` },
    openGraph: {
      title,
      description,
      url: `${base}/artists`,
      siteName: "Munchies Art Club",
      images: [{ url: og, width: 1200, height: 630 }]
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [og]
    }
  }
})()

export default function ArtistsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
