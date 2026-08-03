import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import MessageThread from "./MessageThread"
import type { ConversationThread } from "../../hooks/useConversationThread"

function makeThread(overrides: Partial<ConversationThread> = {}): ConversationThread {
  return {
    messages: [],
    tempMessages: [],
    hasMore: false,
    loading: false,
    loadingOlder: false,
    error: null,
    loaded: true,
    send: vi.fn(),
    retry: vi.fn(),
    loadOlder: vi.fn(),
    reload: vi.fn(),
    ...overrides,
  }
}

describe("MessageThread", () => {
  it("renders sent and received messages with distinct alignment", () => {
    const thread = makeThread({
      messages: [
        {
          id: "m1",
          conversationId: "c1",
          senderId: "other",
          content: "Oi, artista!",
          createdAt: "2026-01-01T12:00:00.000Z",
        },
        {
          id: "m2",
          conversationId: "c1",
          senderId: "me",
          content: "Oi!",
          createdAt: "2026-01-01T12:01:00.000Z",
        },
      ],
    })

    render(<MessageThread thread={thread} currentUserId="me" />)

    expect(screen.getByText("Oi, artista!")).toBeInTheDocument()
    expect(screen.getByText("Oi!")).toBeInTheDocument()
  })

  it("preserves line breaks as text", () => {
    const thread = makeThread({
      messages: [
        {
          id: "m1",
          conversationId: "c1",
          senderId: "me",
          content: "linha 1\nlinha 2",
          createdAt: "2026-01-01T12:00:00.000Z",
        },
      ],
    })

    render(<MessageThread thread={thread} currentUserId="me" />)

    const text = screen.getByText(/linha 1/)
    expect(text).toHaveClass("whitespace-pre-wrap")
  })

  it("shows a sending state for temporary messages", () => {
    const thread = makeThread({
      tempMessages: [{ localId: "t1", content: "enviando", status: "sending" }],
    })

    render(<MessageThread thread={thread} currentUserId="me" />)

    expect(screen.getByText("enviando")).toBeInTheDocument()
    expect(screen.getByText("Enviando…")).toBeInTheDocument()
  })

  it("shows a failed state with retry", async () => {
    const user = userEvent.setup()
    const thread = makeThread({
      tempMessages: [{ localId: "t1", content: "falhou", status: "failed" }],
    })

    render(<MessageThread thread={thread} currentUserId="me" />)

    expect(screen.getByText("Falha no envio")).toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: "Tentar novamente" }))

    expect(thread.retry).toHaveBeenCalledWith("t1", "falhou")
  })

  it("offers loading older messages when history continues", async () => {
    const user = userEvent.setup()
    const thread = makeThread({ hasMore: true })

    render(<MessageThread thread={thread} currentUserId="me" />)

    await user.click(
      screen.getByRole("button", { name: "Carregar mensagens anteriores" }),
    )

    expect(thread.loadOlder).toHaveBeenCalled()
  })
})
