import { render, screen, waitFor, act } from "@testing-library/react"
import { describe, expect, it, vi, beforeEach } from "vitest"
import {
  MessagingUnreadProvider,
  useMessagingUnread,
} from "./MessagingUnreadContext"

const { socketMock, authState } = vi.hoisted(() => ({
  socketMock: {
    connect: vi.fn(),
    disconnect: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
  },
  authState: { isAuthenticated: false },
}))

vi.mock("../services/messaging", () => ({
  getUnreadCount: vi.fn(),
}))

vi.mock("../services/messagingSocket", () => ({
  messagingSocket: socketMock,
}))

import { getUnreadCount } from "../services/messaging"

vi.mock("./AuthContext", () => ({
  useAuth: () => ({ isAuthenticated: authState.isAuthenticated }),
}))

function Consumer() {
  const { unreadCount } = useMessagingUnread()

  return <span data-testid="unread">{unreadCount}</span>
}

function renderProvider() {
  return render(
    <MessagingUnreadProvider>
      <Consumer />
    </MessagingUnreadProvider>,
  )
}

describe("MessagingUnreadProvider", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    authState.isAuthenticated = false
  })

  it("loads the initial count from the backend for authenticated users", async () => {
    authState.isAuthenticated = true
    vi.mocked(getUnreadCount).mockResolvedValue({ count: 3 })

    renderProvider()

    expect(await screen.findByTestId("unread")).toHaveTextContent("3")
    expect(socketMock.connect).toHaveBeenCalled()
  })

  it("updates the shared count on unread:updated events", async () => {
    authState.isAuthenticated = true
    vi.mocked(getUnreadCount).mockResolvedValue({ count: 0 })

    renderProvider()

    await screen.findByTestId("unread")

    const handleUnread = socketMock.on.mock.calls.find(
      (call) => call[0] === "unread:updated",
    )?.[1] as (data: { count: number }) => void

    act(() => {
      handleUnread({ count: 5 })
    })

    expect(screen.getByTestId("unread")).toHaveTextContent("5")
  })

  it("refreshes the count on socket reconnection", async () => {
    authState.isAuthenticated = true
    vi.mocked(getUnreadCount)
      .mockResolvedValueOnce({ count: 1 })
      .mockResolvedValueOnce({ count: 2 })

    renderProvider()

    await screen.findByTestId("unread")
    expect(screen.getByTestId("unread")).toHaveTextContent("1")

    const handleConnect = socketMock.on.mock.calls.find(
      (call) => call[0] === "connect",
    )?.[1] as () => void

    act(() => {
      handleConnect()
    })

    await waitFor(() => {
      expect(screen.getByTestId("unread")).toHaveTextContent("2")
    })
  })

  it("clears the count and disconnects on logout", async () => {
    authState.isAuthenticated = true
    vi.mocked(getUnreadCount).mockResolvedValue({ count: 4 })

    const { rerender } = renderProvider()

    await screen.findByTestId("unread")
    expect(screen.getByTestId("unread")).toHaveTextContent("4")

    authState.isAuthenticated = false
    rerender(
      <MessagingUnreadProvider>
        <Consumer />
      </MessagingUnreadProvider>,
    )

    await waitFor(() => {
      expect(screen.getByTestId("unread")).toHaveTextContent("0")
    })
    expect(socketMock.disconnect).toHaveBeenCalled()
  })
})
