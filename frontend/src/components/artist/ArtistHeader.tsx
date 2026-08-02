import type { FeedArtist } from "../../services/feed"
import ArtistAvatar from "./ArtistAvatar"
import ArtistBanner from "./ArtistBanner"
import ArtistContactActions from "./ArtistContactActions"
import Card from "../ui/Card"

interface ArtistHeaderProps {
  artist: FeedArtist
}

export default function ArtistHeader({ artist }: ArtistHeaderProps) {
  return (
    <Card className="overflow-hidden">
      <ArtistBanner url={artist.bannerUrl} />

      <div className="p-6">
        <div className="flex items-start gap-4">
          <ArtistAvatar url={artist.avatarUrl} name={artist.name} />

          <div className="min-w-0 flex-1">
            <h2 className="text-2xl font-bold text-foreground">
              {artist.name ?? "Artista"}
            </h2>

            {artist.bio && (
              <p className="mt-1 text-sm text-foreground-muted">{artist.bio}</p>
            )}
          </div>
        </div>

        {artist.presentationText && (
          <p className="mt-4 whitespace-pre-wrap text-foreground">
            {artist.presentationText}
          </p>
        )}

        <ArtistContactActions actions={artist.contactActions} />
      </div>
    </Card>
  )
}
