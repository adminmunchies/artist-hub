"use server";

import { redirect } from "next/navigation";
import { getSupabaseServer } from "@/lib/supabaseServer";

export async function loginAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "/dashboard");
  if (!email || !password) return { error: "Missing credentials." };

  const supa = await getSupabaseServer();
  const { error } = await supa.auth.signInWithPassword({ email, password });
  if (error) return { error: "Login failed. Check email/password." };

  redirect(next);
}
