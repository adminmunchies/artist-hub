import { redirect } from "next/navigation";
import { getSupabaseServer } from "@/lib/supabaseServer";
import { isAdmin } from "@/lib/auth/isAdmin";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function DashboardRoot() {
  const supabase = await getSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");
  if (isAdmin(user)) redirect("/dashboard/admin");
  redirect("/dashboard/works");
}
