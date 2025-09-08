// lib/og.ts
// server-only Open Graph scraper for fetching og:title/og:image.
import "server-only";

export type OgData = { title?: string | null; image?: string | null };

function toAbs(base: string, maybe: string | null | undefined) {
  try {
    if (!maybe) return null;
    return new URL(maybe, base).toString();
  } catch {
    return null;
  }
}

function pick(html: string, re: RegExp): string | null {
  const m = html.match(re);
  return m?.[1]?.trim() ?? null;
}

export async function scrapeOG(url: string): Promise<OgData> {
  try {
    const res = await fetch(url, {
      headers: {
        "user-agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36",
        accept: "text/html,*/*",
      },
      cache: "no-store",
      redirect: "follow",
    });
    const html = await res.text();

    const title =
      pick(html, /<meta[^>]+property=["']og:title["'][^>]*content=["']([^"']+)["']/i) ??
      pick(html, /<meta[^>]+name=["']og:title["'][^>]*content=["']([^"']+)["']/i) ??
      pick(html, /<title[^>]*>([^<]+)<\/title>/i);

    const imgRaw =
      pick(html, /<meta[^>]+property=["']og:image["'][^>]*content=["']([^"']+)["']/i) ??
      pick(html, /<meta[^>]+name=["']twitter:image["'][^>]*content=["']([^"']+)["']/i) ??
      pick(html, /<link[^>]+rel=["']image_src["'][^>]*href=["']([^"']+)["']/i);

    return { title, image: toAbs(res.url || url, imgRaw) };
  } catch {
    return { title: null, image: null };
  }
}
