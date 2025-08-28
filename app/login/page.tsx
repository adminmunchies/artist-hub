// app/login/page.tsx
import { redirect as nextRedirect } from "next/navigation";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

type PageProps = {
  searchParams?: Promise<Record<string, string | undefined>>;
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function LoginPage(props: PageProps) {
  const sp = (await props.searchParams) || {};
  const to = sp.redirect || "/dashboard";

  // Server Action mit ECHTEN Cookie-Writes (nicht getSupabaseServer)
  async function signInAction(formData: FormData) {
    "use server";

    const email = String(formData.get("email") || "").trim();
    const password = String(formData.get("password") || "");
    if (!email || !password) return { error: "Email and password required." };

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const jar = await cookies();

    const supabase = createServerClient(url, anon, {
      cookies: {
        get(name: string) {
          return jar.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          jar.set({ name, value, ...options });
        },
        remove(name: string, options: any) {
          jar.set({ name, value: "", ...options });
        },
      },
    });

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };

    nextRedirect(to);
  }

  return (
    <main className="mx-auto max-w-md p-6">
      <h1 className="mb-6 text-2xl font-semibold">Login</h1>

      {/* Keine method/encType bei Server-Action */}
      <form action={signInAction} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Email</label>
          <input
            name="email"
            type="email"
            autoComplete="email"
            className="w-full rounded-md border px-3 py-2"
            placeholder="you@example.com"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Password</label>
          <input
            name="password"
            type="password"
            autoComplete="current-password"
            className="w-full rounded-md border px-3 py-2"
            placeholder="password"
          />
        </div>
        <button type="submit" className="rounded-full bg-black px-4 py-2 text-white">
          Sign in
        </button>
      </form>
    </main>
  );
}

