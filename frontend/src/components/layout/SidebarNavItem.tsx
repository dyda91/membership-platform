import { Link, useLocation } from "react-router-dom"
import type { ReactNode } from "react"

import UnreadBadge from "../messaging/UnreadBadge"
import { isPathActive } from "./navigation"

interface SidebarNavItemProps {
  label: string
  to: string
  icon: ReactNode
  end?: boolean
  collapsed?: boolean
  badgeCount?: number
  mobileLabel?: boolean
  onNavigate?: () => void
}

export default function SidebarNavItem({
  label,
  to,
  icon,
  end,
  collapsed = false,
  badgeCount = 0,
  mobileLabel = false,
  onNavigate,
}: SidebarNavItemProps) {
  const { pathname } = useLocation()
  const isActive = isPathActive(pathname, to, end)

  return (
    <li>
      <Link
        to={to}
        onClick={onNavigate}
        title={collapsed ? label : undefined}
        aria-label={collapsed && !mobileLabel ? label : undefined}
        aria-current={isActive ? "page" : undefined}
        className={[
          "group flex min-h-[44px] items-center gap-3 rounded-lg text-sm font-medium transition-colors motion-reduce:transition-none",
          collapsed ? "justify-center px-0 py-2" : "px-3 py-2",
          isActive
            ? "bg-primary-muted text-primary-foreground-muted"
            : "text-foreground-muted hover:bg-surface-muted hover:text-foreground",
        ].join(" ")}
      >
        <span className="relative flex shrink-0 items-center justify-center">
          {icon}
          {collapsed && badgeCount > 0 && (
            <span
              className="absolute -right-2 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold leading-none text-primary-foreground"
              aria-hidden="true"
            />
          )}
        </span>
        {(collapsed ? mobileLabel : true) && (
          <span className="min-w-0 flex-1 truncate text-left">{label}</span>
        )}
        {!collapsed && badgeCount > 0 && <UnreadBadge count={badgeCount} />}
      </Link>
    </li>
  )
}
