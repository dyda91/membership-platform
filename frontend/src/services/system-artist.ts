import api from "./api"
import type { User } from "./users"

export async function fetchActiveArtist(): Promise<User | null> {
  const response = await api.get<User | null>("/system/artist")

  return response.data
}

export async function fetchArtistCandidates(): Promise<User[]> {
  const response = await api.get<User[]>("/system/artist/candidates")

  return response.data
}

export async function promoteArtist(userId: string): Promise<User> {
  const response = await api.post<User>("/system/artist/promote", { userId })

  return response.data
}

export async function replaceArtist(userId: string): Promise<User> {
  const response = await api.post<User>("/system/artist/replace", { userId })

  return response.data
}
