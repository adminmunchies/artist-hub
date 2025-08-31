import type { Metadata } from "next"
import { SITE_URL } from "@/lib/site"
import { getSupabaseAdmin } from "@/lib/supabaseAdmin"

export const revalidate = 300

function pickImg(row: any): string {
  const imgs = Array.isArray(row?.images) ? row.images.filter(Boolean) : []
  return imgs[0] || row?.cover_image || row?.og_image || "/og-default.png"
}

export async function generateMetadata(
  { searchParams }: { searchParams?: { page?: string } }
): Promise<Metadata> {
  const base = (SITE_URL ?? "http://localhost:3000").replace(/\/$/,"")
  const page = Number(searchParams?.page ?? "1") || 1
  const canonical = `${base}/news${page>1 ? `?page=${page}` : ""}`
  const title = "Artist News"
  const description = "Latest artist news from Munchies Art Club."

  return {
    title, description,
    alternates: { canonical },
    openGraph: {
      title, description, url: canonical, siteName: "Munchies Art Club",
      images: [{ url: "/api/og/news", width: 1200, height: 630 }]
    },
    twitter: { card: "summary_large_image", title, description, images: ["/api/og/news"] }
  }
}

async function fetchArtistNews(page: number, perPage = 12) {
  const supabase = await getSupabaseAdmin()
  const from = (page - 1) * perPage
  const to = from + perPage - 1

  const { data, count, error } = await supabase
    .from("artist_news")
    .select("id,title,created_at,og_image,cover_image,images,description", { count: "exact" })
    .eq("published", true)
    .order("created_at", { ascending: false })
    .range(from, to)

  if (error) {
    console.error("artist_news error:", { message: error.message, details: error.details, hint: error.hint })
    return { items: [] as any[], total: 0 }
  }
  return { items: data ?? [], total: count ?? (data?.length ?? 0) }
}

export default async function Page({ searchParams }:{ searchParams?: { page?: string } }) {
  const page = Math.max(1, Number(searchParams?.page ?? "1") || 1)
  const { items: news, total } = await fetchArtistNews(page)
  const base = (SITE_URL ?? "http://localhost:3000").replace(/\/$/,"")

  // JSON-LD (CollectionPage + ItemList)
  const list = news.map((n: any, i: number) => ({
    "@type":"ListItem", position: i+1, url: `${base}/news/${n.id}`, name: n.title ?? `News ${n.id}`
  }))
  const jsonld = {
    "@context":"https://schema.org",
    "@type":"CollectionPage",
    "name":"Artist News",
    "mainEntity":{ "@type":"ItemList", "itemListElement": list }
  }

  const perPage = 12
  const hasNext = page * perPage < total

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <script type="application/ld+json" suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonld) }} />

      <h1 className="text-2xl font-semibold mb-6">Artist News</h1>

      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {news.map((n: any) => (
          <li key={n.id} className="border rounded-xl overflow-hidden">
            <a href={`/news/${n.id}`} className="block">
              <img src={pickImg(n)} alt="" style={{ width:"100%", height:180, objectFit:"cover", display:"block" }} />
              <div className="p-4 font-medium underline">{n.title ?? n.id}</div>
            </a>
          </li>
        ))}
        {news.length === 0 && <li className="opacity-70">No news found.</li>}
      </ul>

      {hasNext && (
        <div className="mt-6">
          <a className="inline-block border rounded-xl px-4 py-2" href={`/news?page=${page+1}`}>Load more</a>
        </div>
      )}
    </main>
  )
}
