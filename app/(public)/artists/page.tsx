import type { Metadata } from "next"
import { SITE_URL } from "@/lib/site"
import { getSupabaseServer } from "@/lib/supabaseServer"

export const dynamic = "force-dynamic"
export const revalidate = 0

type Artist = {
  id: string
  name: string | null
  slug?: string | null
  updated_at?: string | null
  created_at?: string | null
}

function norm(s: string) {
  return s.trim().toLowerCase()
}

async function fetchArtistsByName(q: string): Promise<Artist[]> {
  const supa = await getSupabaseServer()
  const { data } = await supa
    .from("artists")
    .select("id,name,updated_at,created_at")
    .ilike("name", `%${q}%`)
    .limit(100)
  return data ?? []
}

async function fetchArtistsByTagHeuristic(q: string): Promise<Artist[]> {
  const supa = await getSupabaseServer()
  // Heuristik: Works holen und clientseitig Tags matchen; dann Artists dazu laden.
  const { data: works } = await supa
    .from("works")
    .select("artist_id,tags,published")
    .eq("published", true)
    .limit(1000)
  const n = norm(q)
  const artistIds = Array.from(
    new Set(
      (works ?? [])
        .filter(w => Array.isArray(w?.tags) && (w?.tags as string[]).some(t => (t ?? "").toLowerCase().includes(n)))
        .map(w => w?.artist_id)
        .filter(Boolean) as string[]
    )
  )
  if (artistIds.length === 0) return []
  const { data: tagArtists } = await supa
    .from("artists")
    .select("id,name,updated_at,created_at")
    .in("id", artistIds)
    .limit(1000)
  return tagArtists ?? []
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
  const title = q
    ? `Artists tagged or matching “${q}” – Munchies Art Club`
    : "Artists – Munchies Art Club"
  const description = q
    ? `Search results for “${q}”: artists whose names or works relate to this query. Curated by Munchies Art Club.`
    : "Browse contemporary artists on Munchies Art Club. Curated profiles, works, and news."

  const canonical = q ? `${base}/artists?q=${encodeURIComponent(q.trim())}` : `${base}/artists`

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      type: "website",
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  }
}

export default async function ArtistsPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = "" } = await searchParams
  const base = (SITE_URL ?? "http://localhost:3000").replace(/\/$/,"")

  let items: Artist[] = []
  if (q && q.trim()) {
    const [byName, byTag] = await Promise.all([
      fetchArtistsByName(q),
      fetchArtistsByTagHeuristic(q),
    ])
    const map = new Map<string, Artist>()
    ;[...byName, ...byTag].forEach(a => { if (a?.id) map.set(a.id, a) })
    items = Array.from(map.values())
  } else {
    items = await fetchDefaultArtists()
  }

  const list = items.map((a, i) => ({
    "@type": "ListItem",
    position: i + 1,
    url: `${base}/a/${a.id}`,
    name: a.name ?? `Artist ${a.id}`,
  }))

  const jsonld = q && q.trim()
    ? {
        "@context": "https://schema.org",
        "@type": "SearchResultsPage",
        "name": `Search results for “${q}”`,
        "mainEntity": {
          "@type": "ItemList",
          "itemListElement": list
        }
      }
    : {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "name": "Artists",
        "mainEntity": {
          "@type": "ItemList",
          "itemListElement": list
        }
      }

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonld) }}
      />
      <h1 className="text-2xl font-semibold mb-3">
        {q && q.trim() ? <>Artists matching “{q}”</> : <>Artists</>}
      </h1>
      <p className="text-sm opacity-70 mb-6">
        {q && q.trim()
          ? <>Results are based on artist names and tags in published works.</>
          : <>Recently updated artist profiles.</>}
      </p>
      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {items.map(a => (
          <li key={a.id} className="border rounded-xl p-4">
            <a href={`/a/${a.id}`} className="font-medium underline">{a.name ?? a.id}</a>
          </li>
        ))}
        {items.length === 0 && (
          <li className="opacity-70">No artists found.</li>
        )}
      </ul>
    </main>
  )
}
