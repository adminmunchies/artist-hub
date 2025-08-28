import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-16 border-t py-10">
      <div className="mx-auto max-w-5xl flex items-center justify-between px-4">
        <Link
          href="https://www.munchiesart.club"
          target="_blank"
          className="inline-flex items-center gap-3 transition-transform hover:scale-[1.02]"
        >
          <img src="/munchies-logo.svg" alt="Munchies Art Club" className="h-9 w-auto drop-shadow" />
          <span className="sr-only">Munchies Art Club</span>
        </Link>
        <div className="text-sm text-gray-500">© {new Date().getFullYear()} Munchies Art Club</div>
      </div>
    </footer>
  );
}
