// lib/plans.ts
export type Role = "artist" | "curator" | "gallery" | "collector";

export type AnalyticsLevel = "none" | "light" | "pro";

export interface Entitlements {
  canPublishProfile?: boolean;
  artworksLimit?: number | null; // null = unlimited
  newsLimit?: number | null;
  representedArtistsLimit?: number | null;
  analytics?: AnalyticsLevel;
  contentBoost?: boolean;
  allowAnnouncements?: boolean; // galleries
  allowCustomDomain?: boolean;  // addon available
}

export interface Plan {
  id: string;              // e.g. "artist_basic"
  role: Role;
  name: string;            // "Basic"
  priceMonthlyEUR: number; // 0 for free
  isFree: boolean;
  features: string[];      // short bullet copy for UI
  entitlements: Entitlements;
  addOns?: {
    customDomainEUR?: number; // +5 for artist basic/pro
  };
}

export const PLANS: Plan[] = [
  // Artists
  {
    id: "artist_free",
    role: "artist",
    name: "Free / Lite",
    priceMonthlyEUR: 0,
    isFree: true,
    features: [
      "Public profile (Lite)",
      "1 artwork, 1 news",
      "Short AI bio",
      "1 social link (Instagram)",
      "No analytics, no boost"
    ],
    entitlements: {
      canPublishProfile: true,
      artworksLimit: 1,
      newsLimit: 1,
      analytics: "none",
      contentBoost: false,
      allowCustomDomain: false
    }
  },
  {
    id: "artist_basic",
    role: "artist",
    name: "Basic",
    priceMonthlyEUR: 10,
    isFree: false,
    features: [
      "Up to 3 artworks & 3 news",
      "AI bio (short + long) & meta",
      "Light analytics (views/referrers)",
      "Linked in city & discipline clusters"
    ],
    entitlements: {
      canPublishProfile: true,
      artworksLimit: 3,
      newsLimit: 3,
      analytics: "light",
      contentBoost: false,
      allowCustomDomain: true
    },
    addOns: { customDomainEUR: 5 }
  },
  {
    id: "artist_pro",
    role: "artist",
    name: "Pro",
    priceMonthlyEUR: 20,
    isFree: false,
    features: [
      "Unlimited artworks & news",
      "Analytics Pro (trends/clusters)",
      "Network Content Boost",
      "AI portfolio PDF"
    ],
    entitlements: {
      canPublishProfile: true,
      artworksLimit: null,
      newsLimit: null,
      analytics: "pro",
      contentBoost: true,
      allowCustomDomain: true
    },
    addOns: { customDomainEUR: 5 }
  },

  // Curators (always free)
  {
    id: "curator_free",
    role: "curator",
    name: "Free",
    priceMonthlyEUR: 0,
    isFree: true,
    features: [
      "Curator profile (bio, links)",
      "Submit solo/group features",
      "Link artists & galleries",
      "Editorial review & publish"
    ],
    entitlements: { analytics: "none" }
  },

  // Galleries / Institutions
  {
    id: "gallery_lite",
    role: "gallery",
    name: "Lite",
    priceMonthlyEUR: 0,
    isFree: true,
    features: [
      "Gallery profile (name, city, website)",
      "1 show & 1 announcement",
      "Link up to 5 artists",
      "No analytics, no boost"
    ],
    entitlements: {
      representedArtistsLimit: 5,
      allowAnnouncements: true,
      analytics: "none",
      contentBoost: false
    }
  },
  {
    id: "gallery_pro",
    role: "gallery",
    name: "Pro",
    priceMonthlyEUR: 59,
    isFree: false,
    features: [
      "Unlimited shows & announcements",
      "Link unlimited artists",
      "Analytics Pro (page/artist clicks/show)",
      "Priority placement in city/program hubs"
    ],
    entitlements: {
      representedArtistsLimit: null,
      allowAnnouncements: true,
      analytics: "pro",
      contentBoost: true
    }
  },

  // Collectors
  {
    id: "collector_free",
    role: "collector",
    name: "Free",
    priceMonthlyEUR: 0,
    isFree: true,
    features: [
      "Set interests (discipline, city, budget)",
      "Save artists & works",
      "No alerts"
    ],
    entitlements: { analytics: "none" }
  },
  {
    id: "collector_plus",
    role: "collector",
    name: "Plus",
    priceMonthlyEUR: 9,
    isFree: false,
    features: [
      "Smart alerts",
      "Private boards & saved lists",
      "Discovery tools"
    ],
    entitlements: { analytics: "none" }
  }
];

export function getPlansByRole(role: Role): Plan[] {
  return PLANS.filter(p => p.role === role);
}

export function getPlanById(id: string): Plan | undefined {
  return PLANS.find(p => p.id === id);
}
