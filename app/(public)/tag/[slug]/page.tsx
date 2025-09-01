// app/(public)/tag/[slug]/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { SITE_URL } from "@/lib/site";
import { getSupabaseServer } from "@/lib/supabaseServer";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type Artist = { id: string; name: string | null; updated_at?: string | null; created_at?: string | null };
type Work   = { id: string; title?: string | null; artist_id?: string | null; updated_at?: string | null; created_at?: string | null };

const toSlug = (s: string) =>
  String(s)
    .toLowerCase()
    .normalize("NFKD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

/** robustes Bild-Picking für admin_links / site_articles / artist_news */
function pickImage(r: any): string {
  const candidates = [
    r?.image_url,
    r?.og_image,
    r?.cover_image,
    r?.thumbnail_url,
    Array.isArray(r?.images) && r.images.length ? r.images[0] : null,
    r?.thumbnail,
  ];
  for (const v of candidates) {
    if (typeof v === "string" && /^https?:\/\//.test(v)) return v;
  }
  return "/og-default.png";
}

function collectTexts(v: any, out: string[] = []): string[] {
  if (v == null) return out;
  const push = (x: any) => { if (x != null) out.push(String(x)); };
  if (typeof v === "string" || typeof v === "number" || typeof v === "boolean") { push(v); return out; }
  if (Array.isArray(v)) { v.forEach((x) => collectTexts(x, out)); return out; }
  if (typeof v === "object") {
    const pref = ["slug","name","title","label","value","text","excerpt","tags","tags_lc"];
    pref.forEach(k => { if (k in v) push((v as any)[k]); });
    Object.values(v).forEach((x) => collectTexts(x, out));
  }
  return out;
}

function matchesTagPool(pool: string[], qSlug: string): boolean {
  const t = toSlug(qSlug);
  const tFlat = t.replace(/-/g, "");
  return pool.some((raw) => {
    const s = toSlug(raw);
    const sFlat = s.replace(/-/g, "");
    return s === t || sFlat === tFlat || s.includes(t) || sFlat.includes(tFlat);
  });
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const base = (SITE_URL ?? "http://localhost:3000").replace(/\/$/,"");
  const human = slug.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");

  const title = `Tag: ${human} – Munchies Art Club`;
  const description = `Artists and works related to “${human}” on Munchies Art Club.`;
  const canonical = `${base}/tag/${encodeURIComponent(slug)}`;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: { title, description, url: canonical, type: "website" },
    twitter: { card: "summary", title, description },
  };
}

export default async function TagPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const base = (SITE_URL ?? "http://localhost:3000").replace(/\/$/,"");
  const human = slug.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");

  const supa = await getSupabaseServer();

  // 1) Works (published)
  const { data: worksRaw } = await supa
    .from("works")
    .select("id,title,tags,artist_id,updated_at,created_at,published")
    .eq("published", true)
    .limit(5000);

  const works: Work[] = (worksRaw ?? [])
    .filter((w: any) => {
      const pool: string[] = [];
      collectTexts(w?.tags, pool);
      collectTexts(w?.title, pool);
      return matchesTagPool(pool, slug);
    })
    .slice(0, 24);

  // 2) Artists (Profilfelder + via Works)
  const artistIdsFromWorks = Array.from(new Set(works.map((w) => w.artist_id).filter(Boolean))) as string[];
  const { data: artistsRaw } = await supa.from("artists").select("*").limit(1000);

  const artistsMatched = (artistsRaw ?? []).filter((a: any) => {
    if (matchesTagPool(collectTexts(a), slug)) return true;
    return artistIdsFromWorks.includes(a.id);
  });

  const artists: Artist[] = artistsMatched
    .map((r: any) => ({ id: r.id, name: r.name ?? null, updated_at: r.updated_at, created_at: r.created_at }))
    .slice(0, 50);

  // 3) Artist News (published) – jetzt als Karten mit Bild
  const { data: artistNewsRaw } = await supa
    .from("artist_news")
    .select("*")
    .eq("published", true)
    .limit(1000);

  const artistNews = (artistNewsRaw ?? [])
    .filter((n: any) => matchesTagPool(collectTexts(n), slug))
    .slice(0, 12)
    .map((n: any) => {
      // bestmögliche Ziel-URL (fallback: /news)
      const href =
        n.external_url || n.url || n.source_url || "/news";
      return {
        id: n.id,
        title: n.title ?? n.id,
        href,
        img: pickImage(n),
        excerpt: n.excerpt ?? null,
      };
    });

  // 4) Related Picks (admin_links + site_articles wie zuvor)
  const { data: adminLinksRaw } = await supa
    .from("admin_links")
    .select("*")
    .eq("published", true)
    .limit(1000);

  const adminLinks = (adminLinksRaw ?? [])
    .filter((l: any) => matchesTagPool(collectTexts(l), slug))
    .slice(0, 12);

  const { data: siteArticlesRaw } = await supa
    .from("site_articles")
    .select("*")
    .eq("published", true)
    .limit(1000);

  const editorials = (siteArticlesRaw ?? [])
    .filter((e: any) => matchesTagPool(collectTexts(e?.tags ?? e?.tags_lc ?? e), slug))
    .slice(0, 12);

  // JSON-LD
  const list = artists.map((a, i) => ({
    "@type": "ListItem",
    position: i + 1,
    url: `${base}/a/${a.id}`,
    name: a.name ?? `Artist ${a.id}`,
  }));

  const jsonld = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `Tag: ${human}`,
    mainEntity: { "@type": "ItemList", itemListElement: list },
  };

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <script type="application/ld+json" suppressHydrationWarning dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonld) }} />
      <h1 className="text-3xl font-semibold mb-2">Tag: {human}</h1>
      <p className="text-sm opacity-70 mb-8">Artists and works related to “{human}”.</p>

      {/* Artists */}
      <section className="mb-10">
        <h2 className="text-xl font-medium mb-3">Artists</h2>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {artists.map((a) => (
            <li key={a.id} className="border rounded-xl p-4">
              <a href={`/a/${a.id}`} className="font-medium underline">{a.name ?? a.id}</a>
            </li>
          ))}
          {artists.length === 0 && <li className="opacity-70">No artists found.</li>}
        </ul>
      </section>

      {/* Works */}
      <section className="mb-10">
        <h2 className="text-xl font-medium mb-3">Works</h2>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {works.map((w) => (
            <li key={w.id} className="border rounded-xl p-4">
              <a href={`/w/${w.id}`} className="font-medium underline">{w.title ?? w.id}</a>
            </li>
          ))}
          {works.length === 0 && <li className="opacity-70">No works found.</li>}
        </ul>
      </section>

      {/* Artist News — jetzt mit Bildkarten */}
      {artistNews.length > 0 && (
        <section className="mb-10">
          <h2 className="text-xl font-medium mb-3">Artist News</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {artistNews.map((n) => (
              <article key={n.id} className="rounded-2xl border overflow-hidden hover:shadow-sm transition">
                <a href={n.href} target="_blank" rel="noreferrer noopener" className="block">
                  <div className="aspect-[16/10] bg-gray-100 overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={n.img} alt={n.title} className="w-full h-full object-cover" loading="lazy" />
                  </div>
                  <div className="p-4">
                    <h4 className="font-medium hover:underline">{n.title}</h4>
                    {n.excerpt ? <p className="text-sm text-gray-600 mt-1 line-clamp-2">{n.excerpt}</p> : null}
                  </div>
                </a>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* Related Picks */}
      {(adminLinks.length > 0 || editorials.length > 0) && (
        <section className="mb-10">
          <h2 className="text-xl font-medium mb-3">Related Picks</h2>

          {adminLinks.length > 0 && (
            <>
              <h3 className="font-medium mb-2">Featured Links</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                {adminLinks.map((l: any) => (
                  <article key={l.id} className="rounded-2xl border overflow-hidden hover:shadow-sm transition">
                    <a href={l.url} target="_blank" rel="noreferrer noopener" className="block">
                      <div className="aspect-[16/10] bg-gray-100 overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={pickImage(l)} alt={l.title || l.url} className="w-full h-full object-cover" loading="lazy" />
                      </div>
                      <div className="p-4">
                        <h4 className="font-medium hover:underline">{l.title || l.url}</h4>
                        {l.excerpt ? <p className="text-sm text-gray-600 mt-1 line-clamp-2">{l.excerpt}</p> : null}
                      </div>
                    </a>
                  </article>
                ))}
              </div>
            </>
          )}

          {editorials.length > 0 && (
            <>
              <h3 className="font-medium mb-2">Editorials</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {editorials.map((e: any) => (
                  <article key={e.id} className="rounded-2xl border overflow-hidden hover:shadow-sm transition">
                    <Link href={`/an/${e.id}`} className="block">
                      <div className="aspect-[16/10] bg-gray-100 overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={pickImage(e)} alt={e.title ?? e.id} className="w-full h-full object-cover" loading="lazy" />
                      </div>
                      <div className="p-4">
                        <h4 className="font-medium hover:underline">{e.title ?? e.id}</h4>
                        {e.excerpt ? <p className="text-sm text-gray-600 mt-1 line-clamp-2">{e.excerpt}</p> : null}
                      </div>
                    </Link>
                  </article>
                ))}
              </div>
            </>
          )}
        </section>
      )}
    </main>
  );
}
