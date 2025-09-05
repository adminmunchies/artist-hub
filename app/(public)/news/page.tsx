// app/(public)/news/page.tsx
import Link from "next/link"
import { getSupabaseServer } from "@/lib/supabaseServer"

export const dynamic = "force-dynamic"
export const revalidate = 0

type RawArtistNews = {
  id: string
  title: string
  created_at?: string | null
  artist_id?: string | null
  external_url?: string | null
  image_url?: string | null
  og_image?: string | null
  cover_image?: string | null
  thumbnail_url?: string | null
  images?: string[] | null
  thumbnail?: string | null
}

type RawEditorial = {
  id: string
  title: string
  created_at?: string | null
  excerpt?: string | null
  image_url?: string | null
  og_image?: string | null
  cover_image?: string | null
  thumbnail_url?: string | null
  tags?: string[] | null
  tags_lc?: string[] | null
  images?: string[] | null
  thumbnail?: string | null
}

type RawAdminLink = {
  id: string
  title?: string | null
  url: string
  image_url?: string | null
  excerpt?: string | null
  created_at?: string | null
  og_image?: string | null
  cover_image?: string | null
  thumbnail_url?: string | null
  images?: string[] | null
  thumbnail?: string | null
}

function isHttp(u: unknown): u is string {
  return typeof u === "string" && /^https?:\/\//i.test(u)
}

/** returns the first valid http(s) image URL or null */
function pickImageUrl(r: any): string | null {
  const candidates: unknown[] = [
    r?.image_url,
    r?.og_image,
    r?.cover_image,
    r?.thumbnail_url,
    Array.isArray(r?.images) && r.images.length ? r.images[0] : null,
    r?.thumbnail,
  ]
  for (const c of candidates) {
    if (isHttp(c)) return c
  }
  return null
}

export default async function NewsIndexPage() {
  const supa = await getSupabaseServer()

  const [artistNewsRes, editorialRes, adminRes] = await Promise.all([
    supa
      .from("artist_news")
      .select("*")
      .eq("published", true)
      .order("created_at", { ascending: false })
      .limit(60),
    supa
      .from("site_articles")
      .select("*")
      .eq("published", true)
      .order("created_at", { ascending: false })
      .limit(60),
    supa
      .from("admin_links")
      .select("*")
      .eq("published", true)
      .eq("featured", true) // wenn ALLE publizierten Links gewünscht -> diese Zeile entfernen
      .order("created_at", { ascending: false })
      .limit(24),
  ])

  const artistNews = (artistNewsRes.data ?? []) as RawArtistNews[]
  const editorials = (editorialRes.data ?? []) as RawEditorial[]
  const featuredLinks = (adminRes.data ?? []) as RawAdminLink[]

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      {/* Artist News */}
      <h1 className="text-2xl font-semibold mb-6">Artist News</h1>
      {artistNews.length === 0 ? (
        <p className="opacity-70 mb-12">No artist news found.</p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3 mb-12">
          {artistNews.map((n) => {
            // Ziel-URL: Artist-Profil > externe URL > Detailseite (Fallback)
            const href = n.artist_id
              ? `/a/${n.artist_id}`
              : n.external_url || `/news/${n.id}`

            // Bild: echte URL > OG-Fallback aus eigener API
            const img = pickImageUrl(n) ?? `/api/og/news/${n.id}`

            return (
              <Link
                key={`an-${n.id}`}
                href={href}
                className="block rounded-2xl border overflow-hidden hover:shadow-sm"
              >
                <div className="aspect-[16/10] bg-gray-100 overflow-hidden">
                  {/* plain <img> -> keine next.config Domains nötig */}
                  <img
                    src={img}
                    alt={n.title || "Artist news"}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="p-4">
                  <div className="text-xs tracking-wide uppercase opacity-70 mb-1">
                    ARTIST NEWS
                  </div>
                  <div className="font-medium">{n.title || "Untitled"}</div>
                </div>
              </Link>
            )
          })}
        </div>
      )}

      {/* Editorials */}
      <h2 className="text-2xl font-semibold mb-6">Editorials</h2>
      {editorials.length === 0 ? (
        <p className="opacity-70 mb-12">No editorials found.</p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3 mb-12">
          {editorials.map((e) => {
            const img = pickImageUrl(e) ?? `/api/og/an/${e.id}`
            return (
              <Link
                key={`ed-${e.id}`}
                href={`/an/${e.id}`}
                className="block rounded-2xl border overflow-hidden hover:shadow-sm"
              >
                <div className="aspect-[16/10] bg-gray-100 overflow-hidden">
                  <img
                    src={img}
                    alt={e.title || "Editorial"}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="p-4">
                  <div className="text-xs tracking-wide uppercase opacity-70 mb-1">
                    EDITORIAL
                  </div>
                  <div className="font-medium">{e.title || "Untitled"}</div>
                </div>
              </Link>
            )
          })}
        </div>
      )}

      {/* Featured Links (admin_links) */}
      <h2 className="text-2xl font-semibold mb-6">Featured Links</h2>
      {featuredLinks.length === 0 ? (
        <p className="opacity-70">No featured links yet.</p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {featuredLinks.map((l) => {
            const img = pickImageUrl(l) ?? "/og-default.png"
            return (
              <a
                key={`fl-${l.id}`}
                href={l.url}
                target="_blank"
                rel="noreferrer noopener"
                className="block rounded-2xl border overflow-hidden hover:shadow-sm"
              >
                <div className="aspect-[16/10] bg-gray-100 overflow-hidden">
                  <img
                    src={img}
                    alt={l.title || l.url}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="p-4">
                  <div className="text-xs tracking-wide uppercase opacity-70 mb-1">
                    FEATURED LINK
                  </div>
                  <div className="font-medium">{l.title || l.url}</div>
                  {l.excerpt ? (
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                      {l.excerpt}
                    </p>
                  ) : null}
                </div>
              </a>
            )
          })}
        </div>
      )}
    </main>
  )
}
