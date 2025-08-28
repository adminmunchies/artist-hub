import { getSupabaseServer } from '@/lib/supabaseServer';
import { makeMeAdmin } from './actions';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function RoleDebugPage() {
  const supabase = await getSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  let isAdmin = false;
  if (user) {
    const { data } = await supabase
      .from('admin_users')
      .select('user_id')
      .eq('user_id', user.id)
      .maybeSingle();
    isAdmin = !!data;
  }

  return (
    <main className="max-w-3xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Role debug</h1>
      <pre className="rounded-2xl border p-4 bg-gray-50 whitespace-pre-wrap">
        {JSON.stringify({
          userId: user?.id ?? null,
          email: user?.email ?? null,
          isAdmin,
        }, null, 2)}
      </pre>

      {!isAdmin && user && (
        <form action={makeMeAdmin}>
          <button className="rounded-full border px-4 py-2">
            Make me admin
          </button>
        </form>
      )}
    </main>
  );
}
