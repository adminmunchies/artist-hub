import { SITE_URL } from "@/lib/site"
import { getSupabaseAdmin } from "@/lib/supabaseAdmin"

export const runtime = "nodejs"
export const revalidate = 600

const base = (SITE_URL ?? "http://localhost:3000").replace(/\/$/, "")
const toAbs = (u?: string) => /^https?:\/\//i.test(String(u||"")) ? String(u) : `${base}${!u ? "/og-default.png" : (String(u).startsWith("/")?"":"/")+String(u)}`
const esc = (s: any) => String(s ?? "").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")

export async function GET() {
  const supabase = await getSupabaseAdmin()
  const [newsRes, artRes] = await Promise.all([
    supabase.from("artist_news").select("*").eq("published", true).order("created_at",{ascending:false}).limit(50),
    supabase.from("site_articles").select("*").eq("published", true).order("created_at",{ascending:false}).limit(50),
  ])
  const news = (newsRes.data ?? []).map((r:any)=>({kind:"news" as const,...r}))
  const articles = (artRes.data ?? []).map((r:any)=>({kind:"site" as const,...r}))
  const items = [...news, ...articles].map((r:any)=>{
    const link = r.kind==="news" ? `${base}/news/${r.id}` : `${base}/an/${r.id}`
    const title = r.title ?? (r.kind==="news" ? "Artist News" : "Article")
    const desc = r.summary ?? r.excerpt ?? r.description ?? ""
    const pub = new Date(r.created_at ?? Date.now()).toUTCString()
    const img = r.og_image ?? r.cover_image ?? (Array.isArray(r.images)&&r.images[0]) ?? null
    const cats:string[]=[]
    const push=(v:any)=>{ if(!v)return; if(Array.isArray(v))v.forEach(push); else if(typeof v==="object")Object.values(v).forEach(push); else cats.push(String(v)) }
    push(r.tags)
    return {link, title, desc, pub, guid: link, cats, img: img?toAbs(img):null}
  }).sort((a,b)=>new Date(b.pub).getTime()-new Date(a.pub).getTime()).slice(0,50)

  const lastBuild = new Date().toUTCString()
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
<channel>
<title>Munchies Art Club — News & Articles</title>
<link>${base}</link>
<description>Latest artist news and editor articles from Munchies Art Club.</description>
<language>en</language>
<lastBuildDate>${lastBuild}</lastBuildDate>
${items.map(it=>`
<item>
  <title>${esc(it.title)}</title>
  <link>${it.link}</link>
  <guid>${it.guid}</guid>
  <pubDate>${it.pub}</pubDate>
  ${it.desc?`<description><![CDATA[${it.desc}]]></description>`:""}
  ${it.img?`<enclosure url="${it.img}" type="image/jpeg" />`:""}
  ${it.cats.map(c=>`<category>${esc(c)}</category>`).join("\n  ")}
</item>`).join("\n")}
</channel>
</rss>`
  return new Response(xml, { headers: { "Content-Type":"application/rss+xml; charset=utf-8","Cache-Control":"s-maxage=600, stale-while-revalidate=86400" }})
}
