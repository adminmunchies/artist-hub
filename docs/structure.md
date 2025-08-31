# Project Structure (Deep Dive)

1) App Router
- app/robots.ts — Metadata Route → /robots.txt
- app/sitemap.ts — Metadata Route → /sitemap.xml
- app/(public)/a/[id]/page.tsx — Artist (JSON-LD Person, NewsSection, TagLinks)
- app/(public)/w/[id]/page.tsx — Work (JSON-LD VisualArtwork, OG/Twitter)
- app/(public)/an/[id]/page.tsx — Admin Article (JSON-LD NewsArticle, OG/Twitter)
- app/(public)/artists/page.tsx — Listing + Search (?q=…), Tag-Redirects via TagLink

2) Library
- lib/supabaseClient.ts — Browser client (named export supabase)
- lib/supabaseServer.ts — Server helper getSupabaseServer()
- lib/site.ts — SITE_URL helper (ohne trailing slash)

3) Components
- TagLink.tsx — Link zu /artists?q=<tag>
- Footer.tsx — liest site_settings

4) Public Assets
- public/og-default.png — OG/Twitter Fallback
- Favicons/Touch Icons optional

5) Data & RLS
- Public read: artists; works(published=true); site_articles(published=true); site_settings(read-only)
- Writes: nur Admin/Service-Key

6) SEO/AI Pipeline
- Robots erlaubt Google-Extended, GPTBot, PerplexityBot
- Sitemap enthält Root, Artists, Works(published), Articles(published)
- JSON-LD serverseitig im Body (script type="application/ld+json")
- OG/Twitter via generateMetadata

7) Dev-Workflow (4-Blöcke)
1. Terminal  2. Files  3. After-change actions  4. Sanity checks

8) Checks
curl -I http://localhost:3000/robots.txt | head -n1
curl -I http://localhost:3000/sitemap.xml | head -n1
curl -s http://localhost:3000/sitemap.xml | awk -F'/a/' '/\/a\//{split($2,a,"<"); print a[1]; exit}' > /tmp/aid.txt
ARTIST_ID=$(cat /tmp/aid.txt)
curl -s "http://localhost:3000/a/$ARTIST_ID" | grep -q 'application/ld+json' && echo "Artist JSON-LD ok" || echo "JSON-LD fehlt"

9) Known Pitfalls
- Nie public/robots.txt parallel zu app/robots.ts
- Keine Heredocs in Pfaden mit Klammern schreiben; im Editor arbeiten
- Absolut-URLs für OG/JSON-LD-Bilder sicherstellen
