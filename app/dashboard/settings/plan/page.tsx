// app/dashboard/settings/plan/page.tsx
export const dynamic = "force-static";

export default function SettingsPlanPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-10">
      <h1 className="text-2xl font-semibold">Plan & billing</h1>
      <p className="mt-2 text-sm text-neutral-600">
        Manage your subscription, payment method, and invoices.
      </p>

      <div className="mt-6 rounded-2xl border p-5">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-neutral-600">Current plan</div>
            <div className="text-base font-medium">Not detected (MVP stub)</div>
          </div>
          <a
            href="/pricing"
            className="rounded-full border px-4 py-2 text-sm hover:bg-black hover:text-white"
          >
            Change plan
          </a>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border p-5">
        <div className="text-sm font-medium">Invoices</div>
        <p className="mt-2 text-sm text-neutral-600">
          Billing and invoices will appear here once enabled.
        </p>
      </div>
    </main>
  );
}
