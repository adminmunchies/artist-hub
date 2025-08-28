// app/(public)/a/[id]/layout.tsx
import type { ReactNode } from "react";

/**
 * Wichtig: KEINE Navbar hier, die kommt aus app/(public)/layout.tsx.
 * So vermeiden wir doppelte Buttons.
 */
export default function ArtistPublicLayout({ children }: { children: ReactNode }) {
  return children;
}
