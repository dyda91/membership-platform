import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react"
import type { ReactNode } from "react"

import {
  fetchCurrentSession,
  login as loginRequest,
  logout as clearSession,
} from "../services/auth"
import type { SessionUser } from "../services/auth"
import { getToken, clearToken } from "../services/token-storage"
import { SESSION_INVALIDATED_EVENT } from "../services/api"
import {
  canAccessDashboard,
  isArtist,
  isSuperAdmin,
} from "../services/permissions"

interface AuthContextValue {
  user: SessionUser | null
  isAuthenticated: boolean
  isSuperAdmin: boolean
  isAdmin: boolean
  canManageContent: boolean
  isArtist: boolean
  isLoading: boolean
  sessionError: string | null
  login: (email: string, password: string) => Promise<SessionUser>
  logout: () => void
  refreshSession: () => Promise<SessionUser | null>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [sessionError, setSessionError] = useState<string | null>(null)

  const refreshSession = useCallback(async () => {
    const token = getToken()

    if (!token) {
      setUser(null)
      setSessionError(null)
      setIsLoading(false)

      return null
    }

    try {
      const session = await fetchCurrentSession()
      setUser(session)
      setSessionError(null)

      return session
    } catch (error) {
      const status = (error as { response?: { status?: number } })?.response
        ?.status

      if (status === 401) {
        clearToken()
        setUser(null)
        setSessionError("Sua sessão expirou. Entre novamente.")
      } else {
        // Temporary network or server failure: keep any existing session but
        // do not grant administrative access based on stale data.
        setSessionError("Não foi possível carregar sua sessão.")
      }

      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void refreshSession()

    function handleSessionInvalidated() {
      setUser(null)
      setSessionError("Sua sessão expirou. Entre novamente.")
      setIsLoading(false)
    }

    window.addEventListener(SESSION_INVALIDATED_EVENT, handleSessionInvalidated)

    return () => {
      window.removeEventListener(
        SESSION_INVALIDATED_EVENT,
        handleSessionInvalidated,
      )
    }
  }, [refreshSession])

  const login = useCallback(async (email: string, password: string) => {
    await loginRequest(email, password)

    const session = await fetchCurrentSession()
    setUser(session)
    setSessionError(null)
    setIsLoading(false)

    return session
  }, [])

  const logout = useCallback(() => {
    clearSession()
    clearToken()
    setUser(null)
    setSessionError(null)
    setIsLoading(false)
  }, [])

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: user !== null,
      isSuperAdmin: isSuperAdmin(user),
      isAdmin: canAccessDashboard(user),
      canManageContent: canAccessDashboard(user),
      isArtist: isArtist(user),
      isLoading,
      sessionError,
      login,
      logout,
      refreshSession,
    }),
    [
      user,
      isLoading,
      sessionError,
      login,
      logout,
      refreshSession,
    ],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }

  return context
}
