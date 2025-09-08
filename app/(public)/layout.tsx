import type { ReactNode } from "react";
import PublicNavbar from "@/app/_components/PublicNavbar";
import PublicFooter from "@/app/_components/PublicFooter";
import { getSupabaseServer } from "@/lib/supabaseServer";

export default async function PublicLayout({ children }: { children: ReactNode }) {
  const supa = await getSupabaseServer();
  const { data: { user } = {} } = await supa.auth.getUser();

  let showBranding = true;

  if (user) {
    const { data: prof } = await supa
      .from("profiles")
      .select("hide_branding, plan")
      .eq("id", user.id)
      .single();

    // Branding darf nur bei PRO + Toggle ausgeblendet werden
    if (prof?.hide_branding && prof?.plan === "pro") {
      showBranding = false;
    }
  }

  return (
    <>
      <PublicNavbar />
      <main>{children}</main>
      {showBranding && <PublicFooter />}
    </>
  );
}
