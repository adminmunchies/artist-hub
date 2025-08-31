import { getSupabaseServer } from "@/lib/supabaseServer";
import { SITE_URL, toAbsolute } from "@/lib/site";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type Params = { params: Promise<{ id: string }> };

// ---- OG/Twitter + Canonical (+ noindex wenn unveröffentlicht) ----
export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { id } = await params;
  const supabase = await getSupabaseServer();

  const { data: row } = await supabase
    .from("artist_news")
    .select("id,title,excerpt,image_url,created_at,published")
    .eq("id", id)
    .maybeSingle();

  const title = row?.title ?? "Artist News";
  const description = row?.excerpt ?? undefined;
  const og = toAbsolute(row?.image_url) ?? `${SITE_URL}/og-default.png`;
  const url = `${SITE_URL}/an/${id}`;

  if (!row || row.published !== true) {
    return { title, description, alternates: { canonical: url }, robots: { index: false, follow: false } };
  }

  return {
    title,
    description,
    openGraph: { title, description, images: [og], url, type: "article" },
    twitter: { card: "summary_large_image", title, description, images: [og] },
    alternates: { canonical: url },
  };
}

export default async function ArtistNewsDetail({ params }: Params) {
  const { id } = await params;
  const supabase = await getSupabaseServer();

  const { data: row } = await supabase
    .from("artist_news")
    .select("id,title,excerpt,image_url,url,artist_id,created_at,published")
    .eq("id", id)
    .maybeSingle();

  if (!row || row.published !== true) notFound();

  const { data: a } = row.artist_id
    ? await supabase.from("artists").select("id,name").eq("id", row.artist_id).maybeSingle()
    : { data: null as any };

  const artistId = a?.id ?? null;
  const artistName = a?.name ?? null;
  const img = toAbsolute(row.image_url);

  // JSON-LD (NewsArticle)
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "@id": `${SITE_URL}/an/${id}`,
    url: `${SITE_URL}/an/${id}`,
    headline: row.title ?? "Artist News",
    image: img ? [img] : undefined,
    datePublished: row.created_at ?? undefined,
    description: row.excerpt ?? "",
    publisher: { "@type": "Organization", name: "Munchies Art Club" },
    mainEntityOfPage: { "@type": "WebPage", "@id": `${SITE_URL}/an/${id}` },
    sameAs: row.url ? [row.url] : undefined,
    about:
      artistId && artistName
        ? { "@type": "Person", name: artistName, "@id": `${SITE_URL}/a/${artistId}` }
        : undefined,
  };

  return (
    <main className="max-w-3xl mx-auto px-4 py-10 space-y-6">
      <h1 className="text-2xl font-semibold">{row.title || "Artist News"}</h1>

      {img ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={img} alt={row.title || "News"} className="w-full rounded-xl object-cover" />
      ) : null}

      <div className="text-sm text-gray-500">
        {artistName ? (
          <>
            von{" "}
            <Link href={`/a/${artistId}`} className="underline">
              {artistName}
            </Link>
          </>
        ) : null}
      </div>

      {row.excerpt ? <p className="text-gray-700">{row.excerpt}</p> : null}

      {row.url && (
        <div>
          <a href={row.url} target="_blank" rel="noreferrer" className="underline">
            Zur Quelle öffnen ↗
          </a>
        </div>
      )}

      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </main>
  );
}
