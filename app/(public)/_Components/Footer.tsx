import Link from "next/link";
import { getSupabaseServer } from "@/lib/supabaseServer";
import { routes } from "@/lib/routes";

export default async function Footer() {
  const supabase = await getSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // eigene Artist-ID für "My public page"
  let myArtistId: string | null = null;
  if (user) {
    const { data: artist } = await supabase
      .from("artists")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();
    myArtistId = artist?.id ?? null;
  }

  const year = new Date().getFullYear();

  return (
    <footer className="border-t mt-16">
      <div className="mx-auto max-w-6xl px-4 py-10 grid gap-8 md:grid-cols-2">
        {/* About + Credit */}
        <div>
          <div className="text-base font-semibold">Artist Hub</div>
          <p className="text-sm text-gray-500 mt-2">
            Micro-sites for artists — share works &amp; news.
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Based on an idea by{" "}
            <a
              href="https://www.munchiesart.club"
              target="_blank"
              rel="noreferrer"
              className="underline"
            >
              Catapult — The Munchies Art Club
            </a>.
          </p>
        </div>

        {/* Account */}
        <div>
          <div className="text-sm font-medium mb-3">Account</div>
          <ul className="space-y-2 text-sm">
            {!user ? (
              <li>
                <Link href={routes.login()} className="hover:underline">
                  Login
                </Link>
              </li>
            ) : (
              <>
                <li>
                  <Link href={routes.dashboard()} className="hover:underline">
                    Dashboard
                  </Link>
                </li>
                {myArtistId ? (
                  <li>
                    <Link
                      href={routes.publicArtist(myArtistId)}
                      className="hover:underline"
                    >
                      My public page
                    </Link>
                  </li>
                ) : null}
                <li>
                  <Link href={routes.logout()} className="hover:underline">
                    Logout
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>

      {/* Bottom bar with CTA + permanent link */}
      <div className="border-t">
        <div className="mx-auto max-w-6xl px-4 py-4 text-xs sm:text-sm text-gray-600 flex flex-col md:flex-row items-center justify-between gap-3">
          <span>© {year} Artist Hub</span>

          <a
            href="https://www.munchiesart.club/ask-kurt-a-curatorial-global-network-project/"
            target="_blank"
            rel="noreferrer"
            className="rounded-full border px-3 py-1 hover:bg-gray-50 text-center"
          >
            Want a page? Submit your work via <span className="underline">Ask Kurt</span>
          </a>

          <a
            href="https://www.munchiesart.club"
            target="_blank"
            rel="noreferrer"
            className="underline"
          >
            munchiesart.club
          </a>
        </div>
      </div>
    </footer>
  );
}
