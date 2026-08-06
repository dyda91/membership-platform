import { Link } from "react-router-dom"

import type { ManageArtistProfile } from "../../../services/artist-profile"
import RightPanelCard from "./RightPanelCard"
import Avatar from "../../ui/Avatar"
import Badge from "../../ui/Badge"
import { buttonClasses } from "../../ui/button-styles"

interface ArtistConfigSidePanelProps {
  profile: ManageArtistProfile
}

export default function ArtistConfigSidePanel({
  profile,
}: ArtistConfigSidePanelProps) {
  const channels = [
    profile.whatsappEnabled ? "WhatsApp" : null,
    profile.discordEnabled ? "Discord" : null,
  ].filter(Boolean) as string[]

  return (
    <div className="space-y-4">
      <RightPanelCard title="Prévia do perfil">
        {profile.bannerUrl && (
          <div className="-mx-4 -mt-4 mb-2 h-20 overflow-hidden">
            <img
              src={profile.bannerUrl}
              alt=""
              className="h-full w-full object-cover"
            />
          </div>
        )}
        <div className="flex items-center gap-3">
          <Avatar
            url={profile.avatarUrl}
            name={profile.name}
            size="md"
            ariaLabel={profile.name ?? "Artista"}
          />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-foreground">
              {profile.name ?? "Artista"}
            </p>
            {channels.length > 0 ? (
              <p className="flex flex-wrap gap-1">
                {channels.map((channel) => (
                  <Badge key={channel} variant="neutral">
                    {channel}
                  </Badge>
                ))}
              </p>
            ) : (
              <p className="text-xs text-foreground-muted">Sem canais habilitados.</p>
            )}
          </div>
        </div>
      </RightPanelCard>

      <Link to="/" className="block">
        <span className={buttonClasses("outline", "sm", "w-full justify-center")}>
          Abrir página pública
        </span>
      </Link>
    </div>
  )
}
