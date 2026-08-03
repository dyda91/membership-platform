import { io } from "socket.io-client"
import type { Socket } from "socket.io-client"

import { getToken } from "./token-storage"
import type { Message } from "./messaging"

export interface SocketSendError {
  code: string
  message: string
}

export interface AckResponse {
  ok: boolean
  clientMessageId?: string
  message?: Message
  error?: SocketSendError
}

type Handler<T = unknown> = (data: T) => void

const EVENTS = [
  "connect",
  "disconnect",
  "ready",
  "message:new",
  "message:acknowledged",
  "message:failed",
  "conversation:updated",
  "conversation:read-updated",
  "unread:updated",
] as const

function socketUrl(): string {
  const api = (import.meta.env.VITE_API_URL as string | undefined) ?? "http://localhost:3000"
  const base = api.replace(/\/$/, "").replace(/^http/, "ws")

  return `${base}/messaging`
}

/**
 * Singleton WebSocket client for messaging. The token is read from storage at
 * connect time and never placed in URLs. Connection is optional for
 * correctness: REST remains the recovery path.
 */
class MessagingSocket {
  private socket: Socket | null = null
  private handlers = new Map<string, Set<Handler>>()

  connect(): void {
    if (this.socket?.connected) {
      return
    }

    const token = getToken()

    if (!token) {
      return
    }

    this.disconnect()

    const socket = io(socketUrl(), {
      auth: { token },
      transports: ["websocket", "polling"],
    })

    this.socket = socket

    for (const event of EVENTS) {
      socket.on(event, (data: unknown) => this.emit(event, data))
    }
  }

  disconnect(): void {
    this.socket?.disconnect()
    this.socket = null
  }

  on<T>(event: string, handler: Handler<T>): void {
    const set = this.handlers.get(event) ?? new Set<Handler>()
    set.add(handler as Handler)
    this.handlers.set(event, set)
  }

  off<T>(event: string, handler: Handler<T>): void {
    const set = this.handlers.get(event)

    if (!set) {
      return
    }

    set.delete(handler as Handler)

    if (set.size === 0) {
      this.handlers.delete(event)
    }
  }

  joinConversation(conversationId: string): void {
    this.socket?.emit("conversation:join", { conversationId })
  }

  leaveConversation(conversationId: string): void {
    this.socket?.emit("conversation:leave", { conversationId })
  }

  sendMessage(
    conversationId: string,
    content: string,
    clientMessageId: string,
    onAck?: (response: AckResponse) => void,
  ): void {
    this.socket?.emit(
      "message:send",
      { conversationId, content, clientMessageId },
      (response: AckResponse) => {
        if (response) {
          this.emit("ack", response)
          onAck?.(response)
        }
      },
    )
  }

  markRead(conversationId: string): void {
    this.socket?.emit("conversation:read", { conversationId })
  }

  isConnected(): boolean {
    return Boolean(this.socket?.connected)
  }

  private emit(event: string, data: unknown): void {
    const set = this.handlers.get(event)

    if (!set) {
      return
    }

    for (const handler of set) {
      handler(data)
    }
  }
}

export const messagingSocket = new MessagingSocket()
export { socketUrl }
