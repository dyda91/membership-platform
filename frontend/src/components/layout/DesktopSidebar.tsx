import { useEffect, useState } from "react"
import { Link } from "react-router-dom"

import { useAuth } from "../../contexts/AuthContext"
import { useMessagingUnread } from "../../contexts/MessagingUnreadContext"
import { useMediaQuery } from "../../hooks/useMediaQuery"
import {
  getNavigationForUser,
  groupNavigation,
} from "./navigation"
import SidebarNavItem from "./SidebarNavItem"
import AccountCard from "./AccountCard"
import {
  IconChevronsLeft,
  IconChevronsRight,
  IconHome,
} from "../ui/Icons"

const COLLAPSE_KEY = "sidebarCollapsed"

export default function DesktopSidebar() {
  const { user } = useAuth()
  const { unreadCount } = useMessagingUnread()
  const isXl = useMediaQuery("(min-width: 1280px)")
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window === "undefined") {
      return false
    }

    return window.localStorage.getItem(COLLAPSE_KEY) === "1"
  })

  useEffect(() => {
    window.localStorage.setItem(COLLAPSE_KEY, collapsed ? "1" : "0")
  }, [collapsed])

  const compact = !isXl || collapsed
  const groups = groupNavigation(getNavigationForUser(user))

  if (!user) {
    return null
  }

  return (
    <aside
      aria-label="Navegação principal"
      className={[
        "sticky top-0 hidden h-[100dvh] shrink-0 flex-col border-r border-border bg-surface transition-[width] motion-reduce:transition-none lg:flex",
        compact ? "lg:w-[76px]" : "lg:w-64",
      ].join(" ")}
    >
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="flex h-16 shrink-0 items-center border-b border-border px-3">
          <Link
            to="/"
            aria-label="Ir para o Feed"
            className="flex min-w-0 items-center gap-2 rounded-md px-2 py-1.5 font-semibold tracking-tight text-foreground transition-colors hover:bg-surface-muted focus-visible:outline-2 focus-visible:outline-primary"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <IconHome className="h-5 w-5" />
            </span>
            {!compact && (
              <span className="min-w-0 truncate">Platform</span>
            )}
          </Link>
        </div>

        <nav
          aria-label="Navegação da plataforma"
          className="min-h-0 flex-1 overflow-y-auto px-3 py-3"
        >
          <ul className="space-y-1">
            {groups.map((group) => (
              <li key={group.id} className={compact ? "" : "mt-2 first:mt-0"}>
                {!compact && group.label && (
                  <p className="px-3 pb-1 pt-3 text-[11px] font-semibold uppercase tracking-wide text-foreground-muted">
                    {group.label}
                  </p>
                )}
                <ul className="space-y-1">
                  {group.items.map((item) => (
                    <SidebarNavItem
                      key={item.id}
                      label={item.label}
                      to={item.path}
                      icon={<item.icon className="h-5 w-5" />}
                      end={item.end}
                      collapsed={compact}
                      badgeCount={item.badge ? unreadCount : 0}
                    />
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </nav>

        <div className="shrink-0 border-t border-border p-2">
          <AccountCard collapsed={compact} />
          {isXl && (
            <button
              type="button"
              onClick={() => setCollapsed((value) => !value)}
              className="mt-1 flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-foreground-muted transition-colors hover:bg-surface-muted hover:text-foreground"
            >
              {collapsed ? (
                <>
                  <IconChevronsRight className="h-5 w-5" />
                  <span>Expandir</span>
                </>
              ) : (
                <>
                  <IconChevronsLeft className="h-5 w-5" />
                  <span>Recolher</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </aside>
  )
}
