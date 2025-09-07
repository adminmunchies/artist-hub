// app/login/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import LoginForm from "./LoginForm";

export const metadata: Metadata = { title: "Login – Artist Hub" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const sp = await searchParams;
  const next = sp?.next || "/dashboard";

  return (
    <main className="mx-auto max-w-md px-4 py-10">
      <h1 className="text-3xl font-semibold mb-6">Login</h1>
      <p className="text-gray-600 mb-4 text-sm">
        We’ll email you a magic link. No password needed. If you’re new, we’ll
        create your account automatically.
      </p>
      <LoginForm next={next} />
      <p className="mt-6 text-sm">
        <Link className="underline" href="/pricing?role=artist">
          See pricing
        </Link>
        <span className="text-gray-500"> · </span>
        <Link className="underline" href="/join">
          Join free
        </Link>
      </p>
    </main>
  );
}
