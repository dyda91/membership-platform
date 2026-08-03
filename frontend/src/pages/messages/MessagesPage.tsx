import { useAuth } from "../../contexts/AuthContext"
import MemberMessagesPage from "./MemberMessagesPage"
import ArtistMessagesPage from "./ArtistMessagesPage"

export default function MessagesPage() {
  const { isArtist, isSuperAdmin } = useAuth()

  return isArtist || isSuperAdmin ? (
    <ArtistMessagesPage />
  ) : (
    <MemberMessagesPage />
  )
}
