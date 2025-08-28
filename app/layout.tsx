import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Artist Hub',
  description: 'AI-indexed micro site for artists',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
