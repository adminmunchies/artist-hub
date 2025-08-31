# Artist Hub (MVP) — Next.js 15 + Supabase

Public Artist Directory + Works + Admin Articles. SEO/AI-ready (robots, sitemap, JSON-LD).
Tech stack: **Next.js 15 (App Router, TypeScript)**, **Supabase (DB/Auth/Storage, RLS)**, **Tailwind**.

## Status (MVP)
- ✅ Public: `/artists`, `/a/[id]`, `/w/[id]`, `/an/[id]`
- ✅ SEO: `app/robots.ts`, `app/sitemap.ts`, JSON-LD (Person/VisualArtwork/NewsArticle), OG/Twitter
- ✅ Dashboard: Profile & Works (list/new/edit/delete), auth-guarded
- ✅ Footer: liest `site_settings` (Links, Socials, Promos)
- 🔜 Polish: VisualArtwork erweitern, NewsArticle `publisher.logo`, 404-Flows, Pagination

## Quickstart
1. Requirements
   - Node 20+, npm
   - Supabase: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY
   - NEXT_PUBLIC_SITE_URL (ohne Slash, z. B. https://www.munchiesart.club)
2. ENV (.env.local)
   NEXT_PUBLIC_SUPABASE_URL=…
   NEXT_PUBLIC_SUPABASE_ANON_KEY=…
   NEXT_PUBLIC_SITE_URL=https://www.munchiesart.club
3. Install & Run
   npm i
   npm run dev

## Projekt-Konventionen
- 4-Blöcke-Workflow: Terminal → Files → After-change actions → Sanity checks
- Admin-Writes: keine Server Actions; API-Routes oder Supabase Admin Client
- Eine Änderung = ein Commit; Meilensteine taggen
- Keine Heredocs in Pfaden mit Klammern (app/(public)/…): dort im Editor arbeiten
- Supabase: lib/supabaseClient.ts (Browser, named export supabase), lib/supabaseServer.ts (Server helper)

## SEO & AI-Search
- Robots: app/robots.ts (erlaubt Google-Extended, GPTBot, PerplexityBot)
- Sitemap: app/sitemap.ts (Root, /artists, alle /a/*, /w/* published, /an/* published)
- JSON-LD: /a/[id] Person (+knowsAbout/workExample), /w/[id] VisualArtwork, /an/[id] NewsArticle
- OG/Twitter: generateMetadata, Fallback public/og-default.png

## Directory (Kurz)
app/(public)/a/[id]/page.tsx
app/(public)/w/[id]/page.tsx
app/(public)/an/[id]/page.tsx
app/(public)/artists/page.tsx
app/sitemap.ts
app/robots.ts
components/TagLink.tsx, Footer.tsx
lib/supabaseClient.ts, supabaseServer.ts, site.ts
public/og-default.png

## Datenmodell
artists(id,name,city,bio,instagram_url,website_url,avatar_url,disciplines[],tags[],updated_at)
works(id,artist_id,title,description,published,created_at,updated_at,images…)
site_articles(id,title,excerpt,body_html,image_url,published,updated_at)
site_settings(footer/logo/socials/promos…)

## Sanity checks (lokal)
curl -I http://localhost:3000/robots.txt | head -n1
curl -I http://localhost:3000/sitemap.xml | head -n1
curl -s http://localhost:3000/sitemap.xml | awk -F'/a/' '/\/a\//{split($2,a,"<"); print a[1]; exit}' > /tmp/aid.txt
ARTIST_ID=$(cat /tmp/aid.txt)
curl -s "http://localhost:3000/a/$ARTIST_ID" | grep -q 'application/ld+json' && echo "Artist JSON-LD ok" || echo "JSON-LD fehlt"

## Troubleshooting
- Konflikt robots.txt: keine public/robots.txt; nur app/robots.ts
- 405 /robots.txt: route handler versehentlich genutzt → auf app/robots.ts umstellen
- curl connect fail: Dev-Server starten (npm run dev)
- zsh parse error bei $(): awk-Variante oben nutzen
- OG leer: public/og-default.png anlegen bzw. absolut machen
