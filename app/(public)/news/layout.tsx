import type { Metadata } from "next"
import { SITE_URL } from "@/lib/site"

export async function generateMetadata(
  { searchParams }: { searchParams: Promise<{ page?: string }> }
): Promise<Metadata> {
  const sp = await searchParams
  const base = (SITE_URL ?? "http://localhost:3000").replace(/\/$/,"")
  const raw = (sp?.page ?? "1").trim()
  const page = Math.max(1, Number.isFinite(+raw as any) ? +raw : 1)

  const canonical = page > 1 ? `${base}/news?page=${page}` : `${base}/news`
  const title = page > 1 ? `Artist News – Page ${page} – Munchies Art Club` : `Artist News – Munchies Art Club`
  const description = "Latest artist news and editor articles from Munchies Art Club."
  const og = `${base}/api/og/news`

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title, description, url: canonical, siteName: "Munchies Art Club",
      images: [{ url: og, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title, description,
      images: [og],
    },
  }
}

export default function NewsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
