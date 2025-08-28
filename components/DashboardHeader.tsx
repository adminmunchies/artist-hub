import { usePathname } from "next/navigation";
import Link from "next/link";

const nav = [
  { href: "/dashboard/profile", label: "Profile" },
  { href: "/dashboard/works", label: "Works" },
];

export default function DashboardNav() {
  const pathname = usePathname();
  return (
    <div className="flex items-center gap-6">
      {nav.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={pathname === item.href ? "font-semibold underline underline-offset-4" : "text-neutral-600 hover:text-black"}
        >
          {item.label}
        </Link>
      ))}
    </div>
  );
}
