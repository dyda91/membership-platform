import type { ReactNode } from "react"

import { isPathActive } from "../navigation"
import AccountSidePanel from "./AccountSidePanel"
import DashboardSidePanel from "./DashboardSidePanel"
import PostsSidePanel from "./PostsSidePanel"
import TiersSidePanel from "./TiersSidePanel"
import UsersSidePanel from "./UsersSidePanel"

/**
 * Static right-panel content resolved from the current route. Pages that hold
 * richer data (Feed artist, selected conversation, artist profile) publish
 * their own panel through the right-panel context instead.
 */
export function getRightPanelForRoute(pathname: string): ReactNode | null {
  if (isPathActive(pathname, "/posts")) {
    return <PostsSidePanel />
  }

  if (isPathActive(pathname, "/users")) {
    return <UsersSidePanel />
  }

  if (isPathActive(pathname, "/tiers")) {
    return <TiersSidePanel />
  }

  if (isPathActive(pathname, "/dashboard")) {
    return <DashboardSidePanel />
  }

  if (isPathActive(pathname, "/profile")) {
    return <AccountSidePanel />
  }

  return null
}
