// app/(public)/an/[id]/page.tsx
import { getSupabaseServer } from "@/lib/supabaseServer";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const BASE = process.env.SITE_URL || "http://localhost:3000";

export async function generateMetadata({ params }: { params: { id: string } }) {
  const supabase = await getSupabaseServer();
  const { data: row } = await supabase
    .from("artist_news")
    .select("title,excerpt,image_url,url,published")
    .eq("id", params.id)
    .single();

  if (!row || row.published !== true) return { robots: { index: false, follow: false } };

  const title = row.title ?? "Artist News";
  const description = row.excerpt ?? undefined;
  const images = row.image_url ? [row.image_url] : [];

  return {
    title,
    description,
    alternates: { canonical: `${BASE}/an/${params.id}` },
    openGraph: { title, description, images, url: `${BASE}/an/${params.id}` },
    twitter: { card: images.length ? "summary_large_image" : "summary", title, description, images },
    robots: { index: true, follow: true },
  };
}

export default async function ArtistNewsDetail({ params }: { params: { id: string } }) {
  const supabase = await getSupabaseServer();
  const { data: row } = await supabase
    .from("artist_news")
    .select("id,title,excerpt,image_url,url,artist_id,created_at,published")
    .eq("id", params.id)
    .single();

  if (!row || row.published !== true) notFound();

  let artistName: string | null = null;
  if (row.artist_id) {
    const { data: a } = await supabase.from("artists").select("name").eq("id", row.artist_id).single();
    artistName = a?.name ?? null;
  }

  return (
    <main className="max-w-3xl mx-auto px-4 py-10 space-y-6">
      <h1 className="text-2xl font-semibold">{row.title || "Artist News"}</h1>

      {/* eslint-disable-next-line @next/next/no-img-element */}
      {row.image_url ? (
        <img src={row.image_url} alt={row.title || "News"} className="w-full rounded-xl object-cover" />
      ) : null}

      <div className="text-sm text-gray-500">
        {artistName ? <>von <span className="font-medium">{artistName}</span></> : null}
      </div>

      {row.excerpt ? <p className="text-gray-700">{row.excerpt}</p> : null}

      <div>
        <a href={row.url} target="_blank" rel="noreferrer" className="underline">
          Zur Quelle öffnen ↗
        </a>
      </div>
    </main>
  );
}
