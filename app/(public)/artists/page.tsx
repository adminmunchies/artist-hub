import type { Metadata } from "next"
import { SITE_URL } from "@/lib/site"
import { getSupabaseServer } from "@/lib/supabaseServer"

export const dynamic = "force-dynamic"
export const revalidate = 0

type Artist = { id: string; name: string | null; updated_at?: string | null; created_at?: string | null }

const norm = (s: string) => s.trim().toLowerCase()
const squash = (s: string) => norm(s).replace(/[\s_-]+/g, "") // "wow 500" -> "wow500"

// zieht rekursiv Text aus Strings/Arrays/Objekten
function collectTexts(v: any, out: string[] = []): string[] {
  if (v == null) return out
  const push = (x: any) => { if (x != null) out.push(String(x)) }
  if (typeof v === "string" || typeof v === "number" || typeof v === "boolean") { push(v); return out }
  if (Array.isArray(v)) { v.forEach(x => collectTexts(x, out)); return out }
  if (typeof v === "object") {
    const pref = ["slug","name","title","label","value","text"]
    pref.forEach(k => { if (k in v) push((v as any)[k]) })
    Object.values(v).forEach(x => collectTexts(x, out))
    return out
  }
  return out
}
function matchPool(pool: string[], q: string): boolean {
  const q1 = norm(q); const q2 = squash(q)
  return pool.some(raw => {
    const s1 = norm(raw); const s2 = squash(raw)
    return s1.includes(q1) || s2.includes(q2)
  })
}

async function fetchArtistsByName(q: string): Promise<Artist[]> {
  const supa = await getSupabaseServer()
  const { data } = await supa
    .from("artists")
    .select("id,name,updated_at,created_at")
    .ilike("name", `%${q}%`)
    .limit(200)
  return data ?? []
}

async function fetchArtistsByProfileMeta(q: string): Promise<Artist[]> {
  const supa = await getSupabaseServer()
  const { data: rows } = await supa.from("artists").select("*").limit(1000)
  const hit = (rows ?? []).filter((r: any) => matchPool(collectTexts(r), q))
  return hit.map((r: any) => ({ id: r.id, name: r.name ?? null, updated_at: r.updated_at ?? null, created_at: r.created_at ?? null }))
}

async function fetchArtistsByWorksMeta(q: string): Promise<Artist[]> {
  const supa = await getSupabaseServer()
  const { data: works } = await supa
    .from("works")
    .select("artist_id,tags,title,medium,materials,published")
    .eq("published", true)
    .limit(3000)
  const ids = Array.from(new Set((works ?? [])
    .filter((w: any) => matchPool([
      ...collectTexts(w?.tags),
      ...collectTexts(w?.title),
      ...collectTexts(w?.medium),
      ...collectTexts(w?.materials),
    ], q))
    .map((w: any) => w?.artist_id)
    .filter(Boolean)
  ))
  if (ids.length === 0) return []
  const { data: artists } = await supa.from("artists").select("id,name,updated_at,created_at").in("id", ids).limit(1000)
  return artists ?? []
}

async function fetchArtistsByNewsMeta(q: string): Promise<Artist[]> {
  const supa = await getSupabaseServer()
  // News der Artists (published) – wir selektieren breit, weil Struktur variieren kann
  const { data: news } = await supa
    .from("artist_news")
    .select("*")
    .eq("published", true)
    .limit(3000)

  // erwarte Feld 'artist_id' (wie im UI-Author-Link) – falls anders, passe hier an
  const ids = Array.from(new Set((news ?? [])
    .filter((n: any) => matchPool(collectTexts(n), q))
    .map((n: any) => n?.artist_id)
    .filter(Boolean)
  ))
  if (ids.length === 0) return []
  const { data: artists } = await supa.from("artists").select("id,name,updated_at,created_at").in("id", ids).limit(1000)
  return artists ?? []
}

async function fetchDefaultArtists(): Promise<Artist[]> {
  const supa = await getSupabaseServer()
  const { data } = await supa
    .from("artists")
    .select("id,name,updated_at,created_at")
    .order("updated_at", { ascending: false })
    .limit(50)
  return data ?? []
}

export async function generateMetadata({ searchParams }: { searchParams: Promise<{ q?: string }> }): Promise<Metadata> {
  const { q = "" } = await searchParams
  const base = (SITE_URL ?? "http://localhost:3000").replace(/\/$/,"")
  const title = q ? `Artists tagged or matching “${q}” – Munchies Art Club` : "Artists – Munchies Art Club"
  const description = q
    ? `Search results for “${q}”: artists whose names or works relate to this query.`
    : "Browse contemporary artists on Munchies Art Club."
  const canonical = q ? `${base}/artists?q=${encodeURIComponent(q.trim())}` : `${base}/artists`
  return {
    title, description,
    alternates: { canonical },
    openGraph: { title, description, url: canonical, type: "website" },
    twitter: { card: "summary", title, description },
  }
}

export default async function ArtistsPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = "" } = await searchParams
  const base = (SITE_URL ?? "http://localhost:3000").replace(/\/$/,"")

  let items: Artist[] = []
  if (q && q.trim()) {
    const [byName, byProfile, byWorks, byNews] = await Promise.all([
      fetchArtistsByName(q),
      fetchArtistsByProfileMeta(q),
      fetchArtistsByWorksMeta(q),
      fetchArtistsByNewsMeta(q),
    ])
    const map = new Map<string, Artist>()
    ;[...byName, ...byProfile, ...byWorks, ...byNews].forEach(a => { if (a?.id) map.set(a.id, a) })
    items = Array.from(map.values())
  } else {
    items = await fetchDefaultArtists()
  }

  const list = items.map((a, i) => ({ "@type":"ListItem", position:i+1, url:`${base}/a/${a.id}`, name:a.name ?? `Artist ${a.id}` }))
  const jsonld = q && q.trim()
    ? { "@context":"https://schema.org","@type":"SearchResultsPage","name":`Search results for “${q}”`,"mainEntity":{ "@type":"ItemList","itemListElement":list } }
    : { "@context":"https://schema.org","@type":"CollectionPage","name":"Artists","mainEntity":{ "@type":"ItemList","itemListElement":list } }

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <script type="application/ld+json" suppressHydrationWarning dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonld) }} />
      <h1 className="text-2xl font-semibold mb-3">{q && q.trim() ? <>Artists matching “{q}”</> : <>Artists</>}</h1>
      <p className="text-sm opacity-70 mb-6">
        {q && q.trim()
          ? <>Results are based on artist names and tags in artist profiles, artist news, and published works.</>
          : <>Recently updated artist profiles.</>}
      </p>
      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {items.map(a => (
          <li key={a.id} className="border rounded-xl p-4">
            <a href={`/a/${a.id}`} className="font-medium underline">{a.name ?? a.id}</a>
          </li>
        ))}
        {items.length === 0 && <li className="opacity-70">No artists found.</li>}
      </ul>
    </main>
  )
}
