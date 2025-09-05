"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSupabaseServer } from "@/lib/supabaseServer";

function toNull(v: FormDataEntryValue | null): string | null {
  const s = typeof v === "string" ? v.trim() : "";
  return s.length ? s : null;
}

// Akzeptiert (formData) ODER (prev, formData)
function pickFormData(a: any, b?: any): FormData {
  if (a && typeof a.get === "function") return a as FormData;
  if (b && typeof b.get === "function") return b as FormData;
  throw new Error("FormData missing");
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

export async function updateWorkAction(a: any, b?: any) {
  const formData = pickFormData(a, b);

  const id = String(formData.get("id") ?? "");
  const title = toNull(formData.get("title"));
  const publishedRaw = formData.get("published");
  const published =
    publishedRaw === "on" || publishedRaw === "true" || publishedRaw === "1";
  const image_url = toNull(formData.get("image_url"));
  const thumbnail_url = toNull(formData.get("thumbnail_url"));

  const supabase = await getSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  await assertOwnership(supabase, id, user.id);

  const updates: Record<string, any> = {
    title,
    published,
    is_published: published, // legacy sync
  };

  // Bild-Felder setzen – Liste zeigt oft thumbnail zuerst
  if (image_url) updates.image_url = image_url;
  if (thumbnail_url) updates.thumbnail_url = thumbnail_url;
  if (image_url && !thumbnail_url) updates.thumbnail_url = image_url;

  const { error } = await supabase.from("works").update(updates).eq("id", id);
  if (error) throw error;

  revalidatePath("/dashboard/works");
  revalidatePath(`/dashboard/works/${id}/edit`);
  redirect("/dashboard/works");
}

export async function deleteWorkAction(a: any, b?: any) {
  const formData = pickFormData(a, b);
  const id = String(formData.get("id") ?? "");

  const supabase = await getSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  await assertOwnership(supabase, id, user.id);

  const { error } = await supabase.from("works").delete().eq("id", id);
  if (error) throw error;

  revalidatePath("/dashboard/works");
  redirect("/dashboard/works");
}
