import type { Metadata } from "next"
import { SITE_URL } from "@/lib/site"
import { getSupabaseServer } from "@/lib/supabaseServer"

export const dynamic = "force-dynamic"
export const revalidate = 0

type Artist = { id: string; name: string | null; updated_at?: string | null; created_at?: string | null }
type Work   = { id: string; title?: string | null; artist_id?: string | null; updated_at?: string | null; created_at?: string | null }

const toSlug = (s: string) =>
  s.toLowerCase()
   .normalize("NFKD").replace(/[\u0300-\u036f]/g, "")
   .replace(/[^a-z0-9]+/g, "-")
   .replace(/^-+|-+$/g, "")

const squash = (s: string) => toSlug(s).replace(/-/g, "")

function collectTexts(v: any, out: string[] = []): string[] {
  if (v == null) return out
  const push = (x: any) => { if (x != null) out.push(String(x)) }
  if (typeof v === "string" || typeof v === "number" || typeof v === "boolean") { push(v); return out }
  if (Array.isArray(v)) { v.forEach(x => collectTexts(x, out)); return out }
  if (typeof v === "object") {
    const pref = ["slug","name","title","label","value","text"]
    pref.forEach(k => { if (k in v) push((v as any)[k]) })
    Object.values(v).forEach(x => collectTexts(x, out))
  }
  return out
}

function matchesTagPool(pool: string[], qSlug: string): boolean {
  const t = toSlug(qSlug)
  const tFlat = t.replace(/-/g, "")
  return pool.some(raw => {
    const s = toSlug(raw); const sFlat = s.replace(/-/g, "")
    return s === t || sFlat === tFlat || s.includes(t) || sFlat.includes(tFlat)
  })
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const base = (SITE_URL ?? "http://localhost:3000").replace(/\/$/,"")
  const human = slug.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")

  const title = `Tag: ${human} – Munchies Art Club`
  const description = `Artists and works related to “${human}” on Munchies Art Club.`
  const canonical = `${base}/tag/${encodeURIComponent(slug)}`

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: { title, description, url: canonical, type: "website" },
    twitter: { card: "summary", title, description },
  }
}

export default async function TagPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const base = (SITE_URL ?? "http://localhost:3000").replace(/\/$/,"")
  const human = slug.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")

  const supa = await getSupabaseServer()

  // 1) Works (published) zum Tag finden
  const { data: worksRaw } = await supa
    .from("works")
    .select("id,title,tags,artist_id,updated_at,created_at,published")
    .eq("published", true)
    .limit(5000)

  const works: Work[] = (worksRaw ?? []).filter((w: any) => {
    const pool: string[] = []
    collectTexts(w?.tags, pool)
    collectTexts(w?.title, pool)
    return matchesTagPool(pool, slug)
  }).slice(0, 24) // Anzeige begrenzen

  // 2) Artists aus Works-Set + zusätzlich Profilfelder matchen
  const artistIdsFromWorks = Array.from(new Set(works.map(w => w.artist_id).filter(Boolean))) as string[]

  const { data: artistsRaw } = await supa
    .from("artists")
    .select("*")
    .limit(1000)

  const artistsMatched = (artistsRaw ?? []).filter((a: any) => {
    // match, wenn in Profilfeldern/Objekten der Tag vorkommt
    if (matchesTagPool(collectTexts(a), slug)) return true
    // oder wenn über Works referenziert
    return artistIdsFromWorks.includes(a.id)
  })

  const artists: Artist[] = artistsMatched
    .map((r: any) => ({ id: r.id, name: r.name ?? null, updated_at: r.updated_at, created_at: r.created_at }))
    .slice(0, 50)

  // 3) Artist News (optional, top 6)
  const { data: newsRaw } = await supa
    .from("artist_news")
    .select("*")
    .eq("published", true)
    .limit(1000)

  const news = (newsRaw ?? []).filter((n: any) => matchesTagPool(collectTexts(n), slug)).slice(0, 6)

  // JSON-LD (ItemList der Artists)
  const list = artists.map((a, i) => ({
    "@type": "ListItem",
    position: i + 1,
    url: `${base}/a/${a.id}`,
    name: a.name ?? `Artist ${a.id}`,
  }))

  const jsonld = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": `Tag: ${human}`,
    "mainEntity": {
      "@type": "ItemList",
      "itemListElement": list
    }
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <script type="application/ld+json" suppressHydrationWarning dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonld) }} />
      <h1 className="text-3xl font-semibold mb-2">Tag: {human}</h1>
      <p className="text-sm opacity-70 mb-8">
        Artists and works related to “{human}”.
      </p>

      <section className="mb-10">
        <h2 className="text-xl font-medium mb-3">Artists</h2>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {artists.map(a => (
            <li key={a.id} className="border rounded-xl p-4">
              <a href={`/a/${a.id}`} className="font-medium underline">{a.name ?? a.id}</a>
            </li>
          ))}
          {artists.length === 0 && <li className="opacity-70">No artists found.</li>}
        </ul>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-medium mb-3">Works</h2>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {works.map(w => (
            <li key={w.id} className="border rounded-xl p-4">
              <a href={`/w/${w.id}`} className="font-medium underline">
                {w.title ?? w.id}
              </a>
            </li>
          ))}
          {works.length === 0 && <li className="opacity-70">No works found.</li>}
        </ul>
      </section>

      {news.length > 0 && (
        <section className="mb-10">
          <h2 className="text-xl font-medium mb-3">Artist News</h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {news.map((n: any) => (
              <li key={n.id} className="border rounded-xl p-4">
                <a href={`/news/${n.id}`} className="font-medium underline">{n.title ?? n.id}</a>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  )
}
