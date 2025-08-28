import EditFormClient from "./EditFormClient";
import { getSupabaseServer } from "@/lib/supabaseServer";

type Params = { params: Promise<{ id: string }> };

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function EditWorkPage({ params }: Params) {
  const { id } = await params;

  const supabase = await getSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="text-2xl font-semibold mb-6">Edit Work</h1>
        <p className="text-red-600">Not authenticated.</p>
      </main>
    );
  }

  const { data: work, error } = await supabase
    .from("works")
    .select("id,artist_id,title,image_url,thumbnail_url,published")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="text-2xl font-semibold mb-6">Edit Work</h1>
        <p className="text-red-600">Error loading work.</p>
      </main>
    );
  }

  if (!work) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="text-2xl font-semibold mb-6">Edit Work</h1>
        <p className="text-red-600">Work not found.</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 space-y-6">
      <h1 className="text-2xl font-semibold">Edit Work</h1>

      {work.image_url ? (
        <div className="rounded-2xl border overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={work.thumbnail_url ?? work.image_url}
            alt={work.title ?? "Work image"}
            className="w-full object-cover"
          />
        </div>
      ) : null}

      <EditFormClient work={work as any} />
    </main>
  );
}
