// app/(public)/NewsHomeSection.tsx
import { getSupabaseServer } from "@/lib/supabaseServer";

type SiteArticle = {
  id: string;
  url: string;
  title: string | null;
  image_url: string | null;
  excerpt: string | null;
  created_at: string | null;
  featured?: boolean | null;
};

type ArtistNews = {
  id: string;
  url: string;
  title: string | null;
  image_url: string | null;
  created_at: string | null;
  artist_id: string;
  // via FK-Join
  artist?: {
    id: string;
    name: string | null;
    avatar_url: string | null;
  } | null;
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function NewsHomeSection() {
  const supabase = await getSupabaseServer();

  // 1) Admin-Artikel (veröffentlicht)
  const { data: adminRaw } = await supabase
    .from("site_articles")
    .select("id,url,title,image_url,excerpt,created_at,featured")
    .eq("published", true)
    .order("featured", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(8);

  // 2) Artist-News (veröffentlicht) + Artist-Name via FK
  const { data: artistRaw } = await supabase
    .from("artist_news")
    .select(
      "id,url,title,image_url,created_at,artist_id,artist:artist_id(id,name,avatar_url)"
    )
    .eq("published", true)
    .order("created_at", { ascending: false })
    .limit(12);

  // defensiv mergen
  const admin = (adminRaw ?? []).map((a: SiteArticle) => ({
    kind: "admin" as const,
    id: a.id,
    url: a.url,
    title: a.title ?? a.url,
    image: a.image_url ?? null,
    subtitle: a.excerpt ?? null,
    created_at: a.created_at,
  }));

  const artist = (artistRaw ?? []).map((n: ArtistNews) => ({
    kind: "artist" as const,
    id: n.id,
    url: n.url,
    title: n.title ?? n.url,
    image: n.image_url ?? null,
    subtitle: n.artist?.name ?? null,
    created_at: n.created_at,
  }));

  // einfache Mischung: zuerst Admin-Featured/Neu, dann Artist-News
  const items = [...admin, ...artist].slice(0, 12);

  if (items.length === 0) {
    return (
      <section className="mt-12">
        <h2 className="text-2xl font-semibold mb-4">News</h2>
        <p className="text-gray-600">Noch keine News vorhanden.</p>
      </section>
    );
  }

  return (
    <section className="mt-12">
      <h2 className="text-2xl font-semibold mb-4">News</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {items.map((it) => (
          <a
            key={`${it.kind}-${it.id}`}
            href={it.url}
            target="_blank"
            rel="noreferrer"
            className="block rounded-2xl border overflow-hidden hover:shadow-md transition"
          >
            {it.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={it.image}
                alt={it.title ?? "News"}
                className="h-48 w-full object-cover"
              />
            ) : (
              <div className="h-48 w-full flex items-center justify-center text-sm text-gray-500">
                No image
              </div>
            )}

            <div className="px-3 py-2">
              <div className="font-medium line-clamp-2">{it.title}</div>
              {it.subtitle ? (
                <div className="text-sm text-gray-600 line-clamp-1">
                  {it.subtitle}
                </div>
              ) : null}
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
