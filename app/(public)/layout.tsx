import type { ReactNode } from "react";

export default function PublicLayout({ children }: { children: ReactNode }) {
  // eigener Header raus – globaler Header steckt in app/layout.tsx
  return <>{children}</>;
}
