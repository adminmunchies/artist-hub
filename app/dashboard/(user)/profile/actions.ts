"use server";

import { redirect } from "next/navigation";
import { getSupabaseServer } from "@/lib/supabaseServer";

export async function saveProfile(prevState: unknown, formData: FormData) {
  const supabase = await getSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect("/");
  }

  const id = formData.get("id") as string;
  const name = (formData.get("name") as string) ?? "";
  const city = (formData.get("city") as string) ?? "";
  const bio = (formData.get("bio") as string) ?? "";
  const instagram_url = (formData.get("instagram_url") as string) ?? "";
  const website_url = (formData.get("website_url") as string) ?? "";
  const disciplines_csv = (formData.get("disciplines_csv") as string) ?? "";
  const profile_image_url = (formData.get("profile_image_url") as string) ?? "";

  const disciplines = disciplines_csv
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  await supabase
    .from("artists")
    .update({
      name,
      city,
      bio,
      instagram_url,
      website_url,
      disciplines,
      profile_image_url,
    })
    .eq("id", id)
    .eq("owner_id", user.id);

  redirect(`/a/${id}`);
}
