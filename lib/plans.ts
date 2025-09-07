// lib/plans.ts
export type Role = "artist" | "curator" | "gallery" | "collector";

export type PlanId =
  | "artist_free" | "artist_basic" | "artist_pro"
  | "curator_free"
  | "gallery_basic" | "gallery_pro"
  | "collector_free";

export type Plan = {
  id: PlanId;
  name: string;
  monthly: number; // EUR / month
  bullets: string[];
};

export const PLANS_BY_ROLE: Record<Role, Plan[]> = {
  artist: [
    {
      id: "artist_free",
      name: "Free / Lite",
      monthly: 0,
      bullets: [
        "Public profile (Lite)",
        "1 artwork, 1 news",
        "Short AI bio",
        "1 social link (Instagram)",
        "No analytics, no boost",
      ],
    },
    {
      id: "artist_basic",
      name: "Basic",
      monthly: 10,
      bullets: [
        "Up to 3 artworks & 3 news",
        "AI bio (short + long) & meta",
        "Light analytics (views/referrers)",
        "Linked in city & discipline clusters",
      ],
    },
    {
      id: "artist_pro",
      name: "Pro",
      monthly: 20,
      bullets: [
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
      name: "Free",
      monthly: 0,
      bullets: ["Simple public profile", "Publish picks/news", "Get discovered"],
    },
  ],
  gallery: [
    {
      id: "gallery_basic",
      name: "Basic",
      monthly: 20,
      bullets: [
        "Show artists & shows",
        "Light analytics",
        "Appear in city/discipline clusters",
      ],
    },
    {
      id: "gallery_pro",
      name: "Pro",
      monthly: 40,
      bullets: [
        "Unlimited artists & shows",
        "Analytics Pro",
        "Network Content Boost",
      ],
    },
  ],
  collector: [
    {
      id: "collector_free",
      name: "Free",
      monthly: 0,
      bullets: ["Follow artists", "Save works", "Get updates"],
    },
  ],
};

export function getPlanById(id: PlanId): Plan | undefined {
  const roles: Role[] = ["artist", "curator", "gallery", "collector"];
  for (const r of roles) {
    const found = PLANS_BY_ROLE[r].find((p) => p.id === id);
    if (found) return found;
  }
  return undefined;
}
