import api from "./api"

export type Role = "SUPER_ADMIN" | "ARTIST" | "SUBSCRIBER"

export type AccountStatus = "ACTIVE" | "DISABLED"

export const ROLES: Record<Role, Role> = {
  SUPER_ADMIN: "SUPER_ADMIN",
  ARTIST: "ARTIST",
  SUBSCRIBER: "SUBSCRIBER",
}

export const ACCOUNT_STATUSES: Record<AccountStatus, AccountStatus> = {
  ACTIVE: "ACTIVE",
  DISABLED: "DISABLED",
}

export interface UserTier {
  id: string
  name: string
  priority: number
}

export interface User {
  id: string
  email: string
  name: string | null
  status: AccountStatus
  roles: Role[]
  tierId: string | null
  tier: UserTier | null
  createdAt: string
  updatedAt: string
}

export interface UserListQuery {
  search?: string
  tierId?: string
  status?: AccountStatus
  role?: Role
  page?: number
  limit?: number
}

export interface UserListResponse {
  data: User[]
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface CreateUserData {
  email: string
  passwordHash: string
  name?: string
}

export interface UpdateUserData {
  email?: string
  passwordHash?: string
  name?: string
}

export async function fetchUsers(query: UserListQuery = {}) {
  const response = await api.get<UserListResponse>("/users", {
    params: query,
  })

  return response.data
}

export async function fetchUser(id: string) {
  const response = await api.get<User>(`/users/${id}`)

  return response.data
}

export async function createUser(data: CreateUserData) {
  const response = await api.post<User>("/users", data)

  return response.data
}

export async function updateUser(id: string, data: UpdateUserData) {
  const response = await api.patch<User>(`/users/${id}`, data)

  return response.data
}

export async function assignRole(id: string, role: Role) {
  const response = await api.post<User>(`/users/${id}/roles`, { role })

  return response.data
}

export async function removeRole(id: string, role: Role) {
  const response = await api.delete<User>(`/users/${id}/roles/${role}`)

  return response.data
}

export async function setUserStatus(id: string, status: AccountStatus) {
  const response = await api.patch<User>(`/users/${id}/status`, { status })

  return response.data
}

export async function assignUserTier(id: string, tierId: string | null) {
  const response = await api.patch<User>(`/users/${id}/tier`, { tierId })

  return response.data
}
