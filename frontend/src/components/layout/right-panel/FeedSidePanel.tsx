import { Link } from "react-router-dom"

import { useAuth } from "../../../contexts/AuthContext"
import { isArtist, isSuperAdmin } from "../../../services/permissions"
import type { FeedArtist } from "../../../services/feed"
import RightPanelCard from "./RightPanelCard"
import Avatar from "../../ui/Avatar"
import Button from "../../ui/Button"
import { IconSettings } from "../../ui/Icons"

interface FeedSidePanelProps {
  artist: FeedArtist
}

export default function FeedSidePanel({ artist }: FeedSidePanelProps) {
  const { user } = useAuth()
  const showEdit = user ? isArtist(user) || isSuperAdmin(user) : false

  return (
    <div className="space-y-4">
      <RightPanelCard title="Sobre a artista">
        {artist.configured ? (
          <>
            <div className="flex items-center gap-3">
              <Avatar
                url={artist.avatarUrl}
                name={artist.name}
                size="md"
                ariaLabel={artist.name ?? "Artista"}
              />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-foreground">
                  {artist.name ?? "Artista"}
                </p>
                {artist.bio && (
                  <p className="line-clamp-2 text-xs text-foreground-muted">
                    {artist.bio}
                  </p>
                )}
              </div>
            </div>

            {artist.contactActions.length > 0 && (
              <ul className="space-y-1">
                {artist.contactActions.map((action) => (
                  <li key={action.type}>
                    <a
                      href={action.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-sm font-medium text-foreground transition-colors hover:text-primary"
                    >
                      {action.type === "WHATSAPP" ? "WhatsApp" : "Discord"}
                    </a>
                  </li>
                ))}
              </ul>
            )}

            {showEdit && (
              <Link to="/artist-profile/edit">
                <Button variant="outline" size="sm" fullWidth icon={<IconSettings />}>
                  Editar perfil
                </Button>
              </Link>
            )}
          </>
        ) : (
          <p className="text-sm text-foreground-muted">
            A artista ainda não configurou o perfil público.
          </p>
        )}
      </RightPanelCard>

      <RightPanelCard title="Acesso por tier">
        <p>
          Posts e mídias podem ser liberados por tier. Cada tier desbloqueia o
          conteúdo correspondente ao seu acesso atual.
        </p>
      </RightPanelCard>
    </div>
  )
}
