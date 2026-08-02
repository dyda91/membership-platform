import { Link, NavLink } from "react-router-dom"

import { useAuth } from "../../contexts/AuthContext"
import { primaryNavigation } from "./navigation"
import TierBadge from "../auth/TierBadge"
import IconButton from "../ui/IconButton"
import { buttonClasses } from "../ui/button-styles"
import { IconMenu } from "../ui/Icons"

interface HeaderProps {
  onOpenMobileNav: () => void
}

export default function Header({ onOpenMobileNav }: HeaderProps) {
  const { user, isAuthenticated, logout } = useAuth()
  const items = primaryNavigation(user)

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-2 px-4 sm:px-6">
        <Link
          to="/"
          className="flex min-w-0 shrink-0 items-center gap-2 font-semibold tracking-tight text-foreground"
        >
          Platform
        </Link>

        <nav
          aria-label="Navegação principal"
          className="hidden min-w-0 flex-1 items-center gap-1 overflow-x-auto lg:flex"
        >
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                [
                  "shrink-0 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary-muted text-primary-foreground-muted"
                    : "text-foreground-muted hover:bg-surface-muted hover:text-foreground",
                ].join(" ")
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="ml-auto flex min-w-0 items-center gap-2">
          {isAuthenticated ? (
            <>
              <TierBadge
                tier={user?.tier ?? null}
                accessStatus={user?.tierAccessStatus}
                expiresAt={user?.tierExpiresAt}
                permanent={user?.tierPermanent}
              />
              <span
                title={user?.email}
                className="hidden max-w-[180px] truncate text-sm text-foreground-muted md:inline"
              >
                {user?.email}
              </span>
              <button
                type="button"
                onClick={logout}
                className={buttonClasses("ghost", "sm")}
              >
                Sair
              </button>
            </>
          ) : (
            <>
              <Link
                to="/register"
                className={buttonClasses("ghost", "sm", "hidden sm:inline-flex")}
              >
                Criar conta
              </Link>
              <Link to="/login" className={buttonClasses("primary", "sm")}>
                Entrar
              </Link>
            </>
          )}
        </div>

        <IconButton
          label="Abrir menu de navegação"
          variant="ghost"
          icon={<IconMenu />}
          onClick={onOpenMobileNav}
          className="lg:hidden"
        />
      </div>
    </header>
  )
}
