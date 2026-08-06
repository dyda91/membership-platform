import { useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"

import { useAuth } from "../../contexts/AuthContext"
import { isSuperAdmin } from "../../services/permissions"
import {
  displayName,
  getAccountContext,
  initials,
} from "./accountContext"
import {
  IconChevronsRight,
  IconLogout,
  IconProfile,
  IconSecurity,
  IconSettings,
} from "../ui/Icons"

interface AccountCardProps {
  collapsed?: boolean
}

export default function AccountCard({ collapsed = false }: AccountCardProps) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const triggerRef = useRef<HTMLButtonElement | null>(null)

  useEffect(() => {
    if (!open) {
      return
    }

    function handlePointerDown(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false)
      }
    }

    function handleEscape(event: globalThis.KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false)
        triggerRef.current?.focus()
      }
    }

    window.addEventListener("pointerdown", handlePointerDown)
    window.addEventListener("keydown", handleEscape)

    return () => {
      window.removeEventListener("pointerdown", handlePointerDown)
      window.removeEventListener("keydown", handleEscape)
    }
  }, [open])

  if (!user) {
    return null
  }

  const context = getAccountContext(user)
  const name = displayName(user)
  const showConfigureArtist = isSuperAdmin(user)

  const menuItems = [
    { label: "Perfil", to: "/profile", icon: <IconProfile /> },
    {
      label: "Segurança da conta",
      to: "/profile/security",
      icon: <IconSecurity />,
    },
    ...(showConfigureArtist
      ? [
          {
            label: "Configurar artista",
            to: "/system/artist",
            icon: <IconSettings />,
          },
        ]
      : []),
  ]

  function handleLogout() {
    setOpen(false)
    logout()
    navigate("/", { replace: true })
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className={[
          "flex w-full items-center gap-3 rounded-lg text-left transition-colors hover:bg-surface-muted focus-visible:outline-2 focus-visible:outline-primary",
          collapsed ? "justify-center px-0 py-2" : "px-2 py-2",
        ].join(" ")}
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-muted text-sm font-semibold text-primary-foreground-muted">
          {initials(user)}
        </span>

        {!collapsed && (
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-semibold text-foreground">
              {name}
            </span>
            <span className="block truncate text-xs text-foreground-muted">
              {context.title}
              {context.subtitle ? ` · ${context.subtitle}` : ""}
            </span>
          </span>
        )}

        {collapsed ? (
          <span className="sr-only">Abrir menu da conta</span>
        ) : (
          <IconChevronsRight className="shrink-0 text-foreground-muted" />
        )}
      </button>

      {open && (
        <div
          role="menu"
          aria-label="Menu da conta"
          className="absolute bottom-full left-0 z-50 mb-2 w-56 overflow-hidden rounded-xl border border-border bg-surface py-1 shadow-overlay"
        >
          <div className="border-b border-border px-3 py-2">
            <span className="block truncate text-sm font-semibold text-foreground">
              {name}
            </span>
            <span className="block truncate text-xs text-foreground-muted">
              {user.email}
            </span>
            <span className="mt-0.5 block truncate text-xs font-medium text-foreground-muted">
              {context.title}
              {context.subtitle ? ` · ${context.subtitle}` : ""}
            </span>
          </div>

          <div className="py-1">
            {menuItems.map((item) => (
              <button
                key={item.to}
                type="button"
                role="menuitem"
                onClick={() => {
                  setOpen(false)
                  navigate(item.to)
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-foreground-muted transition-colors hover:bg-surface-muted hover:text-foreground"
              >
                {item.icon}
                {item.label}
              </button>
            ))}
            <button
              type="button"
              role="menuitem"
              onClick={handleLogout}
              className="flex w-full items-center gap-2 border-t border-border px-3 py-2 text-sm text-foreground-muted transition-colors hover:bg-surface-muted hover:text-danger"
            >
              <IconLogout />
              Sair
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
