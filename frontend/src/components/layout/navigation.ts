import type { SessionUser } from "../../services/auth"
import {
  canAccessDashboard,
  canManageArtistProfile,
  canManagePosts,
  canManageTiers,
  canManageUsers,
  isSuperAdmin,
} from "../../services/permissions"

export interface NavigationItem {
  label: string
  to: string
  end?: boolean
}

export function primaryNavigation(
  user: SessionUser | null,
): NavigationItem[] {
  const items: NavigationItem[] = [{ label: "Feed", to: "/", end: true }]

  if (!user) {
    return items
  }

  if (canAccessDashboard(user)) {
    items.push({ label: "Dashboard", to: "/dashboard" })
  }

  if (canManagePosts(user)) {
    items.push({ label: "Posts", to: "/posts" })
  }

  if (canManageUsers(user)) {
    items.push({ label: "Usuários", to: "/users" })
  }

  if (canManageTiers(user)) {
    items.push({ label: "Tiers", to: "/tiers" })
  }

  if (canManageArtistProfile(user)) {
    items.push({ label: "Página da artista", to: "/artist-profile/edit" })
  }

  if (isSuperAdmin(user)) {
    items.push({ label: "Configurar artista", to: "/system/artist" })
  }

  items.push({ label: "Perfil", to: "/profile" })

  return items
}
