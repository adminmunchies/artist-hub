// app/dashboard/works/news/page.tsx
import Link from "next/link";
import { getSupabaseServer } from "@/lib/supabaseServer";
import { routes } from "@/lib/routes";
import { addNewsAction, deleteNewsAction } from "./actions";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type NewsRow = {
  id: string;
  url: string;
  title: string | null;
  image_url: string | null;
  created_at: string;
};

export default async function NewsPage() {
  const supabase = await getSupabaseServer();

  // Auth
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="text-2xl font-semibold mb-6">News</h1>
        <p className="text-red-600">Not authenticated.</p>
      </main>
    );
  }

  // eigenen Artist finden
  const { data: artist } = await supabase
    .from("artists")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  // News dieses Artists laden
  let news: NewsRow[] = [];
  if (artist?.id) {
    const { data } = await supabase
      .from("artist_news") // <- wichtig: richtige Tabelle
      .select("id,url,title,image_url,created_at")
      .eq("artist_id", artist.id)
      .order("created_at", { ascending: false });
    news = (data ?? []) as NewsRow[];
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">News</h1>
        <Link
          href={routes.dashboardWorks()}
          className="rounded-full border px-4 py-2"
        >
          Back to Works
        </Link>
      </div>

      {/* Link hinzufügen */}
      <form
        action={addNewsAction}
        className="rounded-2xl border p-4 flex items-center gap-3"
      >
        <input
          name="url"
          type="url"
          required
          placeholder="https://example.com/exhibition/…"
          className="flex-1 rounded-lg border px-3 py-2"
        />
        <button className="rounded-full border px-4 py-2">Add</button>
      </form>

      {/* Grid */}
      {news.length === 0 ? (
        <p>No news yet.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {news.map((n) => (
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

              <div className="p-3 flex items-start justify-between gap-3">
                <a
                  href={n.url}
                  target="_blank"
                  rel="noreferrer"
                  className="font-medium hover:underline truncate"
                  title={n.title ?? n.url}
                >
                  {n.title ?? n.url}
                </a>

                <form action={deleteNewsAction}>
                  <input type="hidden" name="id" value={n.id} />
                  <button className="text-sm text-red-600">Delete</button>
                </form>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
