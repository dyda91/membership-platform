import { Link } from "react-router-dom"

import type { FeedArtist } from "../../services/feed"
import { useAuth } from "../../contexts/AuthContext"
import Avatar from "../ui/Avatar"
import ArtistContactActions from "./ArtistContactActions"
import { buttonClasses } from "../ui/button-styles"

interface PublicArtistProfileProps {
  artist: FeedArtist
}

export default function PublicArtistProfile({
  artist,
}: PublicArtistProfileProps) {
  const { canManageContent } = useAuth()

  return (
    <section
      aria-label="Perfil da artista"
      className="overflow-hidden rounded-xl border border-border bg-surface shadow-card"
    >
      <div className="relative">
        <div className="aspect-[3/1] w-full sm:aspect-[4/1]">
          {artist.bannerUrl ? (
            <img
              src={artist.bannerUrl}
              alt=""
              className="h-full w-full object-cover object-center"
            />
          ) : (
            <div
              aria-hidden="true"
              className="h-full w-full bg-gradient-to-b from-surface-muted to-background"
            />
          )}
        </div>

        <div className="absolute -bottom-10 left-4 sm:-bottom-12 sm:left-6">
          <div className="rounded-full border-4 border-surface bg-surface shadow-card">
            <Avatar
              url={artist.avatarUrl}
              name={artist.name}
              size="xl"
              ariaLabel={artist.name ?? "Avatar da artista"}
            />
          </div>
        </div>
      </div>

      <div className="px-4 pb-5 pt-12 sm:px-6 sm:pt-14">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              {artist.name ?? "Artista"}
            </h1>

            {artist.bio && (
              <p className="mt-1 text-sm text-foreground-muted">{artist.bio}</p>
            )}
          </div>

          {canManageContent && (
            <div className="flex shrink-0 items-center gap-2">
              <Link
                to="/artist-profile/edit"
                className={buttonClasses("ghost", "sm")}
              >
                Editar perfil
              </Link>
            </div>
          )}
        </div>

        {artist.presentationText && (
          <p className="mt-3 whitespace-pre-wrap text-foreground">
            {artist.presentationText}
          </p>
        )}

        <ArtistContactActions actions={artist.contactActions} />
      </div>
    </section>
  )
}
