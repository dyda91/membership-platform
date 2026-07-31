import api from "./api"
import { clearToken, saveToken } from "./token-storage"
import type { User } from "./users"

export interface LoginResponse {
  accessToken: string
  user: User
}

export async function login(email: string, password: string): Promise<User> {
  const response = await api.post<LoginResponse>("/auth/login", {
    email,
    password,
  })

  saveToken(response.data.accessToken)

  return response.data.user
}

export async function fetchCurrentUser(): Promise<User> {
  const response = await api.get<User>("/auth/profile")

  return response.data
}

export function logout() {
  clearToken()
}
