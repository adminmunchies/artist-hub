// app/(public)/artists/page.tsx
import Link from "next/link";
import { getSupabaseServer } from "@/lib/supabaseServer";
import { routes } from "@/lib/routes";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type Artist = {
  id: string;
  name: string;
  city?: string | null;
  avatar_url?: string | null;
  disciplines?: string[] | string | null;
  tags?: string[] | string | null;
  created_at?: string | null;
};

type AdminLink = {
  id: string;
  title: string | null;
  url: string;
  image_url: string | null;
  excerpt: string | null;
  tags: string[] | null;
  created_at: string | null;
  published: boolean | null;
  featured: boolean | null;
};

type ArtistNews = {
  id: string;
  url: string;
  title: string | null;
  image_url: string | null;
  created_at: string | null;
  artist_id: string | null;
};

function fold(input: string) {
  return input
    .toLowerCase()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .normalize("NFD")
    // @ts-ignore unicode property escapes
    .replace(/\p{Diacritic}/gu, "");
}

export default async function ArtistsPage({
  searchParams,
}: {
  // In Next 15 ist searchParams ein Promise → await!
  searchParams: Promise<{ q?: string }>;
}) {
  const sp = await searchParams;
  const q = (sp?.q ?? "").trim();
  const needle = fold(q);

  const supabase = await getSupabaseServer();

  // --- Artists (immer laden, lokal filtern) ---
  const { data: rawArtists } = await supabase
    .from("artists")
    .select("id,name,city,avatar_url,disciplines,tags,created_at")
    .order("created_at", { ascending: false })
    .limit(200);

  const artists = (rawArtists ?? []) as Artist[];
  const artistMatches =
    needle.length === 0
      ? artists.slice(0, 24) // Platzhalter: neueste 24
      : artists.filter((a) => {
          const hay = fold(
            [
              a.name,
              a.city ?? "",
              Array.isArray(a.disciplines)
                ? a.disciplines.join(" ")
                : a.disciplines ?? "",
              Array.isArray(a.tags) ? a.tags.join(" ") : a.tags ?? "",
            ].join(" ")
          );
          return hay.includes(needle);
        });

  // Für die Zusatzsektionen nur laden, wenn wirklich gesucht wird
  let linkMatches: AdminLink[] = [];
  let newsMatches: ArtistNews[] = [];
  let nameMap = new Map<string, string>();

  if (needle.length > 0) {
    const [{ data: rawLinks }, { data: rawNews }] = await Promise.all([
      supabase
        .from("admin_links")
        .select("id,title,url,image_url,excerpt,tags,created_at,published,featured")
        .eq("published", true)
        .order("created_at", { ascending: false })
        .limit(120),
      supabase
        .from("artist_news")
        .select("id,url,title,image_url,created_at,artist_id,published")
        .eq("published", true)
        .order("created_at", { ascending: false })
        .limit(120),
    ]);

    const links = (rawLinks ?? []) as AdminLink[];
    linkMatches = links.filter((l) => {
      const hay = fold(
        [
          l.title ?? "",
          l.excerpt ?? "",
          Array.isArray(l.tags) ? l.tags.join(" ") : "",
        ].join(" ")
      );
      return hay.includes(needle);
    });

    const news = (rawNews ?? []) as ArtistNews[];
    // Optional: Artist-Namen zuordnen (für Anzeige)
    const ids = Array.from(
      new Set(news.map((n) => n.artist_id).filter(Boolean) as string[])
    );
    if (ids.length) {
      const { data: nameRows } = await supabase
        .from("artists")
        .select("id,name")
        .in("id", ids);
      (nameRows ?? []).forEach((r: any) => nameMap.set(r.id, r.name));
    }
    newsMatches = news.filter((n) => {
      const hay = fold([n.title ?? "", nameMap.get(n.artist_id ?? "") ?? ""].join(" "));
      return hay.includes(needle);
    });
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-semibold mb-4">Artists</h1>

      <form action="/artists" className="mb-8">
        <input
          type="text"
          name="q"
          defaultValue={q}
          placeholder="Search name, location, discipline, tag…"
          className="w-full rounded-xl border px-4 py-3"
        />
      </form>

      {/* Artists Grid */}
      {artistMatches.length === 0 ? (
        <p className="text-gray-600">No matching artists found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-10">
          {artistMatches.map((a) => (
            <Link
              key={a.id}
              href={routes.artistPublic(a.id)}
              prefetch={false}
              className="rounded-2xl border overflow-hidden hover:shadow-md transition"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={a.avatar_url || "/file.svg"}
                alt={a.name}
                className="h-44 w-full object-cover"
                loading="lazy"
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
      )}

      {/* Zusatz: Treffer in Editor’s Picks */}
      {needle && linkMatches.length > 0 && (
        <>
          <h2 className="text-xl font-semibold mb-4">Editor’s Picks</h2>
          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 mb-10">
            {linkMatches.slice(0, 12).map((l) => (
              <div key={l.id} className="rounded-2xl border overflow-hidden hover:shadow transition">
                <a href={l.url} target="_blank" rel="noreferrer" className="block">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {l.image_url ? (
                    <img src={l.image_url} alt={l.title || "link"} className="h-44 w-full object-cover" />
                  ) : (
                    <div className="h-44 w-full bg-gray-100" />
                  )}
                  <div className="px-3 py-2">
                    <div className="font-medium">{l.title || l.url}</div>
                    {l.excerpt ? (
                      <p className="text-sm text-gray-600 line-clamp-2 mt-1">{l.excerpt}</p>
                    ) : null}
                  </div>
                </a>
                {Array.isArray(l.tags) && l.tags.length > 0 ? (
                  <div className="px-3 pb-3 flex flex-wrap gap-2">
                    {l.tags.slice(0, 5).map((t) => (
                      <Link
                        key={t}
                        href={`/artists?q=${encodeURIComponent(t)}`}
                        className="rounded-full border px-2 py-0.5 text-xs hover:bg-gray-50"
                        prefetch={false}
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

      {/* Zusatz: Treffer in Artist News */}
      {needle && newsMatches.length > 0 && (
        <>
          <h2 className="text-xl font-semibold mb-4">Artist News</h2>
          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
            {newsMatches.slice(0, 12).map((n) => (
              <a
                key={n.id}
                href={n.url}
                target="_blank"
                rel="noreferrer"
                className="block rounded-2xl border overflow-hidden hover:shadow-md transition"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {n.image_url ? (
                  <img src={n.image_url} alt={n.title ?? "News"} className="h-44 w-full object-cover" />
                ) : (
                  <div className="h-44 w-full bg-gray-100" />
                )}
                <div className="px-3 py-2">
                  <div className="font-medium">{n.title ?? new URL(n.url).hostname}</div>
                  {n.artist_id ? (
                    <div className="text-sm text-gray-500 mt-1">
                      {nameMap.get(n.artist_id) ?? "Artist"}
                    </div>
                  ) : null}
                </div>
              </a>
            ))}
          </div>
        </>
      )}
    </main>
  );
}
