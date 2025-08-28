// app/_components/LogoutButton.tsx
"use client";

export default function LogoutButton() {
  // Harte Navigation auf die Signout-Route -> Session wird serverseitig beendet
  return (
    <a href="/auth/signout" className="rounded-full border px-4 py-1.5">
      Logout
    </a>
  );
}
