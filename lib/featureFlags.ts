import { getSupabaseServer } from "@/lib/supabaseServer";

export async function getUserFeatureFlags() {
  const supa = await getSupabaseServer();
  const { data: { user } = {} } = await supa.auth.getUser();
  if (!user) return { plan: "free" as const, networkEnabled: false };

  const { data: prof } = await supa
    .from("profiles")
    .select("plan, network_opt_in")
    .eq("id", user.id)
    .single();

  const plan = (prof?.plan ?? "free") as "free" | "plus" | "pro";
  const networkEnabled = !!prof?.network_opt_in && (plan === "plus" || plan === "pro");
  return { plan, networkEnabled };
}
