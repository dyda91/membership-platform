import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react"
import type { ReactNode } from "react"

import { useAuth } from "./AuthContext"
import { getUnreadCount } from "../services/messaging"
import { messagingSocket } from "../services/messagingSocket"

interface MessagingUnreadValue {
  unreadCount: number
  refreshUnread: () => Promise<void>
}

const MessagingUnreadContext = createContext<MessagingUnreadValue | undefined>(
  undefined,
)

/**
 * Shared source of truth for the authenticated user's total unread message
 * count. Used by navigation badges and messaging pages so the count stays
 * consistent across the app, sessions and real-time events.
 */
export function MessagingUnreadProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth()
  const [unreadCount, setUnreadCount] = useState(0)

  const refreshUnread = useCallback(async () => {
    if (!isAuthenticated) {
      setUnreadCount(0)

      return
    }

    try {
      const data = await getUnreadCount()
      setUnreadCount(data.count)
    } catch {
      // Keep the current count on transient failures.
    }
  }, [isAuthenticated])

  useEffect(() => {
    if (!isAuthenticated) {
      setUnreadCount(0)
      messagingSocket.disconnect()

      return
    }

    let active = true

    void refreshUnread()
    messagingSocket.connect()

    const handleUnread = (data: { count: number }) => {
      if (active && typeof data?.count === "number") {
        setUnreadCount(data.count)
      }
    }

    const handleConnect = () => {
      if (active) {
        void refreshUnread()
      }
    }

    messagingSocket.on("unread:updated", handleUnread)
    messagingSocket.on("connect", handleConnect)

    return () => {
      active = false
      messagingSocket.off("unread:updated", handleUnread)
      messagingSocket.off("connect", handleConnect)
    }
  }, [isAuthenticated, refreshUnread])

  const value = useMemo(
    () => ({ unreadCount, refreshUnread }),
    [unreadCount, refreshUnread],
  )

  return (
    <MessagingUnreadContext.Provider value={value}>
      {children}
    </MessagingUnreadContext.Provider>
  )
}

export function useMessagingUnread(): MessagingUnreadValue {
  const context = useContext(MessagingUnreadContext)

  if (!context) {
    throw new Error(
      "useMessagingUnread must be used within a MessagingUnreadProvider",
    )
  }

  return context
}
