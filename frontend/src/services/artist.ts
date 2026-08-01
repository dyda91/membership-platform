import api from "./api"

export interface ArtistProfile {
  id: string
  userId: string
  name: string
  description: string
  bio: string | null
  avatarUrl: string | null
  bannerUrl: string | null
  createdAt: string
  updatedAt: string
}

export interface UpdateArtistProfileData {
  name?: string
  description?: string
  bio?: string
  avatarUrl?: string | null
  bannerUrl?: string | null
}

export async function fetchArtistProfile() {
  const response = await api.get<ArtistProfile>("/artist/profile")

  return response.data
}

export async function updateArtistProfile(data: UpdateArtistProfileData) {
  const response = await api.patch<ArtistProfile>("/artist/profile", data)

  return response.data
}
