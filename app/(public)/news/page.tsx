import type { Metadata } from "next"
import { SITE_URL } from "@/lib/site"
import { getSupabaseAdmin } from "@/lib/supabaseAdmin"

export const runtime = "nodejs"

const toAbs = (base: string, path?: string | null) => {
  if (!path) return `${base}/og-default.png`
  if (/^https?:\/\//i.test(path)) return path
  return `${base}${path.startsWith("/") ? "" : "/"}${path}`
}

export async function generateMetadata(): Promise<Metadata> {
  const base = (SITE_URL ?? "http://localhost:3000").replace(/\/$/,"")
  const title = "Artist News"
  const description = "Latest artist news and editor articles."
  return {
    title,
    description,
    alternates: { canonical: `${base}/news` },
    openGraph: {
      title, description, url: `${base}/news`,
      siteName: "Munchies Art Club",
      images: [{ url: "/api/og/news", width: 1200, height: 630 }],
    },
    twitter: { card: "summary_large_image", title, description, images: ["/api/og/news"] },
  }
}

const PAGE_SIZE = 12

export default async function Page({ searchParams }: { searchParams: { page?: string } }) {
  const base = (SITE_URL ?? "http://localhost:3000").replace(/\/$/,"")
  const page = Math.max(1, Number.parseInt(searchParams?.page || "1") || 1)
  const from = (page - 1) * PAGE_SIZE
  const to   = from + PAGE_SIZE - 1

  const supabase = await getSupabaseAdmin()
  const { data, error } = await supabase
    .from("artist_news")
    .select("id, title, created_at, cover_image, og_image, images")
    .eq("published", true)
    .order("created_at", { ascending: false })
    .range(from, to)

  // 💡 Null-safe array
  const rows: any[] = Array.isArray(data) ? data : []
  if (error) console.error("artist_news error:", error)

  const pickImage = (r: any) => {
    const img = r?.cover_image || r?.og_image || (Array.isArray(r?.images) ? r.images[0] : null)
    return toAbs(base, img)
  }

  const hasMore = rows.length === PAGE_SIZE

  const list = rows.map((n: any, i: number) => ({
    "@type":"ListItem", position: i + 1, url:`${base}/news/${n.id}`, name: n.title ?? n.id
  }))
  const jsonld = { "@context":"https://schema.org", "@type":"CollectionPage",
    "name":"Artist News", "mainEntity":{ "@type":"ItemList", "itemListElement":list } }

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <script type="application/ld+json" suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonld) }} />

      <h1 className="text-2xl font-semibold mb-6">Artist News</h1>

      <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {rows.map((n: any) => (
          <li key={n.id} className="border rounded-2xl overflow-hidden hover:shadow-md transition">
            <a href={`/news/${n.id}`} className="block">
              <div className="aspect-[16/10] bg-neutral-100 overflow-hidden">
                <img src={pickImage(n)} alt={n?.title ?? "News"}
                     className="w-full h-full object-cover" loading="lazy" />
              </div>
              <div className="p-4">
                <h3 className="font-medium"
                    style={{display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", overflow:"hidden"}}>
                  {n?.title ?? n.id}
                </h3>
                <p className="opacity-60 text-sm mt-1">
                  {new Date(n?.created_at || Date.now()).toLocaleDateString()}
                </p>
              </div>
            </a>
          </li>
        ))}
        {rows.length === 0 && <li className="opacity-70">No news found.</li>}
      </ul>

      {hasMore && (
        <div className="mt-8 text-center">
          <a href={`/news?page=${page+1}`} className="inline-block px-4 py-2 border rounded-xl">
            Load more
          </a>
        </div>
      )}
    </main>
  )
}
