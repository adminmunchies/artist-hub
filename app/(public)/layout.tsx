// app/(public)/layout.tsx
import type { ReactNode } from "react";

export default function PublicLayout({ children }: { children: ReactNode }) {
  // Kein eigener Header mehr – globaler Header steckt in app/layout.tsx
  return <>{children}</>;
}
