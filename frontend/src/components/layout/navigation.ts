import type { ComponentType } from "react"
import type { SessionUser } from "../../services/auth"
import {
  canAccessDashboard,
  canManageArtistProfile,
  canManagePosts,
  canManageTiers,
  canManageUsers,
  isSuperAdmin,
} from "../../services/permissions"
import {
  IconArtist,
  IconDashboard,
  IconHome,
  IconMessages,
  IconPosts,
  IconProfile,
  IconSecurity,
  IconSettings,
  IconTier,
  IconUsers,
} from "../ui/Icons"

export type NavGroup = "primary" | "management" | "artist" | "account"

export interface NavigationItem {
  id: string
  label: string
  path: string
  icon: ComponentType<{ className?: string }>
  group: NavGroup
  /** End route matching: only exact match (used for Feed and Profile). */
  end?: boolean
  /** True when this item carries the global messaging unread badge. */
  badge?: boolean
  /** Shown in the mobile primary bottom navigation. */
  mobilePrimary?: boolean
}

export interface NavigationGroup {
  id: NavGroup
  label: string | null
  items: NavigationItem[]
}

export const NAV_GROUP_LABELS: Record<NavGroup, string> = {
  primary: "Principal",
  management: "Administração",
  artist: "Artista",
  account: "Conta",
}

export function getNavigationForUser(
  user: SessionUser | null,
): NavigationItem[] {
  const items: NavigationItem[] = []

  const add = (item: NavigationItem) => items.push(item)

  add({
    id: "feed",
    label: "Feed",
    path: "/",
    icon: IconHome,
    group: "primary",
    end: true,
    mobilePrimary: true,
  })

  if (user) {
    add({
      id: "messages",
      label: "Mensagens",
      path: "/messages",
      icon: IconMessages,
      group: "primary",
      badge: true,
      mobilePrimary: true,
    })
  }

  if (canAccessDashboard(user)) {
    add({
      id: "dashboard",
      label: "Dashboard",
      path: "/dashboard",
      icon: IconDashboard,
      group: "management",
      mobilePrimary: true,
    })
  }

  if (canManagePosts(user)) {
    add({
      id: "posts",
      label: "Posts",
      path: "/posts",
      icon: IconPosts,
      group: "management",
    })
  }

  if (canManageUsers(user)) {
    add({
      id: "users",
      label: "Usuários",
      path: "/users",
      icon: IconUsers,
      group: "management",
    })
  }

  if (canManageTiers(user)) {
    add({
      id: "tiers",
      label: "Tiers",
      path: "/tiers",
      icon: IconTier,
      group: "management",
    })
  }

  if (canManageArtistProfile(user)) {
    add({
      id: "artist-page",
      label: "Página da artista",
      path: "/artist-profile/edit",
      icon: IconArtist,
      group: "artist",
    })
  }

  if (isSuperAdmin(user)) {
    add({
      id: "system-artist",
      label: "Configurar artista",
      path: "/system/artist",
      icon: IconSettings,
      group: "artist",
    })
  }

  if (user) {
    add({
      id: "profile",
      label: "Perfil",
      path: "/profile",
      icon: IconProfile,
      group: "account",
      end: true,
      mobilePrimary: !canAccessDashboard(user),
    })
    add({
      id: "security",
      label: "Segurança",
      path: "/profile/security",
      icon: IconSecurity,
      group: "account",
    })
  }

  return items
}

export function groupNavigation(
  items: NavigationItem[],
): NavigationGroup[] {
  const groups: NavigationGroup[] = []

  for (const group of ["primary", "management", "artist", "account"] as const) {
    const grouped = items.filter((item) => item.group === group)

    if (grouped.length > 0) {
      groups.push({
        id: group,
        label: NAV_GROUP_LABELS[group],
        items: grouped,
      })
    }
  }

  return groups
}

export function mobilePrimaryNavigation(
  user: SessionUser | null,
): NavigationItem[] {
  return getNavigationForUser(user).filter((item) => item.mobilePrimary)
}

/**
 * Route-aware matching. Exact match when `end` is set; otherwise the item is
 * also active for nested child routes (e.g. `/posts/new` activates `/posts`).
 */
export function isPathActive(
  pathname: string,
  path: string,
  end?: boolean,
): boolean {
  if (end) {
    return pathname === path
  }

  return pathname === path || pathname.startsWith(`${path}/`)
}
