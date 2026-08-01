import api from "./api"
import type { User } from "./users"

export interface UpdateOwnProfileData {
  name?: string
}

export async function fetchOwnProfile() {
  const response = await api.get<User>("/auth/profile")

  return response.data
}

export async function updateOwnProfile(data: UpdateOwnProfileData) {
  const response = await api.patch<User>("/auth/profile", data)

  return response.data
}
