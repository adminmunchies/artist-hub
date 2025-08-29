// app/dashboard/works/[id]/edit/page.tsx
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import EditFormClient from "./EditFormClient";

export type EditState = { ok?: boolean; error?: string };

type Params = { params: Promise<{ id: string }> };

export default async function EditWorkPage({ params }: Params) {
  const { id } = await params;

  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(newCookies) {
          try {
            newCookies.forEach(({ name, value, options }: any) =>
              cookieStore.set({ name, value, ...options })
            );
          } catch {}
        },
      },
    }
  );

  // Work + Artist laden
  const { data: work, error } = await supabase
    .from("works")
    .select("id,title,description,image_url,published,artist_id")
    .eq("id", id)
    .maybeSingle();

  if (error || !work) {
    redirect("/dashboard/works");
  }

  // ---------- SERVER ACTIONS ----------
  async function saveAction(_prev: EditState | undefined, formData: FormData): Promise<EditState | void> {
    "use server";
    const title = (formData.get("title") || "").toString().trim();
    const description = (formData.get("description") || "").toString().trim();
    const published = formData.get("published") ? true : false;

    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(newCookies) {
            try {
              newCookies.forEach(({ name, value, options }: any) =>
                cookieStore.set({ name, value, ...options })
              );
            } catch {}
          },
        },
      }
    );

    const { error } = await supabase
      .from("works")
      .update({ title: title || null, description: description || null, published })
      .eq("id", work.id);

    if (error) return { error: error.message };

    // Nach Save: zum öffentlichen Profil des Künstlers
    redirect(`/a/${work.artist_id}`);
  }

  async function deleteAction(_prev: EditState | undefined, formData: FormData): Promise<EditState | void> {
    "use server";
    const wid = (formData.get("id") || "").toString();

    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(newCookies) {
            try {
              newCookies.forEach(({ name, value, options }: any) =>
                cookieStore.set({ name, value, ...options })
              );
            } catch {}
          },
        },
      }
    );

    const { error } = await supabase.from("works").delete().eq("id", wid);
    if (error) return { error: error.message };

    // Nach Delete: zurück zur Works-Übersicht
    redirect("/dashboard/works");
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <a href="/dashboard/works" className="inline-block mb-4 text-sm underline">
        ← Back to Works
      </a>
      <h1 className="text-2xl font-semibold mb-6">Edit Work</h1>

      <EditFormClient
        work={work}
        saveAction={saveAction}
        deleteAction={deleteAction}
      />
    </div>
  );
}
