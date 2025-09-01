// lib/tags.ts
/** "Kunst Messe Wien" -> "kunst-messe-wien" (URL) */
export function toTagSlug(raw: string): string {
    return String(raw ?? "")
      .normalize("NFKD")
      .toLowerCase()
      .trim()
      .replace(/[\s_]+/g, "-")
      .replace(/[^a-z0-9-]/g, "")
      .replace(/-+/g, "-");
  }
  
  /** "kunst-messe-wien" oder "kunst%20messe%20wien" -> "kunst messe wien" (lesbar) */
  export function fromTagSlug(slug: string): string {
    const s = decodeURIComponent(String(slug ?? ""));
    return s.replace(/-/g, " ").replace(/\s+/g, " ").trim();
  }
  
  /** Wert, der in Supabase gegen `tags_lc` gematcht wird */
  export function tagQueryValue(slugOrTag: string): string {
    return fromTagSlug(slugOrTag).toLowerCase();
  }
  