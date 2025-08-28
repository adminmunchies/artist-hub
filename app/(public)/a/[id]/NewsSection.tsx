import { getSupabaseServer } from "@/lib/supabaseServer";

export default async function NewsSection({ artistId }: { artistId: string }) {
  const supabase = await getSupabaseServer();
  const { data } = await supabase
    .from("news")
    .select("id,url,title,image_url,created_at")
    .eq("artist_id", artistId)
    .order("created_at", { ascending: false })
    .limit(3);

  const items = data ?? [];
  if (items.length === 0) return null;

  return (
    <section className="mt-10">
      <hr className="mb-6" />
      <h2 className="text-xl font-semibold mb-4">News</h2>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((n) => (
          <article key={n.id} className="rounded-2xl border overflow-hidden">
            {n.image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <a href={n.url} target="_blank" rel="noreferrer">
                <img
                  src={n.image_url}
                  alt={n.title ?? "News"}
                  className="w-full aspect-[4/3] object-cover"
                />
              </a>
            ) : null}
            <div className="p-3">
              <a
                href={n.url}
                target="_blank"
                rel="noreferrer"
                className="font-medium hover:underline"
              >
                {n.title ?? n.url}
              </a>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
