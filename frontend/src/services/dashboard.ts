import api from "./api"

export interface DashboardSummary {
  visibleUsers: number
  publishedPosts: number
  draftPosts: number
  archivedPosts: number
  tiers: number
  activeAccess: number
  expiringSoonAccess: number
  expiredAccess: number
  permanentAccess: number
  scheduledAccess: number
  revokedAccess: number
}

export async function fetchDashboardSummary(): Promise<DashboardSummary> {
  const response = await api.get<DashboardSummary>("/dashboard/summary")

  return response.data
}
