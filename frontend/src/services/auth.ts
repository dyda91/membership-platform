import api from "./api"
import { clearToken, saveToken } from "./token-storage"
import type { User } from "./users"

export interface LoginResponse {
  accessToken: string
  user: User
}

export interface RegisterData {
  name?: string
  email: string
  password: string
}

export interface SessionUser {
  id: string
  email: string
  name: string | null
  status: "ACTIVE" | "DISABLED"
  roles: ("SUPER_ADMIN" | "ARTIST" | "SUBSCRIBER")[]
  tier: { id: string; name: string; priority: number } | null
  tierId: string | null
  tierPriority: number | null
  tierAccessStatus?: string
  tierStartsAt?: string | null
  tierExpiresAt?: string | null
  tierPermanent?: boolean
  tierExpiringSoon?: boolean
  isSuperAdmin: boolean
  isArtist: boolean
  isSubscriber: boolean
}

export async function register(data: RegisterData): Promise<User> {
  const response = await api.post<User>("/auth/register", data)

  return response.data
}

export async function login(email: string, password: string): Promise<User> {
  const response = await api.post<LoginResponse>("/auth/login", {
    email,
    password,
  })

  saveToken(response.data.accessToken)

  return response.data.user
}

export async function fetchCurrentSession(): Promise<SessionUser> {
  const response = await api.get<SessionUser>("/auth/me")

  return response.data
}

export async function fetchCurrentUser(): Promise<SessionUser> {
  return fetchCurrentSession()
}

export async function changePassword(
  currentPassword: string,
  newPassword: string,
): Promise<{ success: boolean }> {
  const response = await api.post<{ success: boolean }>(
    "/auth/change-password",
    { currentPassword, newPassword },
  )

  return response.data
}

export async function logoutAll(): Promise<{ success: boolean }> {
  const response = await api.post<{ success: boolean }>("/auth/logout-all")

  return response.data
}

export async function forgotPassword(email: string): Promise<{ message: string }> {
  const response = await api.post<{ message: string }>("/auth/forgot-password", {
    email,
  })

  return response.data
}

export async function resetPassword(
  token: string,
  newPassword: string,
): Promise<{ success: boolean }> {
  const response = await api.post<{ success: boolean }>("/auth/reset-password", {
    token,
    newPassword,
  })

  return response.data
}

export function logout() {
  clearToken()
}
