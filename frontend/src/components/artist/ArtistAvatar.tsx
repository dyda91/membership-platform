import Avatar from "../ui/Avatar"

interface ArtistAvatarProps {
  url: string | null
  name: string | null
}

export default function ArtistAvatar({ url, name }: ArtistAvatarProps) {
  return <Avatar url={url} name={name} size="lg" ariaLabel="Avatar" />
}
