import { ReactNode } from "react";
import { getRole } from "@/lib/role";
import { redirect } from "next/navigation";
import ArtistNavbar from "@/app/_components/ArtistNavbar";

export default async function UserDashboardLayout({ children }: { children: ReactNode }) {
  const { user, isAdmin } = await getRole();
  if (!user) redirect("/auth/login");
  if (isAdmin) redirect("/dashboard/admin");
  return (
    <>
      <ArtistNavbar />
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </>
  );
}
