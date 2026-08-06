import { useEffect, useRef, useState } from "react"
import type { KeyboardEvent } from "react"
import { Link, NavLink } from "react-router-dom"
import { createPortal } from "react-dom"

import IconButton from "../ui/IconButton"
import { buttonClasses } from "../ui/button-styles"
import { IconClose, IconMenu } from "../ui/Icons"

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'

const PUBLIC_ITEMS = [
  { label: "Feed", to: "/", end: true },
  { label: "Criar conta", to: "/register", end: false },
  { label: "Entrar", to: "/login", end: false },
]

export default function PublicHeader() {
  const [open, setOpen] = useState(false)
  const panelRef = useRef<HTMLDivElement | null>(null)
  const closeRef = useRef<HTMLButtonElement | null>(null)

  useEffect(() => {
    if (!open) {
      return
    }

    closeRef.current?.focus()

    function handleEscape(event: globalThis.KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false)
      }
    }

    window.addEventListener("keydown", handleEscape)

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"

    return () => {
      window.removeEventListener("keydown", handleEscape)
      document.body.style.overflow = previousOverflow
    }
  }, [open])

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

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-border bg-surface/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-2 px-4 sm:px-6">
          <Link
            to="/"
            className="flex min-w-0 items-center gap-2 font-semibold tracking-tight text-foreground"
          >
            Platform
          </Link>

          <div className="ml-auto flex min-w-0 items-center gap-2">
            <Link
              to="/register"
              className={buttonClasses("ghost", "sm", "hidden sm:inline-flex")}
            >
              Criar conta
            </Link>
            <Link to="/login" className={buttonClasses("primary", "sm")}>
              Entrar
            </Link>
            <IconButton
              label="Abrir menu de navegação"
              variant="ghost"
              icon={<IconMenu />}
              onClick={() => setOpen(true)}
              className="sm:hidden"
            />
          </div>
        </div>
      </header>

      {open &&
        createPortal(
          <div className="fixed inset-0 z-50 sm:hidden">
            <div
              className="absolute inset-0 bg-black/50"
              aria-hidden="true"
              onClick={() => setOpen(false)}
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
                  onClick={() => setOpen(false)}
                />
              </div>

              <nav
                aria-label="Menu de navegação"
                className="flex-1 overflow-y-auto px-3 py-4"
              >
                <ul className="space-y-1">
                  {PUBLIC_ITEMS.map((item) => (
                    <li key={item.to}>
                      <NavLink
                        to={item.to}
                        end={item.end}
                        onClick={() => setOpen(false)}
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
            </div>
          </div>,
          document.body,
        )}
    </>
  )
}
