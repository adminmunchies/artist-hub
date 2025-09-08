import { getSupabaseServer } from "@/lib/supabaseServer";

export default async function BillingPage() {
  const supa = await getSupabaseServer();
  const { data: { user } = {} } = await supa.auth.getUser();
  if (!user) return null;

  const { data: prof } = await supa
    .from("profiles")
    .select("plan, network_opt_in, hide_branding")
    .eq("id", user.id)
    .single();

  const plan = prof?.plan ?? "free";

  return (
    <div className="mx-auto max-w-3xl p-6 space-y-6">
      <h1 className="text-2xl font-semibold mb-2">Billing & Plan</h1>

      <div className="rounded-2xl border p-4">
        <div className="mb-3">Current plan: <b>{plan.toUpperCase()}</b></div>
        <form action="/api/billing/upgrade" method="post">
          <button className="rounded-full border px-4 py-2">Upgrade</button>
        </form>
      </div>

      <div className="rounded-2xl border p-4 space-y-4">
        <form action="/api/settings/toggle-branding" method="post" className="flex items-center gap-3">
          <input type="checkbox" name="hide_branding" defaultChecked={!!prof?.hide_branding} />
          <span>Hide “Munchies Art Club” footer branding (Pro)</span>
          <button className="ml-auto rounded-full border px-3 py-1">Save</button>
        </form>

        <form action="/api/settings/toggle-network" method="post" className="flex items-center gap-3">
          <input type="checkbox" name="network_opt_in" defaultChecked={!!prof?.network_opt_in} />
          <span>Join the curated Network feed (Plus/Pro)</span>
          <button className="ml-auto rounded-full border px-3 py-1">Save</button>
        </form>

        {!["plus","pro"].includes(plan) && (
          <p className="text-sm opacity-70">Unlock Network & branding controls by upgrading your plan.</p>
        )}
      </div>
    </div>
  );
}
