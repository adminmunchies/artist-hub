// app/(public)/a/[id]/NewsSection.tsx
import TagLink from "@/components/TagLink";
import { getSupabaseServer } from "@/lib/supabaseServer";

type ArtistNews = {
  id: string;
  url: string;
  title: string | null;
  image_url: string | null;
  created_at: string | null;
  tags: string[] | null;
};

export const revalidate = 0;
export const dynamic = "force-dynamic";

export default async function NewsSection({ artistId }: { artistId: string }) {
  const supabase = await getSupabaseServer();

  const { data } = await supabase
    .from("artist_news")
    .select("id,url,title,image_url,created_at,tags")
    .eq("artist_id", artistId)
    .eq("published", true)
    .order("created_at", { ascending: false })
    .limit(24);

  const rows: ArtistNews[] = (data ?? []) as any;
  if (!rows.length) return null;

  return (
    <section className="mt-10">
      <h2 className="text-2xl font-semibold mb-4">News</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {rows.map((n) => (
          <article
            key={n.id}
            className="rounded-2xl border overflow-hidden hover:shadow-md transition"
          >
            {/* Link-Bereich: Bild */}
            {n.image_url ? (
              <a
                href={n.url}
                target="_blank"
                rel="noreferrer"
                className="block"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={n.image_url}
                  alt={n.title ?? "News"}
                  className="h-44 w-full object-cover"
                  loading="lazy"
                />
              </a>
            ) : (
              <div className="h-44 w-full bg-gray-100" />
            )}

            <div className="px-3 py-2">
              {/* Link-Bereich: Titel */}
              <a
                href={n.url}
                target="_blank"
                rel="noreferrer"
                className="font-medium line-clamp-2 block"
              >
                {n.title ?? n.url}
              </a>

              {/* Meta-Bereich: Tags außerhalb jeder Karten-<a> */}
              {Array.isArray(n.tags) && n.tags.length > 0 ? (
                <div className="mt-2 flex flex-wrap gap-2">
                  {n.tags.slice(0, 8).map((t) => (
                    <TagLink key={`${n.id}-${t}`} tag={t} />
                  ))}
                </div>
              ) : null}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

