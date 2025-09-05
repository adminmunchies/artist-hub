"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSupabaseServer } from "@/lib/supabaseServer";

function toText(v: FormDataEntryValue | null): string | undefined {
  const s = typeof v === "string" ? v.trim() : "";
  return s.length ? s : undefined;   // ⬅️ keine nulls mehr
}

// erlaubt (formData) ODER (prev, formData)
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
  if (!id) throw new Error("Missing work id");

  const title = toText(formData.get("title"));
  const published = !!formData.get("published");          // checkbox → true/false
  const image_url = toText(formData.get("image_url"));
  const thumbnail_url = toText(formData.get("thumbnail_url"));

  const supabase = await getSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  await assertOwnership(supabase, id, user.id);

  // Nur nicht-leere Felder setzen → niemals NULL in NOT NULL Felder schreiben
  const updates: Record<string, any> = {
    published,
    is_published: published, // legacy sync
  };
  if (title !== undefined) updates.title = title;

  // Bildfelder – wenn nur eins gesetzt, auf beide spiegeln
  if (image_url && !thumbnail_url) {
    updates.image_url = image_url;
    updates.thumbnail_url = image_url;
  } else {
    if (image_url) updates.image_url = image_url;
    if (thumbnail_url) updates.thumbnail_url = thumbnail_url;
  }

  const { error } = await supabase.from("works").update(updates).eq("id", id);
  if (error) {
    console.error("updateWorkAction error:", error);
    throw error;
  }

  revalidatePath("/dashboard/works");
  revalidatePath(`/dashboard/works/${id}/edit`);
  redirect("/dashboard/works");
}

export async function deleteWorkAction(a: any, b?: any) {
  const formData = pickFormData(a, b);
  const id = String(formData.get("id") ?? "");
  if (!id) throw new Error("Missing work id");

  const supabase = await getSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  await assertOwnership(supabase, id, user.id);

  const { error } = await supabase.from("works").delete().eq("id", id);
  if (error) {
    console.error("deleteWorkAction error:", error);
    throw error;
  }

  revalidatePath("/dashboard/works");
  redirect("/dashboard/works");
}
