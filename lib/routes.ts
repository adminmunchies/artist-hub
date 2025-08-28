// app/lib/routes.ts

// Single source of truth for URLs
type Id = string;

export const routes = {
  // Public / misc
  home: (): string => "/",
  login: (): string => "/login",
  logout: (): string => "/auth/signout",
  debugAuth: (): string => "/auth/debug",

  // Public lists
  artistsIndex: (): string => "/artists",
  artists: (): string => "/artists",
  publicWorksIndex: (): string => "/w",
  worksIndex: (): string => "/works",
  works: (): string => "/works",

  // Public details
  publicArtist: (artistId: Id): string => `/a/${artistId}`,
  artistPublic: (artistId: Id): string => `/a/${artistId}`, // alias
  artist: (artistId: Id): string => `/a/${artistId}`,       // alias
  publicWork: (workId: Id): string => `/w/${workId}`,
  workPublic: (workId: Id): string => `/w/${workId}`,       // alias

  // Dashboard
  dashboard: (): string => "/dashboard",
  dashboardProfile: (): string => "/dashboard/profile",
  dashboardSettings: (): string => "/dashboard/settings",
  dashboardExhibitions: (): string => "/dashboard/exhibitions", // legacy
  dashboardNews: (): string => "/dashboard/news",
  dashboardAdmin: (): string => "/dashboard/admin",            // ⬅️ neu

  // Dashboard works
  dashboardWorks: (): string => "/dashboard/works",
  dashboardWorkNew: (): string => "/dashboard/works/new",
  dashboardWork: (id: Id): string => `/dashboard/works/${id}`,
  dashboardWorkEdit: (id: Id): string => `/dashboard/works/${id}/edit`,

  // Legacy/UI outside dashboard
  work: (id: Id): string => `/works/${id}`,
  workEdit: (id: Id): string => `/works/${id}/edit`,
  workImage: (id: Id): string => `/works/${id}/image`,
  replaceWorkImage: (id: Id): string => `/works/${id}/image`, // alias
} as const;

export default routes;
