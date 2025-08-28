// middleware.ts
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// Wichtig: Keine Cookie-Lese/Parse-Logik hier.
// Login/Logout/Auth-Health laufen in Route-Handlern mit @supabase/ssr.
export function middleware(_req: NextRequest) {
  return NextResponse.next();
}

// Optional: Wenn du /dashboard schützen willst, machst du das später
// serverseitig in den page.tsx via getSupabaseServer().auth.getUser().

export const config = {
  matcher: [
    // aktuell keine erzwungenen Redirects
  ],
};
