// lib/siteSettings.ts
export const siteSettings = {
    website: process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.munchiesart.club",
    footerLogo: process.env.NEXT_PUBLIC_FOOTER_LOGO ?? "/munchies-logo.svg",
  
    instagram: process.env.NEXT_PUBLIC_INSTAGRAM_URL ?? "https://www.instagram.com/munchiesartclub",
    bluesky: process.env.NEXT_PUBLIC_BLUESKY_URL ?? "https://bsky.app/profile/catapultart.bsky.social",
    youtube: process.env.NEXT_PUBLIC_YOUTUBE_URL ?? "https://www.youtube.com/@catapultartists",
    tiktok: process.env.NEXT_PUBLIC_TIKTOK_URL ?? "",
  
    privacy: process.env.NEXT_PUBLIC_PRIVACY_URL ?? "/privacy",
    terms: process.env.NEXT_PUBLIC_TERMS_URL ?? "/terms",
  } as const;
  