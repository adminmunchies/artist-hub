// app/(public)/a/[id]/NewsSection.tsx
import { getSupabaseServer } from "@/lib/supabaseServer";
import TagLink from "@/components/TagLink";

type News = {
  id: string;
  url: string;
  title: string | null;
  image_url: string | null;
  tags: string[] | null;
  created_at: string | null;
};

export default async function NewsSection({ artistId }: { artistId: string }) {
  const supabase = await getSupabaseServer();
  const { data } = await supabase
    .from("artist_news")
    .select("id,url,title,image_url,tags,created_at")
    .eq("artist_id", artistId)
    .eq("published", true)
    .order("created_at", { ascending: false })
    .limit(12);

  const items = (data ?? []) as News[];

  if (items.length === 0) return null;

  return (
    <section className="mt-10">
      <h2 className="text-2xl font-semibold mb-4">News</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {items.map((it) => (
          <a
            key={it.id}
            href={it.url}
            target="_blank"
            rel="noreferrer"
            className="block rounded-2xl border overflow-hidden hover:shadow-md transition"
          >
            {it.image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={it.image_url}
                alt={it.title ?? "News"}
                className="h-48 w-full object-cover"
              />
            ) : (
              <div className="h-48 w-full flex items-center justify-center text-sm text-gray-500">
                No image
              </div>
            )}

            <div className="px-3 py-2">
              <div className="font-medium line-clamp-2">
                {it.title ?? it.url}
              </div>

              {Array.isArray(it.tags) && it.tags.length > 0 ? (
                <div className="mt-2 flex flex-wrap gap-2">
                  {it.tags.slice(0, 8).map((t) => (
                    <TagLink key={t} tag={t} />
                  ))}
                </div>
              ) : null}
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}

