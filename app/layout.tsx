// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Artist Hub",
  description: "AI-indexed micro site for artists",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      {/* Body als Flex-Spalte -> Footer bleibt unten */}
      <body className="min-h-screen flex flex-col antialiased">
        {/* hier könnte später deine globale Nav/Auth-Bar rein */}
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
