import api from "./api"
import type { User } from "./users"

export type TierAccessStatus =
  | "NONE"
  | "SCHEDULED"
  | "ACTIVE"
  | "EXPIRING_SOON"
  | "EXPIRED"
  | "REVOKED"
  | "PERMANENT"

export interface TierAccessSummary {
  status: TierAccessStatus
  tier: { id: string; name: string; priority: number } | null
  startsAt: string | null
  expiresAt: string | null
  permanent: boolean
  expiringSoon: boolean
}

export interface TierAccessHistoryEvent {
  id: string
  assignmentId: string
  userId: string
  action:
    | "GRANTED"
    | "RENEWED"
    | "TIER_CHANGED"
    | "DATES_CHANGED"
    | "REVOKED"
    | "RESTORED"
    | "MIGRATED"
  previousTierId: string | null
  newTierId: string | null
  previousStartsAt: string | null
  newStartsAt: string | null
  previousExpiresAt: string | null
  newExpiresAt: string | null
  actorId: string | null
  internalNote: string | null
  createdAt: string
  previousTier: { id: string; name: string } | null
  newTier: { id: string; name: string } | null
  actor: { id: string; email: string; name: string | null } | null
}

export interface GrantTierAccessData {
  tierId: string
  startsAt: string
  expiresAt?: string | null
  permanent?: boolean
  internalNote?: string
}

export interface RenewTierAccessData {
  expiresAt: string
  permanent?: boolean
  internalNote?: string
}

export interface UpdateTierAccessData {
  tierId?: string
  startsAt?: string
  expiresAt?: string | null
  permanent?: boolean
  internalNote?: string
}

export async function fetchTierAccess(userId: string) {
  const response = await api.get<TierAccessSummary>(
    `/users/${userId}/tier-access`,
  )

  return response.data
}

export async function grantTierAccess(userId: string, data: GrantTierAccessData) {
  const response = await api.post<{ assignment: unknown; event: TierAccessHistoryEvent }>(
    `/users/${userId}/tier-access`,
    data,
  )

  return response.data
}

export async function renewTierAccess(userId: string, data: RenewTierAccessData) {
  const response = await api.post<{ assignment: unknown; event: TierAccessHistoryEvent }>(
    `/users/${userId}/tier-access/renew`,
    data,
  )

  return response.data
}

export async function updateTierAccess(userId: string, data: UpdateTierAccessData) {
  const response = await api.patch<{ assignment: unknown; event: TierAccessHistoryEvent }>(
    `/users/${userId}/tier-access`,
    data,
  )

  return response.data
}

export async function revokeTierAccess(userId: string, internalNote?: string) {
  const response = await api.post<{ assignment: unknown; event: TierAccessHistoryEvent }>(
    `/users/${userId}/tier-access/revoke`,
    { internalNote },
  )

  return response.data
}

export async function fetchTierAccessHistory(userId: string) {
  const response = await api.get<TierAccessHistoryEvent[]>(
    `/users/${userId}/tier-access/history`,
  )

  return response.data
}

export function applyAccessToUser(user: User, access: TierAccessSummary): User {
  return {
    ...user,
    tier: access.tier,
    tierId: access.tier?.id ?? null,
    tierAccess: access,
  }
}
