'use server';

import { revalidatePath } from 'next/cache';
import { getSupabaseServer } from '@/lib/supabaseServer';

// ————— Helpers —————
function normUrl(u: string): string {
  if (!u) return u;
  return /^https?:\/\//i.test(u) ? u : `https://${u}`;
}
function pick<T>(v: T | null | undefined): T | null {
  return v == null ? null : v;
}
async function fetchHtml(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; ArtistHubBot/1.0; +https://www.munchiesart.club)',
        'Accept-Language': 'en,de;q=0.8',
      },
      redirect: 'follow',
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const ct = res.headers.get('content-type') || '';
    if (!ct.includes('text/html')) return null;
    return await res.text();
  } catch {
    return null;
  }
}
function extractMeta(html: string, nameOrProp: string): string | null {
  const re = new RegExp(
    `<meta[^>]+(?:name|property)=["']${nameOrProp}["'][^>]*content=["']([^"']+)["'][^>]*>`,
    'i'
  );
  const m = html.match(re);
  return m?.[1] ? m[1].trim() : null;
}
function firstImg(html: string): string | null {
  const m = html.match(/<img[^>]+src=["']([^"']+)["'][^>]*>/i);
  return m?.[1] ? m[1].trim() : null;
}
function extractTitle(html: string): string | null {
  const og = extractMeta(html, 'og:title') || extractMeta(html, 'twitter:title');
  if (og) return og;
  const m = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  return m?.[1]?.trim() || null;
}
function extractDesc(html: string): string | null {
  return (
    extractMeta(html, 'og:description') ||
    extractMeta(html, 'twitter:description') ||
    extractMeta(html, 'description')
  );
}
function absolutize(maybeRelative: string | null, baseUrl: string): string | null {
  if (!maybeRelative) return null;
  try { return new URL(maybeRelative, baseUrl).href; } catch { return null; }
}
async function scrapePreview(url: string) {
  const html = await fetchHtml(url);
  if (!html) return { title: null, image: null, excerpt: null };
  const title = extractTitle(html);
  let img =
    extractMeta(html, 'og:image') ||
    extractMeta(html, 'twitter:image') ||
    extractMeta(html, 'twitter:image:src') ||
    firstImg(html);
  img = absolutize(img, url);
  const excerpt = extractDesc(html);
  if (img) {
    try {
      const head = await fetch(img, { method: 'HEAD', cache: 'no-store' });
      const ok = head.ok && (head.headers.get('content-type') || '').toLowerCase().startsWith('image/');
      if (!ok) img = null;
    } catch { img = null; }
  }
  return { title: pick(title), image: pick(img), excerpt: pick(excerpt) };
}

/**
 * Tags parser:
 * - trimmt
 * - begrenzt auf 5
 * - wandelt in lowercase (für robuste Suche/Filter)
 * - dedupliziert (Set)
 */
function parseTags(input: string | null): string[] {
  if (!input) return [];
  const list = input
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 5)
    .map((s) => s.toLowerCase());
  return Array.from(new Set(list));
}

// ————— Actions —————
export async function addArticle(formData: FormData) {
  const supabase = await getSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const url = normUrl(String(formData.get('url') || '').trim());
  const titleIn = String(formData.get('title') || '').trim();
  const imageIn = String(formData.get('image_url') || '').trim();
  const excerptIn = String(formData.get('excerpt') || '').trim();
  const tagsIn = String(formData.get('tags') || '').trim();
  const published = !!formData.get('published');
  const featured = !!formData.get('featured');
  const alsoArtist = !!formData.get('also_artist');

  // Nur scrapen, wenn etwas fehlt
  let scraped = { title: null as string | null, image: null as string | null, excerpt: null as string | null };
  if (!titleIn || !imageIn || !excerptIn) {
    scraped = await scrapePreview(url);
  }

  const title = titleIn || scraped.title;
  const image_url = imageIn || scraped.image;
  const excerpt = excerptIn || scraped.excerpt;
  const tags = parseTags(tagsIn);

  const { error } = await supabase
    .from('site_articles')
    .insert({ url, title, image_url, excerpt, tags, published, featured });
  if (error) throw error;

  // Optional: auch auf der eigenen Artist-Page spiegeln — mit identischem published-Status
  if (alsoArtist) {
    const { data: artist } = await supabase
      .from('artists')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();
    if (artist?.id) {
      await supabase.from('artist_news').insert({
        artist_id: artist.id,
        url,
        title: title ?? null,
        image_url: image_url ?? null,
        published, // konsistent
      });
    }
  }

  revalidatePath('/');                         // Startseite
  revalidatePath('/(public)');                 // Public-Routen
  revalidatePath('/dashboard/admin');  // Adminliste neu laden
}

export async function togglePublished(formData: FormData) {
  const supabase = await getSupabaseServer();
  const id = String(formData.get('id') || '').trim();
  const value = String(formData.get('value') || 'false') === 'true';
  await supabase.from('site_articles').update({ published: value }).eq('id', id);
  revalidatePath('/'); revalidatePath('/(public)'); revalidatePath('/dashboard/admin');
}

export async function toggleFeatured(formData: FormData) {
  const supabase = await getSupabaseServer();
  const id = String(formData.get('id') || '').trim();
  const value = String(formData.get('value') || 'false') === 'true';
  await supabase.from('site_articles').update({ featured: value }).eq('id', id);
  revalidatePath('/'); revalidatePath('/(public)'); revalidatePath('/dashboard/admin');
}

export async function deleteArticle(formData: FormData) {
  const supabase = await getSupabaseServer();
  const id = String(formData.get('id') || '').trim();
  await supabase.from('site_articles').delete().eq('id', id);
  revalidatePath('/'); revalidatePath('/(public)'); revalidatePath('/dashboard/admin');
}
