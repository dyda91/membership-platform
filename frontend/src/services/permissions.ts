import type { SessionUser } from "../services/auth"
import type { Role } from "../services/users"

export function hasRole(
  user: SessionUser | null,
  role: Role,
): boolean {
  return user?.roles.includes(role) ?? false
}

export function canAccessDashboard(user: SessionUser | null): boolean {
  return hasRole(user, "SUPER_ADMIN") || hasRole(user, "ARTIST")
}

export function canManagePosts(user: SessionUser | null): boolean {
  return canAccessDashboard(user)
}

export function canManageUsers(user: SessionUser | null): boolean {
  return canAccessDashboard(user)
}

export function canManageTiers(user: SessionUser | null): boolean {
  return canAccessDashboard(user)
}

export function canManageArtistProfile(user: SessionUser | null): boolean {
  return canAccessDashboard(user)
}

export function isSuperAdmin(user: SessionUser | null): boolean {
  return hasRole(user, "SUPER_ADMIN")
}

export function isArtist(user: SessionUser | null): boolean {
  return hasRole(user, "ARTIST")
}
