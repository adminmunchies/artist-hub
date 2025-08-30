// lib/og.ts
export type OgData = { title?: string; description?: string; image?: string };

function pickMeta(html: string, ...keys: string[]) {
  for (const k of keys) {
    const re = new RegExp(
      `<meta[^>]+(?:property|name)=["']${k}["'][^>]+content=["']([^"']+)["'][^>]*>`,
      "i"
    );
    const m = html.match(re);
    if (m) return m[1];
  }
  return undefined;
}

export async function scrapeOG(url: string): Promise<OgData> {
  const res = await fetch(url, {
    // viele Seiten liefern erst mit "echtem" UA Bilder
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
      "Accept-Language": "en",
    },
    // keine Caches beim Scrapen
    cache: "no-store",
  });
  const html = await res.text();

  const title =
    pickMeta(html, "og:title") ??
    pickMeta(html, "twitter:title") ??
    html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1];

  const description =
    pickMeta(html, "og:description") ?? pickMeta(html, "twitter:description");

  let image =
    pickMeta(html, "og:image") ??
    pickMeta(html, "twitter:image") ??
    html.match(
      /<img[^>]+src=["']([^"']+\.(?:jpg|jpeg|png|webp|gif))["'][^>]*>/i
    )?.[1];

  // relative → absolute URL auflösen
  if (image) {
    try {
      image = new URL(image, url).toString();
    } catch {
      /* ignore */
    }
  }

  return { title, description, image };
}
