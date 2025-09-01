// app/dashboard/(admin)/admin/page.tsx
import { getSupabaseServer } from "@/lib/supabaseServer";
import { isAdmin } from "@/lib/auth/isAdmin";
import { redirect } from "next/navigation";
import {
  createLink,
  removeLink,
  toggleFeatured,
  togglePublished,
  refetchMeta,
} from "./actions";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type AdminLink = {
  id: string;
  title: string | null;
  url: string;
  image_url: string | null;
  excerpt: string | null;
  tags: string[] | null;
  published: boolean | null;
  featured: boolean | null;
  created_at: string | null;
};

// ---- Neu: Tags deduplizieren + auf 5 begrenzen ----
function uniqueTags(arr: any[] | null | undefined) {
  if (!arr) return [];
  const m = new Map<string, string>();
  for (const v of arr) {
    const raw = String(v ?? "").trim();
    const k = raw.toLowerCase();
    if (!k) continue;
    if (!m.has(k)) m.set(k, raw);
  }
  return Array.from(m.values()).slice(0, 5);
}

export default async function AdminHome() {
  const supabase = await getSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");
  if (!isAdmin(user)) redirect("/dashboard/works");

  const { data: links } = await supabase
    .from("admin_links")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <section className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
        <p className="text-sm text-gray-600">Welcome, {user.email}</p>
      </div>

      {/* Jump cards */}
      <div className="grid gap-4 md:grid-cols-2">
        <a href="#links" className="rounded-xl border p-4">
          <h2 className="font-medium mb-1">Share Links to Main Site</h2>
          <p className="text-sm">Create & manage featured links with up to 5 tags.</p>
        </a>
        <a href="#artists" className="rounded-xl border p-4">
          <h2 className="font-medium mb-1">Artists & Submissions</h2>
          <p className="text-sm">Review, feature, or pin to homepage sections.</p>
        </a>
      </div>

      {/* LINKS */}
      <div id="links" className="space-y-6">
        <h2 className="text-xl font-semibold">Links</h2>

        {/* Create form */}
        <form action={createLink} className="grid gap-3 md:grid-cols-4 rounded-xl border p-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">URL *</label>
            <input
              name="url"
              required
              className="w-full rounded-lg border px-3 py-2"
              placeholder="https://…"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Title (optional)</label>
            <input name="title" className="w-full rounded-lg border px-3 py-2" placeholder="Short title" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Image URL (optional)</label>
            <input
              name="image_url"
              className="w-full rounded-lg border px-3 py-2"
              placeholder="https://…/image.jpg"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Excerpt (optional)</label>
            <input
              name="excerpt"
              className="w-full rounded-lg border px-3 py-2"
              placeholder="Short teaser text…"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Tags (max 5)</label>
            <input
              name="tags"
              className="w-full rounded-lg border px-3 py-2"
              placeholder="art, exhibit, vienna"
            />
          </div>
          <div className="md:col-span-2 flex items-center gap-4">
            <label className="inline-flex items-center gap-2 text-sm">
              <input type="checkbox" name="published" defaultChecked /> Published
            </label>
            <label className="inline-flex items-center gap-2 text-sm">
              <input type="checkbox" name="featured" /> Featured (Homepage)
            </label>
            <div className="ml-auto">
              <button className="rounded-lg border px-4 py-2 hover:bg-gray-50" type="submit">
                Add Link
              </button>
            </div>
          </div>
        </form>

        {/* List */}
        <div className="divide-y rounded-xl border">
          {(links ?? []).map((l: AdminLink) => {
            const tags = uniqueTags(l.tags ?? []);
            return (
              <div key={l.id} className="p-4 flex items-center gap-4 justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    {l.featured ? (
                      <span className="text-xs rounded-full px-2 py-0.5 border">FEATURED</span>
                    ) : null}
                    {!l.published ? (
                      <span className="text-xs rounded-full px-2 py-0.5 border">UNPUBLISHED</span>
                    ) : null}
                    <a
                      href={l.url}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="font-medium truncate hover:underline"
                    >
                      {l.title || l.url}
                    </a>
                  </div>
                  {l.excerpt ? (
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">{l.excerpt}</p>
                  ) : null}
                  <div className="mt-2 flex flex-wrap gap-2">
                    {tags.map((t, i) => (
                      <span key={`${String(t)}-${i}`} className="text-xs rounded-full border px-2 py-0.5">
                        {String(t)}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {/* Publish/Unpublish */}
                  <form action={togglePublished}>
                    <input type="hidden" name="id" value={l.id} />
                    <input type="hidden" name="published" value={(!l.published)?.toString()} />
                    <button className="rounded-lg border px-3 py-1.5 hover:bg-gray-50" type="submit">
                      {l.published ? "Unpublish" : "Publish"}
                    </button>
                  </form>

                  {/* Feature/Unfeature */}
                  <form action={toggleFeatured}>
                    <input type="hidden" name="id" value={l.id} />
                    <input type="hidden" name="featured" value={(!l.featured)?.toString()} />
                    <button className="rounded-lg border px-3 py-1.5 hover:bg-gray-50" type="submit">
                      {l.featured ? "Unfeature" : "Feature"}
                    </button>
                  </form>

                  {/* Fetch meta */}
                  <form action={refetchMeta}>
                    <input type="hidden" name="id" value={l.id} />
                    <input type="hidden" name="url" value={l.url} />
                    <button className="rounded-lg border px-3 py-1.5 hover:bg-gray-50" type="submit">
                      Fetch meta
                    </button>
                  </form>

                  {/* Delete */}
                  <form action={removeLink}>
                    <input type="hidden" name="id" value={l.id} />
                    <button className="rounded-lg border px-3 py-1.5 hover:bg-gray-50" type="submit">
                      Delete
                    </button>
                  </form>
                </div>
              </div>
            );
          })}

          {(links ?? []).length === 0 && (
            <div className="p-6 text-sm text-gray-500">No links yet. Add one above.</div>
          )}
        </div>
      </div>
    </section>
  );
}
