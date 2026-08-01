import api from "./api"

export interface Tier {
  id: string
  name: string
  description: string
  priority: number
  createdAt: string
  updatedAt: string
}

export interface CreateTierData {
  name: string
  description: string
  priority?: number
}

export interface UpdateTierData {
  name?: string
  description?: string
  priority?: number
}

export async function fetchTiers() {
  const response = await api.get<Tier[]>("/tiers")

  return response.data
}

export async function fetchTier(id: string) {
  const response = await api.get<Tier>(`/tiers/${id}`)

  return response.data
}

export async function createTier(data: CreateTierData) {
  const response = await api.post<Tier>("/tiers", data)

  return response.data
}

export async function updateTier(id: string, data: UpdateTierData) {
  const response = await api.patch<Tier>(`/tiers/${id}`, data)

  return response.data
}

export async function deleteTier(id: string) {
  const response = await api.delete<Tier>(`/tiers/${id}`)

  return response.data
}
