// app/works/[id]/image/page.tsx
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import ReplaceImageForm from "./ReplaceImageForm";

type Params = { params: Promise<{ id: string }> };

export default async function ReplaceImagePage({ params }: Params) {
  const { id } = await params; // Next 15: params ist ein Promise
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cs) { try { cs.forEach(({ name, value, options }: any) => cookieStore.set({ name, value, ...options })); } catch {} }
      }
    }
  );

  const { data: work, error } = await supabase
    .from("works")
    .select("id, artist_id, title")
    .eq("id", id)
    .maybeSingle();

  if (error || !work) {
    return <div className="max-w-3xl mx-auto px-6 py-10">Work not found.</div>;
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-semibold mb-6">Replace image</h1>
      <ReplaceImageForm workId={work.id} artistId={work.artist_id} />
    </div>
  );
}
