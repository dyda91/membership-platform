import api from "./api"

export type Role = "ADMIN" | "ARTIST" | "SUBSCRIBER"

export type AccountStatus = "ACTIVE" | "DISABLED"

export const ROLES: Record<Role, Role> = {
  ADMIN: "ADMIN",
  ARTIST: "ARTIST",
  SUBSCRIBER: "SUBSCRIBER",
}

export const ACCOUNT_STATUSES: Record<AccountStatus, AccountStatus> = {
  ACTIVE: "ACTIVE",
  DISABLED: "DISABLED",
}

export interface User {
  id: string
  email: string
  name: string | null
  status: AccountStatus
  roles: Role[]
  createdAt: string
  updatedAt: string
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

export async function fetchUsers() {
  const response = await api.get<User[]>("/users")

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
