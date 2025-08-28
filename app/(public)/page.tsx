// app/(public)/page.tsx
import Link from "next/link";
import { getSupabaseServer } from "@/lib/supabaseServer";
import { routes } from "@/lib/routes";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type Artist = {
  id: string;
  name: string;
  city: string | null;
  avatar_url: string | null;
};

export default async function HomePage() {
  const supabase = await getSupabaseServer();

  // 1) Artists
  const { data: artists } = await supabase
    .from("artists")
    .select("id,name,city,avatar_url")
    .order("created_at", { ascending: false })
    .limit(24);

  // 2) Admin-News (mit TAGS) – nur veröffentlichte
  const { data: adminNews } = await supabase
    .from("site_articles")
    .select(
      "id,url,title,image_url,excerpt,featured,rank,created_at,published,tags"
    )
    .eq("published", true)
    .order("featured", { ascending: false })
    .order("rank", { ascending: true })
    .order("created_at", { ascending: false })
    .limit(6);

  // 3) Artist-News – nur veröffentlichte
  const { data: artistNewsRaw } = await supabase
    .from("artist_news")
    .select("id,url,title,image_url,created_at,artist_id")
    .eq("published", true)
    .order("created_at", { ascending: false })
    .limit(9);

  // Namen mappen
  const artistIds = Array.from(
    new Set((artistNewsRaw ?? []).map((n) => n.artist_id).filter(Boolean))
  );
  const nameMap = new Map<string, string>();
  if (artistIds.length) {
    const { data: nameRows } = await supabase
      .from("artists")
      .select("id,name")
      .in("id", artistIds);
    (nameRows ?? []).forEach((r) => nameMap.set(r.id, r.name));
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      {/* Artists */}
      <h1 className="text-2xl font-semibold mb-6">Artists</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-12">
        {(artists ?? []).map((a: Artist) => (
          <Link
            key={a.id}
            href={routes.artistPublic(a.id)}
            className="rounded-2xl border overflow-hidden hover:shadow-md transition"
            prefetch={false}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={a.avatar_url || "/file.svg"}
              alt={a.name}
              className="h-44 w-full object-cover"
            />
            <div className="px-3 py-2">
              <div className="font-medium">{a.name}</div>
              {a.city ? (
                <div className="text-sm text-gray-500">{a.city}</div>
              ) : null}
            </div>
          </Link>
        ))}
      </div>

      {/* News (Admin) */}
      {(adminNews?.length ?? 0) > 0 && (
        <>
          <h2 className="text-xl font-semibold mb-4">News</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-12">
            {adminNews!.map((n) => (
              <div
                key={n.id}
                className="rounded-2xl border overflow-hidden hover:shadow-md transition"
              >
                {/* EIN großer Link (Bild + Text) */}
                <a
                  href={n.url}
                  target="_blank"
                  rel="noreferrer"
                  className="block"
                >
                  {n.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={n.image_url}
                      alt={n.title ?? "News"}
                      className="h-44 w-full object-cover"
                    />
                  ) : null}
                  <div className="px-3 py-2">
                    <div className="font-medium">
                      {n.title ?? new URL(n.url).hostname}
                    </div>
                    {n.excerpt ? (
                      <div className="text-sm text-gray-600 line-clamp-2 mt-1">
                        {n.excerpt}
                      </div>
                    ) : null}
                  </div>
                </a>

                {/* Tags – separat, NICHT im <a> */}
                {Array.isArray(n.tags) && n.tags.length > 0 ? (
                  <div className="px-3 pb-3 flex flex-wrap gap-2">
                    {n.tags.slice(0, 5).map((t: string) => (
                      <Link
                        key={t}
                        href={`/artists?tag=${encodeURIComponent(t)}`}
                        className="rounded-full border px-2 py-0.5 text-xs"
                      >
                        {t}
                      </Link>
                    ))}
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </>
      )}

      {/* Artist-News */}
      {(artistNewsRaw?.length ?? 0) > 0 ? (
        <>
          <h2 className="text-xl font-semibold mb-4">News von Artists</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {artistNewsRaw!.map((n) => (
              <a
                key={n.id}
                href={n.url}
                target="_blank"
                rel="noreferrer"
                className="block rounded-2xl border overflow-hidden hover:shadow-md transition"
              >
                {n.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={n.image_url}
                    alt={n.title ?? "News"}
                    className="h-44 w-full object-cover"
                  />
                ) : null}
                <div className="px-3 py-2">
                  <div className="font-medium">
                    {n.title ?? new URL(n.url).hostname}
                  </div>
                  {n.artist_id && (
                    <div className="text-sm text-gray-500 mt-1">
                      {nameMap.get(n.artist_id) ?? "Artist"}
                    </div>
                  )}
                </div>
              </a>
            ))}
          </div>
        </>
      ) : (
        (adminNews?.length ?? 0) === 0 && (
          <p className="text-gray-600">Noch keine News vorhanden.</p>
        )
      )}
    </main>
  );
}
