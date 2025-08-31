// app/(public)/news/[id]/page.tsx
import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { SITE_URL } from "@/lib/site"
import { getSupabaseAdmin } from "@/lib/supabaseAdmin"

export const runtime = "nodejs"
export const revalidate = 300

type Params = { id: string }

const baseUrl = (SITE_URL ?? "http://localhost:3000").replace(/\/$/, "")
const toAbs = (u?: string) => {
  if (!u) return `${baseUrl}/og-default.png`
  if (/^https?:\/\//i.test(u)) return u
  return `${baseUrl}${u.startsWith("/") ? "" : "/"}${u}`
}

async function fetchNews(id: string) {
  const supabase = await getSupabaseAdmin()
  const { data, error } = await supabase
    .from("artist_news")
    .select("*")
    .eq("id", id)
    .eq("published", true)
    .single()
  if (error || !data) return null
  return data as any
}

export async function generateMetadata(
  { params }: { params: Promise<Params> }
): Promise<Metadata> {
  const { id } = await params
  const row = await fetchNews(id)
  if (!row) return {}

  const title = row.title ?? "Artist News"
  const description = row.summary ?? row.excerpt ?? ""
  const canonical = `${baseUrl}/news/${row.id}`
  const img =
    row.og_image ??
    row.cover_image ??
    (Array.isArray(row.images) && row.images[0]) ??
    "/og-default.png"
  const imgAbs = toAbs(img)

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      type: "article",
      url: canonical,
      title,
      description,
      images: [{ url: imgAbs }],
      publishedTime: row.created_at ?? undefined,
      modifiedTime: row.updated_at ?? row.created_at ?? undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imgAbs],
    },
  }
}

export default async function Page(
  { params }: { params: Promise<Params> }
) {
  const { id } = await params
  const row = await fetchNews(id)
  if (!row) notFound()

  const title = row.title ?? "Artist News"
  const description = row.summary ?? row.excerpt ?? ""
  const canonical = `${baseUrl}/news/${row.id}`

  const newsJsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "mainEntityOfPage": { "@type": "WebPage", "@id": canonical },
    "headline": title,
    "datePublished": row.created_at ?? undefined,
    "dateModified": row.updated_at ?? row.created_at ?? undefined,
    "author": row.author ? { "@type": "Person", name: row.author } : undefined,
    "publisher": {
      "@type": "Organization",
      "name": "Munchies Art Club",
      "logo": { "@type": "ImageObject", "url": toAbs("/og-default.png") }
    },
    "image": (() => {
      const imgs: string[] = []
      if (Array.isArray(row.images)) imgs.push(...row.images.map((x: string) => toAbs(x)))
      if (row.cover_image) imgs.unshift(toAbs(row.cover_image))
      if (row.og_image) imgs.unshift(toAbs(row.og_image))
      return imgs.length ? Array.from(new Set(imgs)) : [toAbs("/og-default.png")]
    })(),
    "description": description || undefined
  }

  const crumbs = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", position: 1, name: "Home", item: baseUrl },
      { "@type": "ListItem", position: 2, name: "News", item: `${baseUrl}/news` },
      { "@type": "ListItem", position: 3, name: title, item: canonical }
    ]
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <script type="application/ld+json" suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(newsJsonLd) }} />
      <script type="application/ld+json" suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(crumbs) }} />

      <article>
        <h1 className="text-2xl font-semibold mb-4">{title}</h1>
        {description && <p className="opacity-80 mb-6">{description}</p>}
        {/* TODO: hier deinen eigentlichen Content/Images/Links rendern */}
      </article>
    </main>
  )
}
