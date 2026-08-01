import axios from "axios"
import type { AxiosError } from "axios"

import { clearToken, getToken } from "./token-storage"

export const SESSION_INVALIDATED_EVENT = "platform:session-invalidated"

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

api.interceptors.request.use((config) => {
  const token = getToken()

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      const isAuthRequest = error.config?.url?.includes("/auth/login")

      if (!isAuthRequest) {
        clearToken()
        window.dispatchEvent(new Event(SESSION_INVALIDATED_EVENT))
      }
    }

    return Promise.reject(error)
  },
)

export default api
