// lib/plans.ts
export type Role = "artist" | "curator" | "gallery" | "collector";

export type Plan = {
  id: string;
  role: Role;
  title: string;
  price: string;
  features: string[];
};

export const PLANS_BY_ROLE: Record<Role, Plan[]> = {
  artist: [
    {
      id: "artist_free",
      role: "artist",
      title: "Free / Lite",
      price: "€0/mo",
      features: [
        "Public profile (Lite)",
        "1 artwork, 1 news",
        "Short AI bio",
        "1 social link (Instagram)",
        "No analytics, no boost",
      ],
    },
    {
      id: "artist_basic",
      role: "artist",
      title: "Basic",
      price: "€10/mo",
      features: [
        "Up to 3 artworks & 3 news",
        "AI bio (short + long) & meta",
        "Light analytics (views/referrers)",
        "Linked in city & discipline clusters",
      ],
    },
    {
      id: "artist_pro",
      role: "artist",
      title: "Pro",
      price: "€20/mo",
      features: [
        "Unlimited artworks & news",
        "Analytics Pro (trends/clusters)",
        "Network Content Boost",
        "AI portfolio PDF",
      ],
    },
  ],
  curator: [
    {
      id: "curator_free",
      role: "curator",
      title: "Free / Lite",
      price: "€0/mo",
      features: ["Public profile (Lite)", "Bookmark & share lists"],
    },
    {
      id: "curator_pro",
      role: "curator",
      title: "Pro",
      price: "€15/mo",
      features: ["Curator picks", "Newsletter highlights"],
    },
  ],
  gallery: [
    {
      id: "gallery_lite",
      role: "gallery",
      title: "Lite",
      price: "€0/mo",
      features: [
        "Gallery profile (name, city, website)",
        "1 show & 1 announcement",
        "Link up to 5 artists",
        "No analytics, no boost",
      ],
    },
    {
      id: "gallery_pro",
      role: "gallery",
      title: "Pro",
      price: "€59/mo",
      features: [
        "Unlimited shows & announcements",
        "Link unlimited artists",
        "Analytics Pro (page/artist clicks/show)",
        "Priority placement in city/program hubs",
      ],
    },
  ],
  collector: [
    {
      id: "collector_free",
      role: "collector",
      title: "Free",
      price: "€0/mo",
      features: ["Save artists & works", "Follow news"],
    },
  ],
};

export function getPlanById(role: Role, id: string): Plan | undefined {
  return PLANS_BY_ROLE[role]?.find((p) => p.id === id);
}
