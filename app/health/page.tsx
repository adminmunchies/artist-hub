// app/health/page.tsx
export const dynamic = "force-static";

export default function HealthPage() {
  return (
    <main style={{ padding: 24 }}>
      <h1>OK</h1>
      <p>Server is rendering pages.</p>
    </main>
  );
}
