// app/(public)/search/page.tsx
import Link from "next/link";
import { getSupabaseServer } from "@/lib/supabaseServer";
import TagLink from "@/components/TagLink";
import SearchBox from "../artists/SearchBox";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type Item = {
  source: "artist" | "work" | "news" | "link";
  id: string;
  title: string | null;
  subtitle: string | null;
  image_url: string | null;
  url: string;
};

const norm = (s: unknown) =>
  String(s ?? "")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const sp = await searchParams; // Next15: Promise
  const qRaw = (sp?.q ?? "").trim();
  const q = norm(qRaw);

  const supabase = await getSupabaseServer();

  let items: Item[] = [];
  try {
    const { data, error } = await supabase.rpc("search_unified", { q });
    if (error) {
      console.error("search_unified error:", error.message);
    }
    items = (data ?? []) as Item[];
  } catch (e) {
    console.error("RPC call failed:", e);
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-3xl font-semibold mb-4">Search</h1>

      <div className="mb-6">
        <SearchBox />
      </div>

      <p className="text-sm text-gray-500 mb-6">
        Query: <span className="font-medium">{qRaw || "—"}</span> • {items.length} result
        {items.length === 1 ? "" : "s"}
      </p>

      {items.length === 0 ? (
        <p className="text-gray-600">No results.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {items.map((it) => {
            const CardInner = (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {it.image_url ? (
                  <img
                    src={it.image_url}
                    alt={it.title ?? ""}
                    className="h-56 w-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="h-56 w-full bg-gray-100 flex items-center justify-center text-gray-400">
                    No image
                  </div>
                )}
                <div className="p-3">
                  <div className="text-[11px] tracking-wide text-gray-500 mb-1">
                    {it.source.toUpperCase()}
                  </div>
                  <div className="font-medium line-clamp-2">
                    {it.title ?? it.url}
                  </div>
                  {it.subtitle ? (
                    <div className="text-sm text-gray-600 line-clamp-1 mt-1">
                      {it.subtitle}
                    </div>
                  ) : null}
                </div>
              </>
            );

            // interne Ziele (artist/work) → <Link>, externe (news/link) → <a>
            if (it.source === "artist") {
              return (
                <Link
                  key={`${it.source}-${it.id}`}
                  href={`/a/${it.id}`}
                  className="block rounded-2xl border overflow-hidden hover:shadow-sm transition"
                  prefetch={false}
                >
                  {CardInner}
                </Link>
              );
            }
            if (it.source === "work") {
              return (
                <Link
                  key={`${it.source}-${it.id}`}
                  href={`/w/${it.id}`}
                  className="block rounded-2xl border overflow-hidden hover:shadow-sm transition"
                  prefetch={false}
                >
                  {CardInner}
                </Link>
              );
            }
            // news / link: extern
            return (
              <a
                key={`${it.source}-${it.id}`}
                href={it.url}
                target="_blank"
                rel="noreferrer"
                className="block rounded-2xl border overflow-hidden hover:shadow-sm transition"
              >
                {CardInner}
              </a>
            );
          })}
        </div>
      )}
    </main>
  );
}
