import 'server-only';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { createClient } from '@supabase/supabase-js';
import { notFound } from 'next/navigation';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
);

type Rec = { [key: string]: any };

// --- helpers ---
function firstImage(images: any[] | null | undefined): string | undefined {
  if (!images || !Array.isArray(images) || images.length === 0) return undefined;
  const v = images[0];
  if (typeof v === 'string') return v;
  if (v && typeof v === 'object' && 'url' in v && typeof (v as any).url === 'string') return (v as any).url;
  return undefined;
}

function guessImage(rec: Rec): string | undefined {
  const prefer = [
    'og_image','cover_image','image_url','image','cover','featured_image',
    'thumbnail','thumbnail_url','thumb','hero_image','banner','photo',
  ];
  for (const k of prefer) {
    const v = rec?.[k];
    if (typeof v === 'string' && /^https?:\/\//.test(v)) return v;
  }
  const first = firstImage(rec?.images);
  if (first) return first;

  for (const [k, v] of Object.entries(rec || {})) {
    if (typeof v === 'string' && /^https?:\/\//.test(v) && /(img|image|cover|photo|thumb|og)/i.test(k)) {
      return v;
    }
  }
  return undefined;
}

function guessExternalUrl(rec: Rec): string | undefined {
  const prefer = [
    'url','source_url','link','href','original_url','article_url','website','canonical','external_url'
  ];
  for (const k of prefer) {
    const v = rec?.[k];
    if (typeof v === 'string' && /^https?:\/\//.test(v)) return v;
  }
  // Fallback: irgendein http(s)-Feld mit „url|link|href“
  for (const [k, v] of Object.entries(rec || {})) {
    if (typeof v === 'string' && /^https?:\/\//.test(v) && /(url|link|href)/i.test(k)) return v;
  }
  return undefined;
}

// --- data ---
async function getArticle(id: string) {
  const { data, error } = await supabase
    .from('site_articles')        // Editorial-Tabelle
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) return null;
  return data as Rec;
}

// --- page ---
export default async function Page({ params }: { params: { id: string } }) {
  const rec = await getArticle(params.id);
  if (!rec) notFound();

  const title = rec.title ?? 'Untitled';
  const excerpt = rec.excerpt ?? rec.subtitle ?? rec.description ?? null;
  const img = guessImage(rec);
  const ext = guessExternalUrl(rec);

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-3xl md:text-4xl font-semibold tracking-tight mb-4">{title}</h1>

      {excerpt ? (
        <p className="text-lg text-neutral-600 mb-6">{excerpt}</p>
      ) : null}

      {img ? (
        <div className="mb-6">
          <div className="rounded-2xl border overflow-hidden bg-gray-100 aspect-[16/9]">
            <img src={img} alt={title} className="w-full h-full object-cover" loading="eager" />
          </div>
        </div>
      ) : null}

      {ext ? (
        <a
          href={ext}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 underline hover:no-underline text-sm mb-10"
        >
          {new URL(ext).hostname} <span aria-hidden>↗</span>
        </a>
      ) : null}
    </main>
  );
}
