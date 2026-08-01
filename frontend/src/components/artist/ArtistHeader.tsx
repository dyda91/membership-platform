import type { FeedArtist } from "../../services/feed"
import ArtistAvatar from "./ArtistAvatar"
import ArtistBanner from "./ArtistBanner"
import ArtistContactActions from "./ArtistContactActions"

interface ArtistHeaderProps {
  artist: FeedArtist
}

export default function ArtistHeader({ artist }: ArtistHeaderProps) {
  return (
    <section className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow">
      <ArtistBanner url={artist.bannerUrl} />

      <div className="p-6">
        <div className="flex items-start gap-4">
          <ArtistAvatar url={artist.avatarUrl} name={artist.name} />

          <div className="min-w-0 flex-1">
            <h2 className="text-2xl font-bold text-gray-900">
              {artist.name ?? "Artista"}
            </h2>

            {artist.bio && (
              <p className="mt-1 text-sm text-gray-600">{artist.bio}</p>
            )}
          </div>
        </div>

        {artist.presentationText && (
          <p className="mt-4 whitespace-pre-wrap text-gray-800">
            {artist.presentationText}
          </p>
        )}

        <ArtistContactActions actions={artist.contactActions} />
      </div>
    </section>
  )
}
