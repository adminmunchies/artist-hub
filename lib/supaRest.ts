import 'server-only';

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

if (!URL || !KEY) {
  throw new Error('Missing Supabase env: NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

type Options = {
  params: string;        // e.g. select=...&published=eq.true&order=created_at.desc&limit=60
  revalidate?: number;   // optional; not used when cache:'no-store'
};

export async function restSelect<T = any>(table: string, opts: Options): Promise<T[]> {
  const qs = opts.params ? `${opts.params}&apikey=${encodeURIComponent(KEY)}` : `apikey=${encodeURIComponent(KEY)}`;
  const u = `${URL}/rest/v1/${table}?${qs}`;

  const res = await fetch(u, {
    headers: {
      apikey: KEY,
      Authorization: `Bearer ${KEY}`,
    },
    // Force fresh data in dev and avoid weird header stripping/caching issues
    cache: 'no-store',
    next: { revalidate: 0 },
  });

  if (!res.ok) {
    return [];
  }
  return (await res.json()) as T[];
}
