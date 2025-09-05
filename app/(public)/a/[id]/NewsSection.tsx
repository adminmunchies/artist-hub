// app/(public)/a/[id]/NewsSection.tsx
import { getSupabaseServer } from "@/lib/supabaseServer";

export default async function NewsSection({ artistId }: { artistId: string }) {
  const supa = await getSupabaseServer();
  const { data } = await supa
    .from("artist_news")
    .select("id,title,url,image_url,created_at")
    .eq("artist_id", artistId)
    .eq("published", true)
    .order("created_at", { ascending: false })
    .limit(12);

  const items =
    (data ?? []).map((n) => ({
      id: n.id,
      title: n.title || "Artist news",
      url: n.url || `/news/${n.id}`,
      image: n.image_url || null,
    })) ?? [];

  if (items.length === 0) return null;

  return (
    <section className="mt-10">
      <h2 className="text-2xl font-semibold mb-4">Artist News</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {items.map((it) => (
          <article
            key={it.id}
            className="rounded-2xl border overflow-hidden hover:shadow-md transition"
          >
            <a href={it.url} target="_blank" rel="noreferrer" className="block">
              {it.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={it.image}
                  alt={it.title}
                  className="h-40 w-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="h-40 w-full flex items-center justify-center text-sm text-gray-500">
                  No image
                </div>
              )}
              <div className="px-3 py-2">
                <div className="font-medium line-clamp-2">{it.title}</div>
              </div>
            </a>
          </article>
        ))}
      </div>
    </section>
  );
}

