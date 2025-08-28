// app/(public)/page.tsx
import Link from "next/link";
import { getSupabaseServer } from "@/lib/supabaseServer";
import { routes } from "@/lib/routes";
import AdminLinksHomeSection from "./AdminLinksHomeSection";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type Artist = {
  id: string;
  name: string;
  city: string | null;
  avatar_url: string | null;
};

type ArtistNews = {
  id: string;
  url: string;
  title: string | null;
  image_url: string | null;
  created_at: string | null;
  artist_id: string | null;
  published?: boolean | null;
};

export default async function HomePage() {
  const supabase = await getSupabaseServer();

  // 1) Artists – neueste 6
  const { data: artists } = await supabase
    .from("artists")
    .select("id,name,city,avatar_url")
    .order("created_at", { ascending: false })
    .limit(3);

  // 3) Artist News – nur veröffentlichte
  const { data: artistNewsRaw } = await supabase
    .from("artist_news")
    .select("id,url,title,image_url,created_at,artist_id,published")
    .eq("published", true)
    .order("created_at", { ascending: false })
    .limit(9);

  // Namen mappen (für die News-Karten)
  const artistIds = Array.from(
    new Set((artistNewsRaw ?? []).map((n) => n.artist_id).filter(Boolean))
  ) as string[];
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
      {/* 1) Artists */}
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
            {a.avatar_url ? (
              <img
                src={a.avatar_url}
                alt={a.name}
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
        ))}
      </div>

      {/* 2) Editor’s Picks (aus admin_links) */}
      <AdminLinksHomeSection />

      {/* 3) Artist News (aus artist_news) */}
      {(artistNewsRaw?.length ?? 0) > 0 && (
        <>
          <h2 className="text-xl font-semibold mb-4">Artist News</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {artistNewsRaw!.map((n: ArtistNews) => (
              <a
                key={n.id}
                href={n.url}
                target="_blank"
                rel="noreferrer"
                className="block rounded-2xl border overflow-hidden hover:shadow-md transition"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {n.image_url ? (
                  <img
                    src={n.image_url}
                    alt={n.title ?? "News"}
                    className="h-44 w-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="h-44 w-full bg-gray-100" />
                )}
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
      )}
    </main>
  );
}
