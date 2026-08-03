import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import MessageComposer from "./MessageComposer"
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

describe("MessageComposer", () => {
  it("sends a trimmed message and clears the input", async () => {
    const user = userEvent.setup()
    const thread = makeThread()

    render(<MessageComposer thread={thread} />)

    const input = screen.getByLabelText("Mensagem")
    await user.type(input, "  Olá artista  ")
    await user.click(screen.getByRole("button", { name: "Enviar" }))

    expect(thread.send).toHaveBeenCalledWith("Olá artista")
    expect(input).toHaveValue("")
  })

  it("disables send for empty or whitespace content", async () => {
    const user = userEvent.setup()
    const thread = makeThread()

    render(<MessageComposer thread={thread} />)

    const send = screen.getByRole("button", { name: "Enviar" })
    expect(send).toBeDisabled()

    await user.type(screen.getByLabelText("Mensagem"), "   ")
    expect(send).toBeDisabled()

    await user.type(screen.getByLabelText("Mensagem"), "oi")
    expect(send).toBeEnabled()
  })

  it("sends on Enter without Shift and keeps multiline with Shift+Enter", async () => {
    const user = userEvent.setup()
    const thread = makeThread()

    render(<MessageComposer thread={thread} />)

    const input = screen.getByLabelText("Mensagem")
    await user.type(input, "linha 1")
    await user.keyboard("{Shift>}{Enter}{/Shift}")
    await user.type(input, "linha 2")
    await user.keyboard("{Enter}")

    expect(thread.send).toHaveBeenCalledWith("linha 1\nlinha 2")
  })

  it("prevents duplicate submission while a message is sending", async () => {
    const user = userEvent.setup()
    const thread = makeThread({
      tempMessages: [{ localId: "t1", content: "oi", status: "sending" }],
    })

    render(<MessageComposer thread={thread} />)

    await user.type(screen.getByLabelText("Mensagem"), "oi")
    expect(screen.getByRole("button", { name: "Enviar" })).toBeDisabled()
  })
})
