"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSupabaseServer } from "@/lib/supabaseServer";

function toNull(v: FormDataEntryValue | null): string | null {
  const s = typeof v === "string" ? v.trim() : "";
  return s.length ? s : null;
}

async function assertOwnership(supabase: any, workId: string, userId: string) {
  const { data: work, error: wErr } = await supabase
    .from("works")
    .select("artist_id")
    .eq("id", workId)
    .maybeSingle();
  if (wErr) throw wErr;
  if (!work) throw new Error("Work not found");

  const { data: artist, error: aErr } = await supabase
    .from("artists")
    .select("id,user_id")
    .eq("id", work.artist_id)
    .maybeSingle();
  if (aErr) throw aErr;
  if (!artist || artist.user_id !== userId) throw new Error("Not allowed");

  return artist.id as string;
}

export async function updateWorkAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const title = toNull(formData.get("title"));
  const publishedRaw = formData.get("published");
  const published =
    publishedRaw === "on" || publishedRaw === "true" || publishedRaw === "1";

  const supabase = await getSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  await assertOwnership(supabase, id, user.id);

  const updates: Record<string, any> = { title, published };

  const { error } = await supabase.from("works").update(updates).eq("id", id);
  if (error) throw error;

  revalidatePath("/dashboard/works");
  revalidatePath(`/dashboard/works/${id}/edit`);
  redirect("/dashboard/works");
}

export async function deleteWorkAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");

  const supabase = await getSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  await assertOwnership(supabase, id, user.id);

  const { error } = await supabase.from("works").delete().eq("id", id);
  if (error) throw error;

  revalidatePath("/dashboard/works");
  redirect("/dashboard/works");
}
