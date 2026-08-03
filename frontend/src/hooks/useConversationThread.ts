import { useCallback, useEffect, useState } from "react"

import { useAuth } from "../contexts/AuthContext"
import { useMessagingUnread } from "../contexts/MessagingUnreadContext"
import { getHistory, markConversationRead, sendMessage } from "../services/messaging"
import type { Message } from "../services/messaging"
import { messagingSocket } from "../services/messagingSocket"
import type { AckResponse } from "../services/messagingSocket"

export interface TempMessage {
  localId: string
  content: string
  status: "sending" | "failed"
}

const PAGE_SIZE = 30

export interface ConversationThread {
  messages: Message[]
  tempMessages: TempMessage[]
  hasMore: boolean
  loading: boolean
  loadingOlder: boolean
  error: string | null
  loaded: boolean
  send: (content: string) => void
  retry: (localId: string, content: string) => void
  loadOlder: () => void
  reload: () => void
}

export function useConversationThread(conversationId: string): ConversationThread {
  const { user } = useAuth()
  const { refreshUnread } = useMessagingUnread()
  const [messages, setMessages] = useState<Message[]>([])
  const [tempMessages, setTempMessages] = useState<TempMessage[]>([])
  const [hasMore, setHasMore] = useState(false)
  const [nextCursor, setNextCursor] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadingOlder, setLoadingOlder] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loaded, setLoaded] = useState(false)

  const addPersisted = useCallback((message: Message) => {
    setMessages((current) =>
      current.some((item) => item.id === message.id)
        ? current
        : [...current, message],
    )
  }, [])

  const markReadNow = useCallback(() => {
    const apply = () => {
      void refreshUnread()
    }

    if (messagingSocket.isConnected()) {
      messagingSocket.markRead(conversationId)
      apply()
    } else {
      void markConversationRead(conversationId)
        .then(apply)
        .catch(() => undefined)
    }
  }, [conversationId, refreshUnread])

  const loadLatest = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const page = await getHistory(conversationId, { limit: PAGE_SIZE })
      setMessages(page.messages)
      setHasMore(page.hasMore)
      setNextCursor(page.nextCursor)
      setLoaded(true)
      markReadNow()
    } catch {
      setError("Não foi possível carregar as mensagens.")
    } finally {
      setLoading(false)
    }
  }, [conversationId, markReadNow])

  const loadOlder = useCallback(async () => {
    if (!nextCursor || loadingOlder) {
      return
    }

    setLoadingOlder(true)

    try {
      const page = await getHistory(conversationId, {
        before: nextCursor,
        limit: PAGE_SIZE,
      })
      setMessages((current) => {
        const known = new Set(current.map((item) => item.id))

        return [
          ...page.messages.filter((item) => !known.has(item.id)),
          ...current,
        ]
      })
      setHasMore(page.hasMore)
      setNextCursor(page.nextCursor)
    } catch {
      // Existing messages remain visible on failure.
    } finally {
      setLoadingOlder(false)
    }
  }, [conversationId, nextCursor, loadingOlder])

  const send = useCallback(
    (content: string) => {
      const localId = `tmp-${Date.now()}-${Math.random().toString(36).slice(2)}`
      const trimmed = content.trim()

      setTempMessages((current) => [
        ...current,
        { localId, content: trimmed, status: "sending" },
      ])

      const finish = () => {
        setTempMessages((current) =>
          current.filter((item) => item.localId !== localId),
        )
      }

      if (messagingSocket.isConnected()) {
        const timer = window.setTimeout(() => {
          setTempMessages((current) =>
            current.map((item) =>
              item.localId === localId ? { ...item, status: "failed" as const } : item,
            ),
          )
        }, 8000)

        const onAck = (response: AckResponse) => {
          window.clearTimeout(timer)

          if (response.ok && response.message) {
            addPersisted(response.message)
            finish()
          } else {
            setTempMessages((current) =>
              current.map((item) =>
                item.localId === localId
                  ? { ...item, status: "failed" as const }
                  : item,
              ),
            )
          }
        }

        messagingSocket.sendMessage(conversationId, trimmed, localId, onAck)
      } else {
        void sendMessage(conversationId, trimmed)
          .then((message) => {
            addPersisted(message)
            finish()
          })
          .catch(() => {
            setTempMessages((current) =>
              current.map((item) =>
                item.localId === localId ? { ...item, status: "failed" as const } : item,
              ),
            )
          })
      }
    },
    [conversationId, addPersisted],
  )

  const retry = useCallback(
    (localId: string, content: string) => {
      setTempMessages((current) =>
        current.filter((item) => item.localId !== localId),
      )
      send(content)
    },
    [send],
  )

  useEffect(() => {
    const handleNew = (data: { conversationId: string; message: Message }) => {
      if (data?.conversationId !== conversationId || !data?.message) {
        return
      }

      addPersisted(data.message)

      if (user && data.message.senderId !== user.id) {
        setTempMessages((current) =>
          current.filter((item) => item.status !== "sending"),
        )
      }
    }

    messagingSocket.on("message:new", handleNew)

    return () => {
      messagingSocket.off("message:new", handleNew)
    }
  }, [conversationId, addPersisted, user])

  useEffect(() => {
    messagingSocket.joinConversation(conversationId)
    void loadLatest()

    return () => {
      messagingSocket.leaveConversation(conversationId)
    }
  }, [conversationId, loadLatest])

  useEffect(() => {
    const handleConnect = () => {
      messagingSocket.joinConversation(conversationId)
      void loadLatest()
      void refreshUnread()
    }

    messagingSocket.on("connect", handleConnect)

    return () => {
      messagingSocket.off("connect", handleConnect)
    }
  }, [conversationId, loadLatest, refreshUnread])

  return {
    messages,
    tempMessages,
    hasMore,
    loading,
    loadingOlder,
    error,
    loaded,
    send,
    retry,
    loadOlder,
    reload: loadLatest,
  }
}
