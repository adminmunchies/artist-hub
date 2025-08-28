// app/(public)/artists/page.tsx
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
  disciplines?: string[] | null;
  tags?: string[] | null;
  // neue lc-Felder (kommen nach der Migration dazu)
  disciplines_lc?: string[] | null;
  tags_lc?: string[] | null;
};

type SiteArticle = {
  id: string;
  url: string;
  title: string | null;
  image_url: string | null;
  excerpt: string | null;
  created_at: string | null;
  tags?: string[] | null;
  tags_lc?: string[] | null;
};

export default async function ArtistsPage({
  searchParams,
}: {
  // In Next 15 sind searchParams ein Promise
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;

  // Rohwerte
  const qRaw    = (typeof params.q === "string"    ? params.q    : "").trim();
  const discRaw = (typeof params.disc === "string" ? params.disc : "").trim();
  const tagRaw  = (typeof params.tag === "string"  ? params.tag  : "").trim();

  // für case-insensitive Suche (Server macht lower-case Matching)
  const q    = qRaw;                  // für name/city via ILIKE
  const disc = discRaw.toLowerCase(); // für *_lc Arrays
  const tag  = tagRaw.toLowerCase();  // für *_lc Arrays

  const supabase = await getSupabaseServer();

  // ——— Artists laden ————————————————————————————————
  // Wenn keinerlei Filter aktiv → Defaultliste (neueste)
  // Sonst nur Treffer rendern (kein "vorgefülltes" Grid).
  let artists: Artist[] = [];

  const wantDefault = !q && !disc && !tag;

  if (wantDefault) {
    const { data } = await supabase
      .from("artists")
      .select("id,name,city,avatar_url,disciplines,tags,disciplines_lc,tags_lc")
      .order("created_at", { ascending: false })
      .limit(24);
    artists = (data ?? []) as Artist[];
  } else {
    let query = supabase
      .from("artists")
      .select("id,name,city,avatar_url,disciplines,tags,disciplines_lc,tags_lc")
      .order("created_at", { ascending: false });

    if (q) {
      // name ODER city (case-insensitive)
      query = query.or(`name.ilike.%${q}%,city.ilike.%${q}%`);
    }

    // Disziplin-Filter (bevorzugt *_lc; fallback auf altes Feld)
    if (disc) {
      query = query
        .or(
          [
            // wenn es disciplines_lc gibt
            `disciplines_lc.cs.{${disc}}`,
            // fallback: exaktes Matching im alten Feld
            `disciplines.cs.{${disc}}`,
          ].join(",")
        );
    }

    // Tag-Filter (bevorzugt *_lc; fallback auf altes Feld)
    if (tag) {
      query = query.or(
        [
          `tags_lc.cs.{${tag}}`,
          `tags.cs.{${tag}}`,
        ].join(",")
      );
    }

    const { data } = await query;
    artists = (data ?? []) as Artist[];
  }

  // ——— Site-Artikel mit passendem Tag (nur wenn tag aktiv) ———
  let taggedNews: SiteArticle[] = [];
  if (tag) {
    const { data } = await supabase
      .from("site_articles")
      .select("id,url,title,image_url,excerpt,created_at,tags,tags_lc")
      .eq("published", true)
      // bevorzugt *_lc; fallback auf altes Feld
      .or([`tags_lc.cs.{${tag}}`, `tags.cs.{${tag}}`].join(","))
      .order("created_at", { ascending: false })
      .limit(12);

    taggedNews = (data ?? []) as SiteArticle[];
  }

  // kleines Tag-Badge
  const TagChip = ({ t }: { t: string }) => (
    <span className="rounded-full border px-2 py-0.5 text-xs">{t}</span>
  );

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 space-y-8">
      {/* Filterleiste */}
      <form method="get" className="flex flex-wrap items-center gap-3">
        <input
          name="q"
          defaultValue={qRaw}
          placeholder="Search by name or city..."
          className="rounded-full border px-4 py-2 flex-1 min-w-[260px]"
        />
        <input
          name="disc"
          defaultValue={discRaw}
          placeholder="Filter by discipline (e.g. painting)…"
          className="rounded-full border px-4 py-2 flex-1 min-w-[260px]"
        />
        <input
          name="tag"
          defaultValue={tagRaw}
          placeholder="Tag (e.g. Venice Biennale)…"
          className="rounded-full border px-4 py-2 flex-1 min-w-[260px]"
        />
        <button className="rounded-full border px-4 py-2">Search</button>
        <Link href="/artists" className="rounded-full border px-4 py-2">
          Reset
        </Link>
      </form>

      {/* Aktiver Tag-Hinweis */}
      {tagRaw ? (
        <div className="flex items-center gap-3 text-sm">
          <span className="text-gray-600">Tag:</span>
          <TagChip t={tagRaw} />
          <Link
            href={{ pathname: "/artists", query: { q: qRaw, disc: discRaw } }}
            className="underline"
          >
            remove
          </Link>
        </div>
      ) : null}

      {/* Artists */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">
          {wantDefault ? "Artists" : "Artists (results)"}
          <span className="text-gray-500 text-base ml-2">({artists.length})</span>
        </h2>

        {artists.length === 0 ? (
          <p className="text-gray-600">No artists found.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {artists.map((a) => (
              // Wichtig: Kein <a> in <Link> (Hydration-Warnung vermeiden)
              <Link
                key={a.id}
                href={routes.artistPublic(a.id)}
                prefetch={false}
                className="rounded-2xl border overflow-hidden hover:shadow-md transition block"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={a.avatar_url || "/file.svg"}
                  alt={a.name}
                  className="h-44 w-full object-cover"
                />
                <div className="px-3 py-2">
                  <div className="font-medium">{a.name}</div>
                  {a.city ? <div className="text-sm text-gray-500">{a.city}</div> : null}

                  {Array.isArray(a.disciplines) && a.disciplines.length > 0 ? (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {a.disciplines.slice(0, 5).map((d) => (
                        <span key={d} className="rounded-full border px-2 py-0.5 text-xs">
                          {d}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* News mit aktivem Tag */}
      {tagRaw ? (
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">
            News with tag “{tagRaw}”
            <span className="text-gray-500 text-base ml-2">
              ({taggedNews.length})
            </span>
          </h2>

          {taggedNews.length === 0 ? (
            <p className="text-gray-600">No site news for this tag.</p>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {taggedNews.map((n) => (
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
                      className="w-full aspect-[4/3] object-cover"
                    />
                  ) : null}
                  <div className="px-3 py-2">
                    <div className="font-medium line-clamp-2">
                      {n.title ?? new URL(n.url).hostname}
                    </div>
                    {n.excerpt ? (
                      <div className="text-sm text-gray-600 line-clamp-2 mt-1">
                        {n.excerpt}
                      </div>
                    ) : null}
                  </div>
                </a>
              ))}
            </div>
          )}
        </section>
      ) : null}
    </main>
  );
}
