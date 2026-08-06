import { Link } from "react-router-dom"

import { useAuth } from "../../../contexts/AuthContext"
import { isArtist, isSuperAdmin } from "../../../services/permissions"
import RightPanelCard from "./RightPanelCard"
import Avatar from "../../ui/Avatar"
import Badge from "../../ui/Badge"
import Button from "../../ui/Button"
import { accessStatusVariant } from "../../ui/status-labels"
import { IconUsers } from "../../ui/Icons"

export interface ConversationPanelDetail {
  memberId: string
  artist: { name: string | null }
  member: { name: string | null; email?: string }
  memberEffectiveTier?: { id: string; name: string; priority: number } | null
  accessStatus?: string
  accessExpiresAt?: string | null
  accessPermanent?: boolean
  memberUnread?: number
}

interface ConversationSidePanelProps {
  detail: ConversationPanelDetail | null
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("pt-BR")
}

export default function ConversationSidePanel({
  detail,
}: ConversationSidePanelProps) {
  const { user } = useAuth()

  if (!detail) {
    return (
      <RightPanelCard title="Conversa">
        <p>Selecione uma conversa para ver os detalhes do membro.</p>
      </RightPanelCard>
    )
  }

  const viewerIsMember = user ? detail.memberId === user.id : false
  const viewerIsAdmin = user ? isArtist(user) || isSuperAdmin(user) : false

  if (viewerIsMember) {
    return (
      <RightPanelCard title="Artista">
        <div className="flex items-center gap-3">
          <Avatar url={null} name={detail.artist.name} size="md" ariaLabel={detail.artist.name ?? "Artista"} />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-foreground">
              {detail.artist.name ?? "Artista"}
            </p>
            <p className="text-xs text-foreground-muted">Artista</p>
          </div>
        </div>
      </RightPanelCard>
    )
  }

  return (
    <div className="space-y-4">
      <RightPanelCard title="Membro">
        <div className="flex items-center gap-3">
          <Avatar url={null} name={detail.member.name} size="md" ariaLabel={detail.member.name ?? "Membro"} />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-foreground">
              {detail.member.name ?? "Membro"}
            </p>
            {detail.member.email && (
              <p className="truncate text-xs text-foreground-muted">
                {detail.member.email}
              </p>
            )}
          </div>
        </div>
      </RightPanelCard>

      <RightPanelCard title="Acesso">
        {detail.memberEffectiveTier ? (
          <>
            <div className="flex items-center gap-2">
              <Badge variant="primary">{detail.memberEffectiveTier.name}</Badge>
              <Badge variant={accessStatusVariant(detail.accessStatus ?? "ACTIVE")}>
                {detail.accessStatus === "EXPIRED"
                  ? "Expirado"
                  : detail.accessStatus === "PERMANENT"
                    ? "Permanente"
                    : detail.accessStatus ?? "Ativo"}
              </Badge>
            </div>
            {detail.accessPermanent ? (
              <p>Acesso permanente.</p>
            ) : detail.accessExpiresAt ? (
              <p>Válido até {formatDate(detail.accessExpiresAt)}.</p>
            ) : (
              <p>Sem validade definida.</p>
            )}
          </>
        ) : (
          <p>Membro sem tier atribuído (acesso gratuito).</p>
        )}
        {(detail.memberUnread ?? 0) > 0 && (
          <p className="text-foreground">
            {detail.memberUnread}{" "}
            {detail.memberUnread === 1
              ? "mensagem não lida"
              : "mensagens não lidas"}{" "}
            do membro.
          </p>
        )}
      </RightPanelCard>

      {viewerIsAdmin && (
        <Link to={`/users?search=${encodeURIComponent(detail.member.email ?? "")}`}>
          <Button variant="outline" size="sm" fullWidth icon={<IconUsers />}>
            Gerenciar membro
          </Button>
        </Link>
      )}
    </div>
  )
}
