// app/(public)/an/[id]/page.tsx
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { SITE_URL } from "@/lib/site";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type Params = { params: Promise<{ id: string }> }; // Next 15: params ist ein Promise

// ---------- OG/Twitter/Canonical ----------
export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { id } = await params;
  const supabase = getSupabaseAdmin();

  const { data: row } = await supabase
    .from("site_articles")
    .select("title,excerpt,image_url,published")
    .eq("id", id)
    .eq("published", true)
    .maybeSingle();

  if (!row) {
    return { title: "Article", robots: { index: false, follow: false } };
  }

  const title = row.title ?? "Article";
  const description = row.excerpt ?? "Article on Munchies Art Club";
  const og = row.image_url ?? `${SITE_URL}/og-default.png`;
  const url = `${SITE_URL}/an/${id}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, images: [og], url, type: "article" },
    twitter: { card: "summary_large_image", title, description, images: [og] },
    robots: { index: true, follow: true },
  };
}

export default async function ArticlePage({ params }: Params) {
  const { id } = await params;
  const supabase = getSupabaseAdmin();

  const { data: row } = await supabase
    .from("site_articles")
    .select("id,title,excerpt,body_html,image_url,created_at,published,url")
    .eq("id", id)
    .eq("published", true)
    .maybeSingle();

  if (!row) notFound();

  const img = row.image_url ?? `${SITE_URL}/og-default.png`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "@id": `${SITE_URL}/an/${id}`,
    url: `${SITE_URL}/an/${id}`,
    headline: row.title ?? "Article",
    image: img ? [img] : undefined,
    datePublished: row.created_at ?? undefined,
    description: row.excerpt ?? "",
    publisher: { "@type": "Organization", name: "Munchies Art Club" },
    mainEntityOfPage: { "@type": "WebPage", "@id": `${SITE_URL}/an/${id}` },
    sameAs: row.url ? [row.url] : undefined,
  };

  return (
    <main className="mx-auto max-w-4xl px-6 py-8">
      <h1 className="text-3xl font-semibold mb-4">{row.title ?? "Article"}</h1>

      {img ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={img} alt={row.title ?? "Article"} className="w-full rounded-xl border mb-6" />
      ) : null}

      {row.excerpt && <p className="text-gray-700 mb-4">{row.excerpt}</p>}

      {row.body_html && (
        <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: row.body_html }} />
      )}

      {row.url && (
        <div className="mt-4">
          <a href={row.url} target="_blank" rel="noreferrer" className="underline">
            Zur Quelle öffnen ↗
          </a>
        </div>
      )}

      {/* JSON-LD */}
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </main>
  );
}
