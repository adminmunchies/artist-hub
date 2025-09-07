// app/layout.tsx
import React from "react";
import "./globals.css";

export const metadata = { title: "Artist Hub", description: "MVP" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="site-header">
          <div className="container bar">
            <a href="/" className="brand">Artist Hub</a>
            <nav className="nav">
              <a href="/artists">Artists</a>
              <a href="/pricing">Pricing</a>
              <a href="/join">Join</a>
            </nav>
            <div className="spacer" />
            <nav className="nav">
              <a href="/dashboard">Dashboard</a>
              <a href="/logout">Logout</a>
            </nav>
          </div>
        </header>
        <main className="page">
          <div className="container">{children}</div>
        </main>
      </body>
    </html>
  );
}
