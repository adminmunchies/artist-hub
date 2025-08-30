// app/dashboard/(user)/news/page.tsx
import { getSupabaseServer } from "@/lib/supabaseServer";
import { scrapeOG } from "@/lib/og";
import { revalidatePath } from "next/cache";
import TagLink from "@/components/TagLink";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type NewsRow = {
  id: string;
  url: string;
  title: string | null;
  image_url: string | null;
  created_at: string | null;
  tags: string[] | null;
};

function parseTags(input: string): string[] {
  return input
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 8); // Limit, damit UI sauber bleibt
}

async function getCurrentArtistId() {
  const supabase = await getSupabaseServer();
  const { data: au } = await supabase.auth.getUser();
  const uid = au?.user?.id;
  if (!uid) return null;

  // ggf. an deine Verknüpfung anpassen
  const { data: a } = await supabase
    .from("artists")
    .select("id")
    .eq("user_id", uid)
    .maybeSingle();

  return a?.id ?? null;
}

async function fetchMyNews(artistId: string) {
  const supabase = await getSupabaseServer();
  const { data } = await supabase
    .from("artist_news")
    .select("id,url,title,image_url,created_at,tags")
    .eq("artist_id", artistId)
    .order("created_at", { ascending: false })
    .limit(50);
  return (data ?? []) as NewsRow[];
}

export default async function Page() {
  const artistId = await getCurrentArtistId();
  if (!artistId) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-8">
        <h1 className="text-2xl font-semibold mb-4">News</h1>
        <p>Kein verknüpfter Artist gefunden.</p>
      </main>
    );
  }

  const rows = await fetchMyNews(artistId);

  // 👇 WICHTIG: In Next 15 erhält die Action genau EIN Argument (FormData)
  async function addNews(formData: FormData) {
    "use server";
    const supabase = await getSupabaseServer();

    const url = String(formData.get("url") ?? "").trim();
    const tagsCsv = String(formData.get("tags") ?? "");
    const tags = parseTags(tagsCsv);

    if (!url) return;

    // 1) OG scrapen (nicht blockierend, robust gegen Fehler)
    let title: string | null = null;
    let image_url: string | null = null;
    try {
      const og = await scrapeOG(url);
      title = og.title ?? null;
      image_url = og.image ?? null;
    } catch {
      // Scrape-Fehler ignorieren
    }

    // 2) Speichern
    await supabase
      .from("artist_news")
      .insert({
        artist_id: artistId,
        url,
        title,
        image_url,
        tags, // text[]
        published: true,
      });

    // 3) Seiten neu validieren (öffentlich & Dashboard)
    revalidatePath(`/a/${artistId}`);
    revalidatePath(`/`); // Home
    revalidatePath(`/dashboard/news`);
  }

  // 👇 ebenfalls EIN Argument
  async function deleteNews(formData: FormData) {
    "use server";
    const id = String(formData.get("id") ?? "");
    if (!id) return;
    const supabase = await getSupabaseServer();
    await supabase.from("artist_news").delete().eq("id", id);
    revalidatePath(`/a/${artistId}`);
    revalidatePath(`/dashboard/news`);
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">News</h1>
        <div className="flex gap-2">
          <a href={`/a/${artistId}`} className="border rounded-full px-4 py-2">
            My public page
          </a>
          <a href="/dashboard/works" className="border rounded-full px-4 py-2">
            Back to Works
          </a>
        </div>
      </div>

      {/* Eingabe */}
      <form action={addNews} className="rounded-2xl border p-4 space-y-3">
        <label className="block text-sm font-medium">URL *</label>
        <input
          name="url"
          required
          placeholder="https://example.com/exhibition/..."
          className="w-full border rounded-md px-3 py-2"
        />

        <label className="block text-sm font-medium">
          Tags (comma-separated)
        </label>
        <input
          name="tags"
          placeholder="vienna, parallel, art fair"
          className="w-full border rounded-md px-3 py-2"
        />
        <p className="text-xs text-gray-500">
          Max. 8 Tags. Werden auf der öffentlichen Artist-Seite angezeigt und
          in der Suche gefunden.
        </p>

        <button className="border rounded-full px-4 py-2">Add</button>
      </form>

      {/* Liste */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {rows.map((n) => (
          <article
            key={n.id}
            className="rounded-2xl border overflow-hidden flex flex-col"
          >
            <a href={n.url} target="_blank" rel="noreferrer">
              {n.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={n.image_url}
                  alt={n.title ?? "News"}
                  className="h-56 w-full object-cover"
                />
              ) : (
                <div className="h-56 w-full flex items-center justify-center text-gray-400">
                  No image
                </div>
              )}
            </a>

            <div className="p-3 flex-1">
              <a
                href={n.url}
                target="_blank"
                rel="noreferrer"
                className="font-medium line-clamp-2"
              >
                {n.title ?? n.url}
              </a>

              {Array.isArray(n.tags) && n.tags.length > 0 ? (
                <div className="mt-2 flex flex-wrap gap-2">
                  {n.tags.slice(0, 8).map((t) => (
                    <TagLink key={t} tag={t} />
                  ))}
                </div>
              ) : null}
            </div>

            <form action={deleteNews} className="px-3 pb-3">
              <input type="hidden" name="id" value={n.id} />
              <button className="text-sm text-red-600">Delete</button>
            </form>
          </article>
        ))}
      </section>
    </main>
  );
}
