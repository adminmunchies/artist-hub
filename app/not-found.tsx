import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto max-w-xl p-8">
      <h1 className="text-2xl font-semibold mb-2">Page not found</h1>
      <p className="mb-4">Sorry, we couldn’t find that page.</p>
      <Link className="underline" href="/">Back to home</Link>
    </main>
  );
}
