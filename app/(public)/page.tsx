import { getSupabaseAdmin } from "@/lib/supabaseAdmin"
import { SITE_URL } from "@/lib/site"

export const revalidate = 300

export default async function Home() {
  const supabase = await getSupabaseAdmin()

  const [{ data: artists }, { data: news }] = await Promise.all([
    supabase.from("artists")
      .select("id,name,city,updated_at,created_at")
      .order("updated_at", { ascending: false })
      .limit(6),
    supabase.from("artist_news")
      .select("id,title,created_at,published")
      .eq("published", true)
      .order("created_at", { ascending: false })
      .limit(6),
  ])

  const base = (SITE_URL ?? "http://localhost:3000").replace(/\/$/, "")
  const jsonld = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "url": base,
    "name": "Munchies Art Club — Artist Hub",
    "potentialAction": {
      "@type": "SearchAction",
      "target": `${base}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string"
    }
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <script type="application/ld+json" suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonld) }} />

      <section className="mb-12">
        <h1 className="text-2xl font-semibold mb-2">Artists</h1>
        <p className="opacity-70 mb-6">Recently updated artist profiles.</p>

        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {(artists ?? []).map((a: any) => (
            <li key={a.id} className="border rounded-xl p-4">
              <a className="font-medium underline" href={`/a/${a.id}`}>
                {a.name ?? a.id}
              </a>
              {a.city && <div className="text-sm opacity-70">{a.city}</div>}
            </li>
          ))}
          {(!artists || artists.length === 0) && (
            <li className="opacity-70">No artists yet.</li>
          )}
        </ul>

        <div className="mt-4">
          <a className="underline" href="/artists">Browse all artists →</a>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-medium mb-2">Artist News</h2>
        <p className="opacity-70 mb-6">Latest artist news and editor picks.</p>

        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {(news ?? []).map((n: any) => (
            <li key={n.id} className="border rounded-xl p-4">
              <a className="font-medium underline" href={`/news/${n.id}`}>
                {n.title ?? n.id}
              </a>
            </li>
          ))}
          {(!news || news.length === 0) && (
            <li className="opacity-70">No news found.</li>
          )}
        </ul>

        <div className="mt-4">
          <a className="underline" href="/news">See all news →</a>
        </div>
      </section>
    </main>
  )
}
