import type { Metadata } from "next"
import { SITE_URL } from "@/lib/site"
import { getSupabaseAdmin } from "@/lib/supabaseAdmin"

export const runtime = "nodejs"
export const revalidate = 300

const baseUrl = (SITE_URL ?? "http://localhost:3000").replace(/\/$/,"")
const pageSize = 20

type Search = { page?: string }

async function fetchPage(p: number) {
  const supabase = await getSupabaseAdmin()
  const from = (p - 1) * pageSize
  const to = from + pageSize - 1
  const { data, error, count } = await supabase
    .from("site_articles")
    .select("*", { count: "exact" })
    .eq("published", true)
    .order("created_at", { ascending: false })
    .range(from, to)
  if (error) return { items: [], count: 0 }
  return { items: (data ?? []) as any[], count: count ?? 0 }
}

const abs = (u?: string) => /^https?:\/\//i.test(String(u||"")) ? String(u) : `${baseUrl}${!u?"/og-default.png":(String(u).startsWith("/")?"":"/")+String(u)}`

export async function generateMetadata({ searchParams }: { searchParams: Promise<Search> }): Promise<Metadata> {
  const { page } = await searchParams
  const p = Math.max(1, Number(page) || 1)
  const title = p > 1 ? `Articles – Page ${p}` : "Articles"
  const canonical = p > 1 ? `${baseUrl}/an?page=${p}` : `${baseUrl}/an`
  const description = "Editor articles by Munchies Art Club."
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      type: "website",
      url: canonical,
      title, description,
      images: [{ url: abs("/og-default.png") }],
    },
    twitter: {
      card: "summary_large_image",
      title, description,
      images: [abs("/og-default.png")],
    },
  }
}

export default async function Page({ searchParams }: { searchParams: Promise<Search> }) {
  const { page } = await searchParams
  const p = Math.max(1, Number(page) || 1)
  const { items, count } = await fetchPage(p)
  const totalPages = Math.max(1, Math.ceil(count / pageSize))

  const list = items.map((a, i) => ({
    "@type": "ListItem",
    position: (p - 1) * pageSize + i + 1,
    url: `${baseUrl}/an/${a.id}`,
    name: a.title ?? a.id
  }))
  const jsonld = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "Articles",
    "mainEntity": { "@type": "ItemList", "itemListElement": list }
  }

  const prevHref = p > 1 ? (p - 1 === 1 ? "/an" : `/an?page=${p - 1}`) : null
  const nextHref = p < totalPages ? `/an?page=${p + 1}` : null

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <script type="application/ld+json" suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonld) }} />
      <h1 className="text-2xl font-semibold mb-4">Articles</h1>

      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {items.map((a: any) => (
          <li key={a.id} className="border rounded-xl p-4">
            <a href={`/an/${a.id}`} className="font-medium underline">{a.title ?? a.id}</a>
          </li>
        ))}
        {items.length === 0 && <li className="opacity-70">No articles yet.</li>}
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
