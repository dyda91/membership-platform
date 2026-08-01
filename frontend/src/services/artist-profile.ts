import api from "./api"
import type {
  FeedArtist,
  FeedContactAction,
} from "./feed"

export interface ManageArtistProfile extends FeedArtist {
  artistUserId: string | null
  whatsappValue: string | null
  whatsappEnabled: boolean
  discordUrl: string | null
  discordEnabled: boolean
  contactButtonText: string | null
}

export interface UpdateArtistProfileData {
  name?: string
  bio?: string
  presentationText?: string
  contactButtonText?: string
  whatsappValue?: string | null
  whatsappEnabled?: boolean
  discordUrl?: string | null
  discordEnabled?: boolean
}

export async function fetchPublicArtistProfile(): Promise<FeedArtist> {
  const response = await api.get<FeedArtist>("/artist-profile/public")

  return response.data
}

export async function fetchManageArtistProfile(): Promise<ManageArtistProfile> {
  const response = await api.get<ManageArtistProfile>("/artist-profile/manage")

  return response.data
}

export async function updateArtistProfile(
  data: UpdateArtistProfileData,
): Promise<ManageArtistProfile> {
  const response = await api.patch<ManageArtistProfile>("/artist-profile", data)

  return response.data
}

export async function uploadArtistAvatar(file: File) {
  const formData = new FormData()
  formData.append("file", file)

  const response = await api.post<ManageArtistProfile>(
    "/artist-profile/avatar",
    formData,
    { headers: { "Content-Type": "multipart/form-data" } },
  )

  return response.data
}

export async function uploadArtistBanner(file: File) {
  const formData = new FormData()
  formData.append("file", file)

  const response = await api.post<ManageArtistProfile>(
    "/artist-profile/banner",
    formData,
    { headers: { "Content-Type": "multipart/form-data" } },
  )

  return response.data
}

export type { FeedContactAction }
