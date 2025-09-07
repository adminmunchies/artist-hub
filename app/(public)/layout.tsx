// app/(public)/layout.tsx
import type { ReactNode } from "react";
import PublicNavbar from "@/app/_components/PublicNavbar";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <PublicNavbar />
      <main>{children}</main>
    </>
  );
}
