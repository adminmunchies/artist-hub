// app/_components/DashboardNavbar.tsx
import Link from 'next/link';
import { routes } from '@/lib/routes';

export default function DashboardNavbar() {
  return (
    <header className="border-b">
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-6">
          <Link href={routes.home()} className="font-semibold">Artist Hub</Link>
          <Link href={routes.dashboardWorks()}>Works</Link>
          <Link href={routes.dashboardProfile()}>Profile</Link>
          <Link href={routes.dashboardExhibitions()}>Exhibitions</Link>
          <Link href={routes.dashboardSettings()}>Settings</Link>
        </div>
        <div className="flex items-center gap-3">
          <Link href={routes.logout()} className="rounded-full border px-3 py-1">Logout</Link>
        </div>
      </nav>
    </header>
  );
}
