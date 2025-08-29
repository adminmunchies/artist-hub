import Link from "next/link";
import { getSupabaseServer } from "@/lib/supabaseServer";
import { routes } from "@/lib/routes";
import SearchBox from "./SearchBox";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type Artist = {
  id: string;
  name: string | null;
  city?: string | null;
  avatar_url?: string | null;
  disciplines?: string[] | null;
  tags?: string[] | null;
};

type ArtistNews = {
  id: string;
  url: string;
  title: string | null;
  artist_id: string | null;
  published: boolean | null;
};

function normalize(str: unknown) {
  return String(str || "")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
}

// ⬇️ WICHTIG: searchParams ist ein Promise, wir awaiten es
export default async function ArtistsPage({
  searchParams,
}: {
  searchParams?: Promise<{ q?: string }>;
}) {
  const sp = await searchParams;
  const qRaw = (sp?.q ?? "").trim();
  const q = normalize(qRaw);

  const supabase = await getSupabaseServer();

  // 1) Künstler holen (reichlich, wir filtern im Code)
  const { data: artistsAll } = await supabase
    .from("artists")
    .select("id,name,city,avatar_url,disciplines,tags")
    .order("created_at", { ascending: false })
    .limit(200);

  const artists = artistsAll ?? [];

  // 2) Wenn Query, auch letzte Artist-News laden (für Relevanz)
  let newsByArtist = new Map<string, ArtistNews[]>();
  if (q) {
    const { data: news } = await supabase
      .from("artist_news")
      .select("id,url,title,artist_id,published")
      .eq("published", true)
      .order("created_at", { ascending: false })
      .limit(300);

    (news ?? []).forEach((n) => {
      if (!n.artist_id) return;
      const arr = newsByArtist.get(n.artist_id) ?? [];
      arr.push(n);
      newsByArtist.set(n.artist_id, arr);
    });
  }

  // 3) Filtern (Name, City, Disciplines, Tags) + News
  const filtered = q
    ? artists.filter((a) => {
        const hay = [
          a.name,
          a.city,
          ...(a.disciplines ?? []),
          ...(a.tags ?? []),
        ]
          .map(normalize)
          .join(" ");

        const hitArtistFields = hay.includes(q);

        let hitNews = false;
        const newsArr = newsByArtist.get(a.id) ?? [];
        for (const n of newsArr) {
          const nx = normalize(n.title) + " " + normalize(n.url);
          if (nx.includes(q)) {
            hitNews = true;
            break;
          }
        }

        return hitArtistFields || hitNews;
      })
    : artists.slice(0, 4);

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-semibold mb-4">Artists</h1>

      <SearchBox />

      {qRaw ? (
        <p className="mb-4 text-sm text-gray-600">
          Showing results for <span className="font-medium">“{qRaw}”</span> —{" "}
          {filtered.length} artist{filtered.length === 1 ? "" : "s"}
        </p>
      ) : (
        <p className="mb-4 text-sm text-gray-600">
          Latest artists (4). Use the search to find by name, city, disciplines,
          or tags.
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {filtered.map((a: Artist) => (
          <Link
            key={a.id}
            href={routes.artistPublic(a.id)}
            className="rounded-2xl border overflow-hidden hover:shadow-md transition"
            prefetch={false}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={a.avatar_url || "/file.svg"}
              alt={a.name ?? "Artist"}
              className="h-44 w-full object-cover"
              loading="lazy"
            />
            <div className="px-3 py-2">
              <div className="font-medium truncate">
                {a.name ?? "Unnamed Artist"}
              </div>
              {a.city ? (
                <div className="text-sm text-gray-500">{a.city}</div>
              ) : null}
              {(a.disciplines && a.disciplines.length > 0) ||
              (a.tags && a.tags.length > 0) ? (
                <div className="mt-1 flex flex-wrap gap-2">
                  {(a.disciplines ?? []).slice(0, 3).map((d) => (
                    <span
                      key={`d-${d}`}
                      className="text-xs rounded-full border px-2 py-0.5"
                    >
                      {d}
                    </span>
                  ))}
                  {(a.tags ?? []).slice(0, 3).map((t) => (
                    <span
                      key={`t-${t}`}
                      className="text-xs rounded-full border px-2 py-0.5"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>
          </Link>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="mt-8 text-gray-600">No artists match your search.</p>
      )}
    </main>
  );
}
