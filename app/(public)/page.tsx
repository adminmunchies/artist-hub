// app/(public)/page.tsx
import Link from "next/link";
import type { Metadata } from "next";
import { getSupabaseServer } from "@/lib/supabaseServer";
import { routes } from "@/lib/routes";
import AdminLinksHomeSection from "./AdminLinksHomeSection";
import NewsHomeSection from "./NewsHomeSection";
import { SITE_URL, toAbsolute } from "@/lib/site";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// ---- SEO: OG/Twitter + Canonical für Home ----
export const metadata: Metadata = {
  title: "Munchies Art Club — Artists, Works, News",
  description: "Curated artist profiles, works and news from Munchies Art Club.",
  openGraph: {
    title: "Munchies Art Club — Artists, Works, News",
    description:
      "Curated artist profiles, works and news from Munchies Art Club.",
    images: [`${SITE_URL}/og-default.png`],
    url: SITE_URL,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Munchies Art Club — Artists, Works, News",
    description:
      "Curated artist profiles, works and news from Munchies Art Club.",
    images: [`${SITE_URL}/og-default.png`],
  },
  alternates: { canonical: SITE_URL },
};

type Artist = {
  id: string;
  name: string;
  city: string | null;
  avatar_url: string | null;
};

export default async function HomePage() {
  const supabase = await getSupabaseServer();

  // 1) Artists – neueste 3 (immer frisch)
  const { data: artists } = await supabase
    .from("artists")
    .select("id,name,city,avatar_url")
    .order("created_at", { ascending: false })
    .limit(3);

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      {/* Organization JSON-LD (SSR) */}
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "Munchies Art Club",
            url: SITE_URL,
            logo: `${SITE_URL}/og-default.png`,
          }),
        }}
      />

      {/* 1) Artists */}
      <h1 className="text-2xl font-semibold mb-6">Artists</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-12">
        {(artists ?? []).map((a: Artist) => {
          const img = toAbsolute(a.avatar_url) || undefined;
          return (
            <Link
              key={a.id}
              href={routes.artistPublic(a.id)}
              className="rounded-2xl border overflow-hidden hover:shadow-md transition"
              prefetch={false}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {img ? (
                <img
                  src={img}
                  alt={`${a.name} — portrait`}
                  className="h-44 w-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="h-44 w-full bg-gray-100" />
              )}
              <div className="px-3 py-2">
                <div className="font-medium">{a.name}</div>
                {a.city ? (
                  <div className="text-sm text-gray-500">{a.city}</div>
                ) : null}
              </div>
            </Link>
          );
        })}
      </div>

      {/* 2) Editor’s Picks (aus site_articles) */}
      <AdminLinksHomeSection />

      {/* 3) Artist News */}
      <NewsHomeSection />
    </main>
  );
}

