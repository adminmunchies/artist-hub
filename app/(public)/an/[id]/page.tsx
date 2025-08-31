import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getSupabaseAdmin } from '@/lib/supabaseAdmin'
import { SITE_URL } from '@/lib/site'

export const dynamic = 'force-dynamic'
export const revalidate = 0

type Row = Record<string, any>

async function fetchArticle(id: string): Promise<Row | null> {
  const supa = await getSupabaseAdmin()
  const { data } = await supa
    .from('site_articles')
    .select('*')
    .eq('id', id)
    .eq('published', true)
    .single()
  return data ?? null
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const row = await fetchArticle(id)
  if (!row) return {}
  const title = row.title ?? `Article ${id}`
  const description = row.excerpt ?? row.description ?? ''
  const base = (SITE_URL ?? '').replace(/\/$/, '')
  const url = `${base}/an/${id}`
  const image = row.og_image_url ?? `${base}/og-default.png`
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: 'article',
      images: [{ url: image }]
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image]
    }
  }
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const row = await fetchArticle(id)
  if (!row) notFound()

  const base = (SITE_URL ?? '').replace(/\/$/, '')
  const image = row.og_image_url ?? `${base}/og-default.png`
  const jsonld = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: row.title ?? `Article ${id}`,
    image: [image],
    datePublished: row.created_at ?? null,
    dateModified: row.updated_at ?? row.created_at ?? null,
    author: row.author ?? 'Munchies Art Club',
    description: row.excerpt ?? row.description ?? '',
    mainEntityOfPage: `${base}/an/${id}`
  }

  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonld) }} />
      <article className="prose mx-auto px-4 py-10">
        <h1>{row.title ?? `Article ${id}`}</h1>
        {row.excerpt ? <p>{row.excerpt}</p> : null}
        {row.content_html ? (
          <div dangerouslySetInnerHTML={{ __html: row.content_html as string }} />
        ) : (
          <pre className="whitespace-pre-wrap text-sm opacity-70">{JSON.stringify(row, null, 2)}</pre>
        )}
      </article>
    </main>
  )
}
