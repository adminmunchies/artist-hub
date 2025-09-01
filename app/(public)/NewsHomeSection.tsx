// app/(public)/NewsHomeSection.tsx
import { getSupabaseServer } from "@/lib/supabaseServer";
import TagLink from "@/components/TagLink";

type ArtistNewsRow = {
  id: string;
  url: string;
  title: string | null;
  image_url: string | null;
  created_at: string | null;
  artist_id: string;
  tags: string[] | null;
  artist?: { id: string; name: string | null; avatar_url: string | null } | null;
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function NewsHomeSection() {
  const supabase = await getSupabaseServer();
  const { data: artistRaw } = await supabase
    .from("artist_news")
    .select(
      "id,url,title,image_url,created_at,tags,artist_id,artist:artist_id(id,name,avatar_url)"
    )
    .eq("published", true)
    .order("created_at", { ascending: false })
    .limit(12);

  const items = (artistRaw ?? []).map((n: ArtistNewsRow) => ({
    id: n.id,
    url: n.url,
    title: n.title ?? n.url,
    image: n.image_url ?? null,
    subtitle: n.artist?.name ?? null,
    tags: Array.isArray(n.tags)
      ? n.tags.map((t, i) => String(t).trim()).filter(Boolean)
      : [],
  }));

  if (items.length === 0) return null;

  return (
    <section className="mt-12" data-nhs="v2">
      <h2 className="text-2xl font-semibold mb-4">Artist News</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {items.map((it) => (
          <article
            key={it.id}
            className="rounded-2xl border overflow-hidden hover:shadow-md transition"
          >
            {/* Nur Bild+Titel verlinken */}
            <a href={it.url} target="_blank" rel="noreferrer" className="block">
              {it.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={it.image}
                  alt={it.title ?? "News"}
                  className="h-48 w-full object-cover"
                  loading="lazy"
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

            {/* Tags außerhalb des Links */}
            {it.tags.length > 0 ? (
              <div className="px-3 pb-3 flex flex-wrap gap-2">
                {it.tags.slice(0, 8).map((t, i) => (
                  <TagLink key={`${it.id}-${t}`} tag={t} />
                ))}
              </div>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  );
}
