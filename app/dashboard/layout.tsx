// app/dashboard/layout.tsx
import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getSupabaseServer } from "@/lib/supabaseServer";
import DashboardNavbar from "@/app/_components/DashboardNavbar";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const supabase = await getSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Unangemeldet → Login mit Rücksprungziel
  if (!user) {
    redirect(`/login?next=${encodeURIComponent("/dashboard")}`);
  }

  return (
    <>
      <DashboardNavbar />
      <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
    </>
  );
}
