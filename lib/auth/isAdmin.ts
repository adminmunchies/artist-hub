import type { User } from "@supabase/supabase-js";
export function isAdmin(user: User | null): boolean {
  if (!user) return false;
  const env = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  const email = (user.email || "").toLowerCase();
  const metaRole = (user.user_metadata as any)?.role;
  return env.includes(email) || metaRole === "admin";
}
