'use client';

import { useEffect, useState } from 'react';

type HealthPayload = {
  ok: boolean;
  env?: Record<string, boolean>;
  db?: { ok: boolean; error?: string | null };
  anon?: { ok: boolean; status?: number | null; error?: string | null };
  now?: string;
};

export default function SystemStatusBadge({ className = '' }: { className?: string }) {
  const [state, setState] = useState<'loading' | 'ok' | 'degraded' | 'down'>('loading');
  const [ts, setTs] = useState<string | null>(null);

  async function check() {
    try {
      const r = await fetch('/health', { cache: 'no-store' });
      if (!r.ok) throw new Error(String(r.status));
      const data: HealthPayload = await r.json();
      setTs(data?.now ?? null);
      if (data.ok) setState('ok');
      else if (data.db?.ok || data.anon?.ok) setState('degraded');
      else setState('down');
    } catch {
      setState('down');
    }
  }

  useEffect(() => {
    check();
    const id = setInterval(check, 60_000); // re-check every 60s
    return () => clearInterval(id);
  }, []);

  const map = {
    loading: { dot: 'bg-gray-400', text: 'Checking…' },
    ok: { dot: 'bg-green-500', text: 'System: OK' },
    degraded: { dot: 'bg-yellow-500', text: 'System: Degraded' },
    down: { dot: 'bg-red-500', text: 'System: Down' },
  } as const;

  const m = map[state];

  return (
    <span
      className={`inline-flex items-center gap-2 text-xs border rounded-full px-3 py-1 select-none ${className}`}
      aria-live="polite"
      aria-label={`System status: ${m.text}`}
      title={ts ? `${m.text} • ${new Date(ts).toLocaleString()}` : m.text}
    >
      <span className={`h-2 w-2 rounded-full ${m.dot}`} />
      <span>{m.text}</span>
    </span>
  );
}
