// app/(public)/layout.tsx
import PublicNavbar from "@/app/_components/PublicNavbar";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <PublicNavbar />
      {children}
    </div>
  );
}

