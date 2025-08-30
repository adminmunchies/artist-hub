import Link from "next/link";
import { getSupabaseServer } from "@/lib/supabaseServer";

type Item = {
  source: "artist" | "work";
  id: string;
  title: string | null;
  subtitle: string | null;
  image_url: string | null;
  href: string;
  tags: string[] | null;
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const params = await searchParams;           // <-- wichtig in Next 15
  const q = (params.q ?? "").trim();
  let results: Item[] = [];

  if (q) {
    const supabase = await getSupabaseServer();
    const { data, error } = await supabase.rpc("search_unified", { q });
    if (!error) results = (data ?? []) as Item[];
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-3xl font-semibold mb-2">Search</h1>
      <p className="text-sm text-gray-500 mb-6">
        {q ? <>Query: <span className="font-medium">{q}</span> • {results.length} results</> : "Add ?q=vienna to the URL to search."}
      </p>

      {!q && <div className="text-gray-500">Try <code>/search?q=vienna</code> or click any tag.</div>}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {results.map((item) => (
          <article key={`${item.source}-${item.id}`} className="rounded-2xl border p-3 flex flex-col">
            {item.image_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={item.image_url} alt={item.title ?? ""} className="rounded-xl w-full h-44 object-cover mb-3" />
            )}
            <div className="text-xs uppercase tracking-wide text-gray-500 mb-1">{item.source}</div>
            <Link href={item.href} className="text-lg font-medium">{item.title}</Link>
            {item.subtitle && <div className="text-sm text-gray-600 line-clamp-2 mt-1">{item.subtitle}</div>}

            <div className="mt-3 flex flex-wrap gap-2">
              {(item.tags || []).slice(0, 8).map((t) => (
                <Link key={t} href={`/search?q=${encodeURIComponent(t)}`} className="text-xs border rounded-full px-2 py-1 hover:bg-gray-50">
                  {t}
                </Link>
              ))}
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}
