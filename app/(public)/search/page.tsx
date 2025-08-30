// app/(public)/search/page.tsx
import Link from "next/link";
import { getSupabaseServer } from "@/lib/supabaseServer";
import SearchBox from "../artists/SearchBox";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type Row = {
  source: "artist" | "work" | "news" | "link";
  id: string;
  title: string | null;
  subtitle: string | null;
  image_url: string | null;
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const sp = await searchParams;
  const qRaw = (sp?.q ?? "").toString();
  const q = qRaw.trim();

  const supabase = await getSupabaseServer();
  let rows: Row[] = [];
  if (q.length > 0) {
    const { data } = await supabase.rpc("search_unified", { q });
    rows = (data ?? []) as Row[];
  }

  const hrefFor = (r: Row) => {
    switch (r.source) {
      case "artist":
        return `/a/${r.id}`;
      case "work":
        return `/w/${r.id}`;
      case "news":
        // Artist-News -> /an/[id]  (wichtig!)
        return `/an/${r.id}`;
      case "link":
      default:
        // Admin „Editor’s Picks“ Detailseite
        return `/news/${r.id}`;
    }
  };

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-3xl font-semibold mb-4">Search</h1>

      <div className="mb-6">
        <SearchBox />
      </div>

      <p className="text-sm text-gray-500 mb-6">
        Query: <span className="font-medium">{qRaw || "—"}</span> • {rows.length} result
        {rows.length === 1 ? "" : "s"}
      </p>

      {rows.length === 0 ? (
        <p className="text-gray-600">No results.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {rows.map((r) => {
            const href = hrefFor(r);
            return (
              <Link
                key={`${r.source}-${r.id}`}
                href={href}
                className="block rounded-2xl border overflow-hidden hover:shadow-sm transition"
                prefetch={false}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {r.image_url ? (
                  <img
                    src={r.image_url}
                    alt={r.title ?? "Result"}
                    className="h-56 w-full object-cover"
                  />
                ) : (
                  <div className="h-56 w-full flex items-center justify-center text-sm text-gray-500">
                    No image
                  </div>
                )}
                <div className="p-3">
                  <div className="text-[11px] uppercase tracking-wide text-gray-500 mb-1">
                    {r.source}
                  </div>
                  <div className="font-medium line-clamp-2">{r.title ?? "Untitled"}</div>
                  {r.subtitle ? (
                    <div className="text-sm text-gray-600 line-clamp-2 mt-1">
                      {r.subtitle}
                    </div>
                  ) : null}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </main>
  );
}
