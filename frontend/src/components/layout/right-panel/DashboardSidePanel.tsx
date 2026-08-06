import { Link } from "react-router-dom"

import { useMessagingUnread } from "../../../contexts/MessagingUnreadContext"
import type { DashboardSummary } from "../../../services/dashboard"
import RightPanelCard from "./RightPanelCard"
import { buttonClasses } from "../../ui/button-styles"
import { IconPosts, IconUsers, IconTier, IconArtist, IconMessages } from "../../ui/Icons"

const SHORTCUTS = [
  { to: "/posts/new", label: "Criar post", icon: <IconPosts /> },
  { to: "/users", label: "Gerenciar usuários", icon: <IconUsers /> },
  { to: "/tiers", label: "Gerenciar tiers", icon: <IconTier /> },
  { to: "/artist-profile/edit", label: "Configurar artista", icon: <IconArtist /> },
]

interface DashboardSidePanelProps {
  summary?: DashboardSummary | null
  loading?: boolean
}

export default function DashboardSidePanel({
  summary,
  loading,
}: DashboardSidePanelProps) {
  const { unreadCount } = useMessagingUnread()

  return (
    <div className="space-y-4">
      <RightPanelCard title="Atalhos">
        <ul className="space-y-1">
          {SHORTCUTS.map((item) => (
            <li key={item.to}>
              <Link
                to={item.to}
                className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-surface-muted hover:text-foreground"
              >
                {item.icon}
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </RightPanelCard>

      <RightPanelCard title="Mensagens">
        <div className="flex items-center gap-2">
          <IconMessages />
          <span>
            {unreadCount > 0 ? (
              <span className="font-semibold text-foreground">
                {unreadCount > 99 ? "99+" : unreadCount}{" "}
                {unreadCount === 1 ? "mensagem não lida" : "mensagens não lidas"}
              </span>
            ) : (
              "Nenhuma mensagem não lida."
            )}
          </span>
        </div>
        <Link to="/messages" className={buttonClasses("ghost", "sm")}>
          Abrir mensagens
        </Link>
      </RightPanelCard>

      {!loading && summary && summary.expiringSoonAccess > 0 && (
        <RightPanelCard title="Acessos expirando">
          <p>
            {summary.expiringSoonAccess}{" "}
            {summary.expiringSoonAccess === 1
              ? "acesso expira em breve"
              : "acessos expiram em breve"}
            . Revise os membros no gerenciamento.
          </p>
        </RightPanelCard>
      )}
    </div>
  )
}
