// app/(public)/news/[id]/page.tsx
import { getSupabaseServer } from "@/lib/supabaseServer";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const BASE = process.env.SITE_URL || "http://localhost:3000";

export async function generateMetadata({ params }: { params: { id: string } }) {
  const supabase = await getSupabaseServer();
  const { data: row } = await supabase
    .from("admin_links")
    .select("title,excerpt,image_url,url,published")
    .eq("id", params.id)
    .single();

  if (!row || row.published !== true) return { robots: { index: false, follow: false } };

  const title = row.title ?? "News";
  const description = row.excerpt ?? undefined;
  const images = row.image_url ? [row.image_url] : [];

  return {
    title,
    description,
    alternates: { canonical: `${BASE}/news/${params.id}` },
    openGraph: { title, description, images, url: `${BASE}/news/${params.id}` },
    twitter: { card: images.length ? "summary_large_image" : "summary", title, description, images },
    robots: { index: true, follow: true },
  };
}

export default async function NewsDetail({ params }: { params: { id: string } }) {
  const supabase = await getSupabaseServer();
  const { data: row } = await supabase
    .from("admin_links")
    .select("id,title,excerpt,image_url,url,tags,created_at,published,featured")
    .eq("id", params.id)
    .single();

  if (!row || row.published !== true) notFound();

  return (
    <main className="max-w-3xl mx-auto px-4 py-10 space-y-6">
      <h1 className="text-2xl font-semibold">{row.title || "News"}</h1>

      {/* eslint-disable-next-line @next/next/no-img-element */}
      {row.image_url ? (
        <img src={row.image_url} alt={row.title || "News"} className="w-full rounded-xl object-cover" />
      ) : null}

      {row.excerpt ? <p className="text-gray-700">{row.excerpt}</p> : null}

      <div className="flex flex-wrap gap-2">
        {(row.tags ?? []).map((t: string) => (
          <a
            key={t}
            href={`/tags/${encodeURIComponent(t.toLowerCase())}`}
            className="text-xs rounded-full border px-2 py-0.5"
          >
            {t}
          </a>
        ))}
      </div>

      <div>
        <a href={row.url} target="_blank" rel="noreferrer" className="underline">
          Zur Quelle öffnen ↗
        </a>
      </div>
    </main>
  );
}
