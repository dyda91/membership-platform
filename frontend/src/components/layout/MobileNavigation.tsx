import { useEffect, useRef, useState } from "react"
import type { KeyboardEvent } from "react"
import { Link, useLocation } from "react-router-dom"
import { createPortal } from "react-dom"

import { useAuth } from "../../contexts/AuthContext"
import { useMessagingUnread } from "../../contexts/MessagingUnreadContext"
import {
  getNavigationForUser,
  groupNavigation,
  isPathActive,
  mobilePrimaryNavigation,
} from "./navigation"
import { displayName, getAccountContext, initials } from "./accountContext"
import UnreadBadge from "../messaging/UnreadBadge"
import Button from "../ui/Button"
import IconButton from "../ui/IconButton"
import { IconClose, IconLogout, IconMore } from "../ui/Icons"

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'

export default function MobileNavigation() {
  const { user, isAuthenticated, logout } = useAuth()
  const { unreadCount } = useMessagingUnread()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const { pathname } = useLocation()

  if (!isAuthenticated || !user) {
    return null
  }

  const primary = mobilePrimaryNavigation(user)
  const allItems = getNavigationForUser(user)
  const groups = groupNavigation(allItems)
  const hasMore = allItems.some((item) => !item.mobilePrimary)

  return (
    <>
      <nav
        aria-label="Navegação principal"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface pb-[env(safe-area-inset-bottom)] lg:hidden"
      >
        <div
          className="mx-auto grid max-w-lg"
          style={{
            gridTemplateColumns: `repeat(${primary.length + (hasMore ? 1 : 0)}, minmax(0, 1fr))`,
          }}
        >
          {primary.map((item) => {
            const isActive = isPathActive(pathname, item.path, item.end)

            return (
              <Link
                key={item.id}
                to={item.path}
                aria-current={isActive ? "page" : undefined}
                className={[
                  "relative flex min-h-[56px] flex-col items-center justify-center gap-1 px-1 text-[11px] font-medium transition-colors motion-reduce:transition-none",
                  isActive ? "text-foreground" : "text-foreground-muted hover:text-foreground",
                ].join(" ")}
              >
                <span className="relative">
                  <item.icon className="h-6 w-6" />
                  {item.badge && unreadCount > 0 && (
                    <span className="absolute -right-2 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold leading-none text-primary-foreground">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}
                </span>
                <span>{item.label}</span>
                {item.badge && unreadCount > 0 && (
                  <span className="sr-only">
                    {unreadCount > 99 ? "99+" : unreadCount} mensagens não lidas
                  </span>
                )}
              </Link>
            )
          })}

          {hasMore && (
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              className={[
                "flex min-h-[56px] flex-col items-center justify-center gap-1 px-1 text-[11px] font-medium transition-colors hover:text-foreground",
                drawerOpen ? "text-foreground" : "text-foreground-muted",
              ].join(" ")}
            >
              <IconMore className="h-6 w-6" />
              <span>Mais</span>
            </button>
          )}
        </div>
      </nav>

      {drawerOpen && (
        <MobileMoreDrawer
          groups={groups}
          user={user}
          unreadCount={unreadCount}
          logout={logout}
          onClose={() => setDrawerOpen(false)}
        />
      )}
    </>
  )
}

interface MobileMoreDrawerProps {
  groups: ReturnType<typeof groupNavigation>
  user: NonNullable<ReturnType<typeof useAuth>["user"]>
  unreadCount: number
  logout: () => void
  onClose: () => void
}

function MobileMoreDrawer({
  groups,
  user,
  unreadCount,
  logout,
  onClose,
}: MobileMoreDrawerProps) {
  const panelRef = useRef<HTMLDivElement | null>(null)
  const closeRef = useRef<HTMLButtonElement | null>(null)

  useEffect(() => {
    closeRef.current?.focus()

    function handleEscape(event: globalThis.KeyboardEvent) {
      if (event.key === "Escape") {
        onClose()
      }
    }

    window.addEventListener("keydown", handleEscape)

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"

    return () => {
      window.removeEventListener("keydown", handleEscape)
      document.body.style.overflow = previousOverflow
    }
  }, [onClose])

  function handleTab(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key !== "Tab") {
      return
    }

    const panel = panelRef.current

    if (!panel) {
      return
    }

    const focusables = Array.from(
      panel.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
    )

    if (focusables.length === 0) {
      return
    }

    const first = focusables[0]
    const last = focusables[focusables.length - 1]
    const active = document.activeElement as HTMLElement | null

    if (event.shiftKey) {
      if (active === first || !panel.contains(active)) {
        event.preventDefault()
        last.focus()
      }
    } else if (active === last || !panel.contains(active)) {
      event.preventDefault()
      first.focus()
    }
  }

  const context = getAccountContext(user)
  const name = displayName(user)
  const { pathname } = useLocation()

  return createPortal(
    <div className="fixed inset-0 z-50 lg:hidden">
      <div
        className="absolute inset-0 bg-black/50"
        aria-hidden="true"
        onClick={onClose}
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Mais opções"
        onKeyDown={handleTab}
        className="absolute inset-x-0 bottom-0 flex max-h-[85dvh] flex-col rounded-t-2xl border-t border-border bg-surface shadow-overlay"
      >
        <div className="flex h-14 shrink-0 items-center justify-between border-b border-border px-4">
          <span className="text-sm font-semibold tracking-tight text-foreground">
            Platform
          </span>
          <IconButton
            ref={closeRef}
            label="Fechar menu"
            variant="ghost"
            icon={<IconClose />}
            onClick={onClose}
          />
        </div>

        <nav
          aria-label="Mais opções"
          className="min-h-0 flex-1 overflow-y-auto px-3 py-3"
        >
          <ul className="space-y-1">
            {groups.map((group) => (
              <li key={group.id}>
                <p className="px-3 pb-1 pt-3 text-[11px] font-semibold uppercase tracking-wide text-foreground-muted">
                  {group.label}
                </p>
                <ul className="space-y-1">
                  {group.items.map((item) => {
                    const isActive = isPathActive(pathname, item.path, item.end)

                    return (
                      <li key={item.id}>
                        <Link
                          to={item.path}
                          onClick={onClose}
                          aria-current={isActive ? "page" : undefined}
                          className={[
                            "flex min-h-[44px] items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors motion-reduce:transition-none",
                            isActive
                              ? "bg-primary-muted text-primary-foreground-muted"
                              : "text-foreground-muted hover:bg-surface-muted hover:text-foreground",
                          ].join(" ")}
                        >
                          <item.icon className="h-5 w-5 shrink-0" />
                          <span className="min-w-0 flex-1 truncate text-left">
                            {item.label}
                          </span>
                          {item.badge && unreadCount > 0 && (
                            <UnreadBadge count={unreadCount} />
                          )}
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              </li>
            ))}
          </ul>
        </nav>

        <div className="shrink-0 border-t border-border p-3">
          <div className="flex min-w-0 items-center gap-3 px-1 pb-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-muted text-sm font-semibold text-primary-foreground-muted">
              {initials(user)}
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold text-foreground">
                {name}
              </span>
              <span className="block truncate text-xs text-foreground-muted">
                {context.title}
                {context.subtitle ? ` · ${context.subtitle}` : ""}
              </span>
            </span>
          </div>
          <Button
            variant="outline"
            fullWidth
            icon={<IconLogout />}
            onClick={() => {
              onClose()
              logout()
            }}
          >
            Sair
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
