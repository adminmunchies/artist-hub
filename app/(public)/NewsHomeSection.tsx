// app/(public)/AdminLinksHomeSection.tsx
import Link from "next/link";
import { getSupabaseServer } from "@/lib/supabaseServer";
import TagLink from "@/components/TagLink";

type Row = {
  id: string;
  title: string | null;
  url: string;
  image_url: string | null;
  excerpt: string | null;
  tags: string[] | null;
  created_at: string;
  featured: boolean | null;
  published: boolean | null;
};

export const revalidate = 0;

export default async function AdminLinksHomeSection() {
  const supabase = await getSupabaseServer();
  const { data, error } = await supabase
    .from("links")                       // <-- dein Table-Name; falls anders, sag mir den exakten Namen
    .select("*")
    .or("published.is.null,published.eq.true")
    .order("featured", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(6);

  if (error) {
    console.error("links fetch error:", error.message);
  }
  const rows: Row[] = (data ?? []) as any;
  if (!rows.length) return null;

  return (
    <section className="mx-auto max-w-6xl px-4">
      <h2 className="text-2xl font-semibold mb-4">Editor&apos;s Picks</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {rows.map((l) => (
          <article key={l.id} className="rounded-2xl border overflow-hidden flex flex-col">
            {l.image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={l.image_url} alt={l.title ?? ""} className="w-full h-48 object-cover" />
            ) : null}
            <div className="p-3 flex-1 flex flex-col">
              <Link href={l.url} target="_blank" rel="noopener noreferrer" className="text-base font-medium">
                {l.title ?? l.url}
              </Link>
              {l.excerpt ? (
                <p className="text-sm text-gray-600 line-clamp-2 mt-1">{l.excerpt}</p>
              ) : null}

              <div className="mt-3 flex flex-wrap gap-2">
                {Array.isArray(l.tags) && l.tags.length > 0
                  ? l.tags.slice(0, 5).map((t) => <TagLink key={t} tag={t} />)
                  : null}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
