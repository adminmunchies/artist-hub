import { getSupabaseServer } from "@/lib/supabaseServer";
import { isAdmin } from "@/lib/auth/isAdmin";
import { redirect } from "next/navigation";
export const dynamic = "force-dynamic";
export const revalidate = 0;
export default async function AdminHome() {
  const supabase = await getSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  if (!isAdmin(user)) redirect("/dashboard/works");
  return (
    <section>
      <h1 className="text-2xl font-semibold mb-4">Admin Dashboard</h1>
      <p className="mb-6">Welcome, {user.email}</p>
      <div className="grid gap-4 md:grid-cols-2">
        <a href="/dashboard/admin#links" className="rounded-xl border p-4">
          <h2 className="font-medium mb-1">Share Links to Main Site</h2>
          <p className="text-sm">Create & manage featured links with up to 5 tags.</p>
        </a>
        <a href="/dashboard/admin#artists" className="rounded-xl border p-4">
          <h2 className="font-medium mb-1">Artists & Submissions</h2>
          <p className="text-sm">Review, feature, or pin to homepage sections.</p>
        </a>
      </div>
    </section>
  );
}
