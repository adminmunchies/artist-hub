// app/dashboard/works/new/page.tsx
import Link from 'next/link';
import NewWorkFormClient from './NewWorkFormClient';

export default function NewWorkPage() {
  return (
    <div className="space-y-6">
      <Link href="/dashboard/works" className="text-sm underline">← Back</Link>
      <h1 className="text-2xl font-semibold">New Work</h1>
      <NewWorkFormClient />
    </div>
  );
}
