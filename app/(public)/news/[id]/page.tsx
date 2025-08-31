import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getSupabaseServer } from "@/lib/supabaseServer";
import { SITE_URL, toAbsolute } from "@/lib/site";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type Params = { params: Promise<{ id: string }> };

type Article = {
  id: string;
  title: string | null;
  excerpt: string | null;
  body_html: string | null;
  image_url: string | null;
  url: string | null;
  published: boolean | null;
  created_at: string | null;
};

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { id } = await params;
  const supabase = await getSupabaseServer();

  const { data: row } = await supabase
    .from("site_articles")
    .select("id,title,excerpt,image_url,published,created_at,url")
    .eq("id", id)
    .maybeSingle<Article>();

  const title = row?.title ?? "Article";
  const description = row?.excerpt ?? "Article on Munchies Art Club";
  const og = toAbsolute(row?.image_url) ?? `${SITE_URL}/og-default.png`;
  const canonical = `${SITE_URL}/news/${id}`;

  if (!row || row.published !== true) {
    return { title, description, alternates: { canonical }, robots: { index: false, follow: false } };
  }

  return {
    title,
    description,
    openGraph: { title, description, images: [og], url: canonical, type: "article" },
    twitter: { card: "summary_large_image", title, description, images: [og] },
    alternates: { canonical },
  };
}

export default async function NewsPage({ params }: Params) {
  const { id } = await params;
  const supabase = await getSupabaseServer();

  const { data: row } = await supabase
    .from("site_articles")
    .select("id,title,excerpt,body_html,image_url,published,created_at,url")
    .eq("id", id)
    .maybeSingle<Article>();

  if (!row || row.published !== true) {
    notFound();
  }

  const img = toAbsolute(row.image_url);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "@id": `${SITE_URL}/news/${id}`,
    url: `${SITE_URL}/news/${id}`,
    headline: row.title ?? "Article",
    image: img ? [img] : undefined,
    datePublished: row.created_at ?? undefined,
    description: row.excerpt ?? "",
    publisher: { "@type": "Organization", name: "Munchies Art Club" },
    mainEntityOfPage: { "@type": "WebPage", "@id": `${SITE_URL}/news/${id}` },
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

      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </main>
  );
}
