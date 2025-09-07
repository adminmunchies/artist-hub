// app/login/page.tsx
import type { Metadata } from "next";
import LoginForm from "./LoginForm";

export const metadata: Metadata = {
  title: "Sign in – Artist Hub",
  description: "Sign in with a magic link to access your dashboard.",
};

type SP = { next?: string };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<SP>;
}) {
  const sp = await searchParams;
  const rawNext = sp?.next;
  const next =
    typeof rawNext === "string" && rawNext.startsWith("/")
      ? rawNext
      : "/dashboard";

  return (
    <main className="mx-auto max-w-md px-4 py-10">
      <h1 className="mb-2 text-2xl font-semibold">Sign in</h1>
      <p className="mb-6 text-sm text-gray-600">
        We’ll email you a magic link. No password required.
      </p>
      <LoginForm next={next} />
    </main>
  );
}
