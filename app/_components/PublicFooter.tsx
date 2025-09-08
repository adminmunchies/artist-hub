import Link from "next/link";
import { getSupabaseServer } from "@/lib/supabaseServer";
import LoginInline from "@/app/_components/LoginInline";

export default async function PublicFooter() {
  const supa = await getSupabaseServer();
  const { data: { user } = {} } = await supa.auth.getUser();

  return (
    <footer className="border-t mt-10">
      <div className="mx-auto max-w-6xl px-4 py-6 flex flex-col md:flex-row items-center gap-3 md:gap-6">
        <div className="text-sm opacity-80">by Munchies Art Club</div>

        <div className="ml-auto w-full md:w-auto">
          {user ? (
            <form action="/api/auth/logout" method="post" className="flex justify-end">
              <button className="rounded-full border px-3 py-1 text-sm">Logout</button>
            </form>
          ) : (
            <LoginInline className="w-full md:w-auto" />
          )}
        </div>

        {!user && (
          <div className="text-xs opacity-70">
            Or{" "}
            <Link href="/login" className="underline">
              open full login
            </Link>
          </div>
        )}
      </div>
    </footer>
  );
}
