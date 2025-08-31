// app/(public)/news/[id]/page.tsx
import { getSupabaseServer } from "@/lib/supabaseServer";
import { SITE_URL } from "@/lib/site";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type Params = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { id } = await params;
  const supabase = await getSupabaseServer();

  const { data: row } = await supabase
    .from("artist_news")
    .select("title,excerpt,image_url,published")
    .eq("id", id)
    .maybeSingle();

  if (!row || row.published !== true) {
    return { title: "News", robots: { index: false, follow: false } };
  }

  const title = row.title ?? "News";
  const description = row.excerpt ?? "Artist news on Munchies Art Club";
  const og = row.image_url ?? `${SITE_URL}/og-default.png`;
  const url = `${SITE_URL}/news/${id}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, images: [og], url, type: "article" },
    twitter: { card: "summary_large_image", title, description, images: [og] },
    robots: { index: true, follow: true },
  };
}

export default async function NewsPage({ params }: Params) {
  const { id } = await params;
  const supabase = await getSupabaseServer();

  const { data: row } = await supabase
    .from("artist_news")
    .select("id,title,excerpt,image_url,url,artist_id,created_at,published")
    .eq("id", id)
    .maybeSingle();

  if (!row || row.published !== true) notFound();

  const img = row.image_url ?? `${SITE_URL}/og-default.png`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "@id": `${SITE_URL}/news/${id}`,
    url: `${SITE_URL}/news/${id}`,
    headline: row.title ?? "News",
    image: img ? [img] : undefined,
    datePublished: row.created_at ?? undefined,
    description: row.excerpt ?? "",
    publisher: { "@type": "Organization", name: "Munchies Art Club" },
    sameAs: row.url ? [row.url] : undefined,
  };

  return (
    <main className="mx-auto max-w-4xl px-6 py-8">
      <h1 className="text-3xl font-semibold mb-4">{row.title ?? "News"}</h1>
      {img && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={img} alt={row.title ?? "News"} className="w-full rounded-xl border mb-6" />
      )}
      {row.excerpt && <p className="text-gray-700 mb-4">{row.excerpt}</p>}
      {row.url && (
        <div className="mt-4">
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
