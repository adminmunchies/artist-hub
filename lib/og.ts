export type OgData = { title: string | null; image: string | null };

export async function fetchOg(urlStr: string): Promise<OgData> {
  try {
    const res = await fetch(urlStr, {
      headers: {
        "user-agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15",
        accept: "text/html,application/xhtml+xml",
      },
      cache: "no-store",
    });
    const html = await res.text();

    const pick = (re: RegExp) => {
      const m = html.match(re);
      return m?.[1]?.trim() ?? null;
    };

    const ogTitle =
      pick(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i) ||
      pick(/<meta[^>]+name=["']twitter:title["'][^>]+content=["']([^"']+)["']/i) ||
      pick(/<title[^>]*>([^<]+)<\/title>/i);

    const rawImg =
      pick(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i) ||
      pick(/<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i);

    let image: string | null = rawImg;
    try {
      if (rawImg) image = new URL(rawImg, urlStr).toString();
    } catch {}

    return { title: ogTitle, image: image ?? null };
  } catch {
    return { title: null, image: null };
  }
}
