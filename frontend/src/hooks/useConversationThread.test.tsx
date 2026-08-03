import { renderHook, waitFor, act } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { useConversationThread } from "./useConversationThread"
import type { AckResponse } from "../services/messagingSocket"

vi.mock("../contexts/AuthContext", () => ({
  useAuth: () => ({ user: { id: "me" } }),
}))

const { refreshUnreadMock } = vi.hoisted(() => ({
  refreshUnreadMock: vi.fn().mockResolvedValue(undefined),
}))

vi.mock("../contexts/MessagingUnreadContext", () => ({
  useMessagingUnread: () => ({ unreadCount: 0, refreshUnread: refreshUnreadMock }),
}))

vi.mock("../services/messaging", () => ({
  getHistory: vi.fn(),
  markConversationRead: vi.fn().mockResolvedValue({}),
  sendMessage: vi.fn(),
}))

const { socketMock } = vi.hoisted(() => ({
  socketMock: {
    on: vi.fn(),
    off: vi.fn(),
    joinConversation: vi.fn(),
    leaveConversation: vi.fn(),
    isConnected: vi.fn(() => true),
    sendMessage: vi.fn(),
    markRead: vi.fn(),
  },
}))

vi.mock("../services/messagingSocket", () => ({
  messagingSocket: socketMock,
}))

import { getHistory, sendMessage } from "../services/messaging"

const message = {
  id: "m1",
  conversationId: "c1",
  senderId: "me",
  content: "oi",
  createdAt: "2026-01-01T12:00:00.000Z",
}

describe("useConversationThread", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(getHistory).mockResolvedValue({
      messages: [],
      nextCursor: null,
      hasMore: false,
    } as never)
  })

  it("loads history and joins the conversation on mount", async () => {
    renderHook(() => useConversationThread("c1"))

    await waitFor(() => {
      expect(getHistory).toHaveBeenCalledWith("c1", { limit: 30 })
    })
    expect(socketMock.joinConversation).toHaveBeenCalledWith("c1")
  })

  it("replaces the temporary message when the socket ack returns the persisted message", async () => {
    const { result } = renderHook(() => useConversationThread("c1"))

    await waitFor(() => expect(socketMock.joinConversation).toHaveBeenCalled())

    act(() => {
      result.current.send("oi")
    })

    expect(socketMock.sendMessage).toHaveBeenCalledTimes(1)
    const [, , clientMessageId, onAck] = socketMock.sendMessage.mock.calls[0] as [
      string,
      string,
      string,
      (response: AckResponse) => void,
    ]

    act(() => {
      onAck({ ok: true, clientMessageId, message })
    })

    expect(result.current.tempMessages).toHaveLength(0)
    expect(result.current.messages).toContainEqual(message)
  })

  it("marks the temporary message as failed when the ack reports an error", async () => {
    const { result } = renderHook(() => useConversationThread("c1"))

    await waitFor(() => expect(socketMock.joinConversation).toHaveBeenCalled())

    act(() => {
      result.current.send("oi")
    })

    const [, , , onAck] = socketMock.sendMessage.mock.calls[0] as [
      string,
      string,
      string,
      (response: AckResponse) => void,
    ]

    act(() => {
      onAck({ ok: false, clientMessageId: "x", error: { code: "rate_limited", message: "Muitas." } })
    })

    expect(result.current.tempMessages[0].status).toBe("failed")
  })

  it("falls back to REST when the socket is not connected", async () => {
    socketMock.isConnected.mockReturnValue(false)
    vi.mocked(sendMessage).mockResolvedValue(message as never)

    const { result } = renderHook(() => useConversationThread("c1"))

    await waitFor(() => expect(socketMock.joinConversation).toHaveBeenCalled())

    act(() => {
      result.current.send("oi")
    })

    await new Promise((resolve) => setTimeout(resolve, 100))

    expect(sendMessage).toHaveBeenCalledWith("c1", "oi")
    expect(result.current.messages).toContainEqual(message)
    expect(result.current.tempMessages).toHaveLength(0)
  })

  it("keeps the composer free across five consecutive socket sends", async () => {
    socketMock.isConnected.mockReturnValue(true)
    const { result } = renderHook(() => useConversationThread("c1"))

    await waitFor(() => expect(socketMock.joinConversation).toHaveBeenCalled())

    for (let index = 1; index <= 5; index += 1) {
      const content = `msg ${index}`

      act(() => {
        result.current.send(content)
      })

      const call = socketMock.sendMessage.mock.calls.at(-1) as [
        string,
        string,
        string,
        (response: AckResponse) => void,
      ]

      const [, , clientMessageId, onAck] = call

      act(() => {
        onAck({
          ok: true,
          clientMessageId,
          message: {
            id: `m-${index}`,
            conversationId: "c1",
            senderId: "me",
            content,
            createdAt: "2026-01-01T12:00:00.000Z",
          },
        })
      })

      expect(
        result.current.tempMessages.some((t) => t.status === "sending"),
      ).toBe(false)
      expect(result.current.messages.some((m) => m.content === content)).toBe(true)
    }

    expect(result.current.tempMessages).toHaveLength(0)
  })
})
