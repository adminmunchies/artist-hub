import type { Metadata } from "next"
import { SITE_URL } from "@/lib/site"
import { getSupabaseAdmin } from "@/lib/supabaseAdmin"

export const runtime = "nodejs"
export const revalidate = 300

const baseUrl = (SITE_URL ?? "http://localhost:3000").replace(/\/$/, "")
const pageSize = 20

type Search = { page?: string }

async function fetchNewsPage(p: number) {
  const supabase = await getSupabaseAdmin()
  const from = (p - 1) * pageSize
  const to = from + pageSize - 1
  const { data, error, count } = await supabase
    .from("artist_news")
    .select("*", { count: "exact" })
    .eq("published", true)
    .order("created_at", { ascending: false })
    .range(from, to)
  if (error) return { items: [], count: 0 }
  return { items: (data ?? []) as any[], count: count ?? 0 }
}

const abs = (u?: string) => {
  if (!u) return `${baseUrl}/og-default.png`
  if (/^https?:\/\//i.test(u)) return u
  return `${baseUrl}${u.startsWith("/") ? "" : "/"}${u}`
}


export default async function Page(
  { searchParams }: { searchParams: Promise<Search> }
) {
  const { page } = await searchParams
  const p = Math.max(1, Number(page) || 1)
  const { items, count } = await fetchNewsPage(p)
  const totalPages = Math.max(1, Math.ceil(count / pageSize))

  const list = items.map((n, i) => ({
    "@type": "ListItem",
    position: (p - 1) * pageSize + i + 1,
    url: `${baseUrl}/news/${n.id}`,
    name: n.title ?? n.id
  }))

  const jsonld = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "Artist News",
    "mainEntity": { "@type": "ItemList", "itemListElement": list }
  }

  const prevHref = p > 1 ? (p - 1 === 1 ? "/news" : `/news?page=${p - 1}`) : null
  const nextHref = p < totalPages ? `/news?page=${p + 1}` : null

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <script type="application/ld+json" suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonld) }} />
      <h1 className="text-2xl font-semibold mb-4">Artist News</h1>

      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {items.map((n: any) => (
          <li key={n.id} className="border rounded-xl p-4">
            <a href={`/news/${n.id}`} className="font-medium underline">
              {n.title ?? n.id}
            </a>
          </li>
        ))}
        {items.length === 0 && <li className="opacity-70">No news yet.</li>}
      </ul>

      {(prevHref || nextHref) && (
        <nav className="flex items-center gap-3 mt-8">
          {prevHref
            ? <a className="px-3 py-1 rounded border" href={prevHref}>← Prev</a>
            : <span className="px-3 py-1 rounded border opacity-50">← Prev</span>}
          <span className="px-3 py-1 rounded border">Page {p} / {totalPages}</span>
          {nextHref
            ? <a className="px-3 py-1 rounded border" href={nextHref}>Next →</a>
            : <span className="px-3 py-1 rounded border opacity-50">Next →</span>}
        </nav>
      )}
    </main>
  )
}

/** SEO: canonical + OG/Twitter abhängig von ?page= */
import type { Metadata } from "next"
import { SITE_URL } from "@/lib/site"

export async function generateMetadata({ searchParams }:{ searchParams?: { page?: string } }): Promise<Metadata> {
  const base = (SITE_URL ?? "http://localhost:3000").replace(/\/$/,"")
  const pRaw = (searchParams?.page ?? "1").trim()
  const page = Math.max(1, Number.isFinite(+pRaw) ? +pRaw : 1)

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
      images: [{ url: og, width: 1200, height: 630 }]
    },
    twitter: {
      card: "summary_large_image",
      title, description,
      images: [og]
    }
  }
}
