import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getSupabaseServer } from "@/lib/supabaseServer";
import { isAdmin } from "@/lib/auth/isAdmin";
import AdminNavbar from "@/app/_components/AdminNavbar";
export default async function AdminLayout({ children }: { children: ReactNode }) {
  const supabase = await getSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !isAdmin(user)) redirect("/dashboard/works");
  return (
    <div className="min-h-screen">
      <AdminNavbar />
      <main className="max-w-6xl mx-auto px-4 py-6">{children}</main>
    </div>
  );
}
