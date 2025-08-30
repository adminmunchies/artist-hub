import Link from "next/link";

export default function TagLink({ tag, className = "" }: { tag: string; className?: string }) {
  const t = (tag || "").trim();
  if (!t) return null;
  return (
    <Link
      href={`/search?q=${encodeURIComponent(t)}`}
      className={`text-xs border rounded-full px-2 py-1 hover:bg-gray-50 ${className}`}
    >
      {t}
    </Link>
  );
}
