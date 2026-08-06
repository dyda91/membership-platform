import { Link, useLocation } from "react-router-dom"

import { useAuth } from "../../../contexts/AuthContext"
import { displayName, getAccountContext, initials } from "../accountContext"
import { isPathActive } from "../navigation"
import RightPanelCard from "./RightPanelCard"
import { buttonClasses } from "../../ui/button-styles"

export default function AccountSidePanel() {
  const { user } = useAuth()
  const { pathname } = useLocation()

  if (!user) {
    return null
  }

  const context = getAccountContext(user)
  const onProfile = isPathActive(pathname, "/profile", true)
  const onSecurity = isPathActive(pathname, "/profile/security")

  return (
    <div className="space-y-4">
      <RightPanelCard title="Sua conta">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-muted text-sm font-semibold text-primary-foreground-muted">
            {initials(user)}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-foreground">
              {displayName(user)}
            </p>
            <p className="truncate text-xs text-foreground-muted">
              {context.title}
              {context.subtitle ? ` · ${context.subtitle}` : ""}
            </p>
          </div>
        </div>
      </RightPanelCard>

      <RightPanelCard title="Navegação">
        <div className="space-y-1">
          <Link
            to="/profile"
            aria-current={onProfile ? "page" : undefined}
            className="block rounded-md px-2 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-surface-muted"
          >
            Perfil
          </Link>
          <Link
            to="/profile/security"
            aria-current={onSecurity ? "page" : undefined}
            className="block rounded-md px-2 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-surface-muted"
          >
            Segurança da conta
          </Link>
        </div>
      </RightPanelCard>

      <RightPanelCard title="Senha e sessões">
        <p>
          Use uma senha forte e troque-a se suspeitar de uso não autorizado.
          Você pode encerrar todas as sessões ativas pela página de segurança.
        </p>
        <Link to="/profile/security" className={buttonClasses("ghost", "sm")}>
          Ir para segurança
        </Link>
      </RightPanelCard>
    </div>
  )
}
