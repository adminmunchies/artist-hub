export default function SiteNav() {
  return (
    <header className="border-b">
      <div className="mx-auto max-w-5xl px-4 py-3 flex items-center gap-4">
        <a href="/" className="text-lg font-semibold whitespace-nowrap">Artist Hub</a>
        <nav className="flex items-center gap-3">
          <a href="/artists" className="opacity-80 hover:opacity-100">Artists</a>
          <a href="/news" className="opacity-80 hover:opacity-100">News</a>
        </nav>

        <form action="/search" method="GET" className="ml-auto flex items-center gap-2">
          <input
            type="search"
            name="q"
            placeholder="Search…"
            className="border rounded-lg px-3 py-1.5 text-sm focus:outline-none"
          />
          <button className="border rounded-lg px-3 py-1.5 text-sm">Search</button>
        </form>

        <div className="ml-3 flex items-center gap-2">
          <a href="/dashboard" className="border rounded-full px-3 py-1 text-sm">Dashboard</a>
          <a href="/logout" className="border rounded-full px-3 py-1 text-sm">Logout</a>
        </div>
      </div>
    </header>
  )
}
