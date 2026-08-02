import { useEffect, useRef } from "react"
import type { KeyboardEvent } from "react"
import { Link, NavLink } from "react-router-dom"
import { createPortal } from "react-dom"

import { useAuth } from "../../contexts/AuthContext"
import { primaryNavigation } from "./navigation"
import TierBadge from "../auth/TierBadge"
import IconButton from "../ui/IconButton"
import Button from "../ui/Button"
import { IconClose, IconLogout } from "../ui/Icons"

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'

interface MobileNavigationProps {
  open: boolean
  onClose: () => void
}

export default function MobileNavigation({
  open,
  onClose,
}: MobileNavigationProps) {
  const { user, isAuthenticated, logout } = useAuth()
  const panelRef = useRef<HTMLDivElement | null>(null)
  const closeRef = useRef<HTMLButtonElement | null>(null)

  useEffect(() => {
    if (!open) {
      return
    }

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
  }, [open, onClose])

  if (!open) {
    return null
  }

  const items = primaryNavigation(user)

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
        aria-label="Menu de navegação"
        onKeyDown={handleTab}
        className="absolute inset-y-0 right-0 flex w-full max-w-xs flex-col bg-surface shadow-overlay"
      >
        <div className="flex h-16 items-center justify-between border-b border-border px-4">
          <span className="font-semibold tracking-tight text-foreground">
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
          aria-label="Menu de navegação"
          className="flex-1 overflow-y-auto px-3 py-4"
        >
          <ul className="space-y-1">
            {items.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.end}
                  onClick={onClose}
                  className={({ isActive }) =>
                    [
                      "flex min-h-[44px] items-center rounded-md px-3 py-2 text-base font-medium transition-colors",
                      isActive
                        ? "bg-primary-muted text-primary-foreground-muted"
                        : "text-foreground-muted hover:bg-surface-muted hover:text-foreground",
                    ].join(" ")
                  }
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="border-t border-border px-4 py-4">
          {isAuthenticated ? (
            <div className="space-y-3">
              <div className="flex min-w-0 items-center justify-between gap-2">
                <span
                  title={user?.email}
                  className="min-w-0 truncate text-sm text-foreground-muted"
                >
                  {user?.email}
                </span>
                <TierBadge
                  tier={user?.tier ?? null}
                  accessStatus={user?.tierAccessStatus}
                  expiresAt={user?.tierExpiresAt}
                  permanent={user?.tierPermanent}
                />
              </div>
              <Button
                variant="outline"
                fullWidth
                icon={<IconLogout />}
                onClick={logout}
              >
                Sair
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <Link
                to="/register"
                onClick={onClose}
                className="inline-flex min-h-[44px] items-center justify-center rounded-md px-4 text-sm font-medium text-foreground-muted transition-colors hover:bg-surface-muted hover:text-foreground"
              >
                Criar conta
              </Link>
              <Link
                to="/login"
                onClick={onClose}
                className="inline-flex min-h-[44px] items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover"
              >
                Entrar
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body,
  )
}
