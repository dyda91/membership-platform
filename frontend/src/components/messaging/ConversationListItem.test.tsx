import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import ConversationListItem from "./ConversationListItem"
import type { ConversationSummary } from "../../services/messaging"

const summary: ConversationSummary = {
  id: "c1",
  member: { id: "m1", name: "Membro Teste", email: "membro@test.com" },
  lastMessagePreview: "Olá artista!",
  lastMessageSenderId: "m1",
  lastMessageAt: "2026-01-01T12:00:00.000Z",
  artistUnreadCount: 2,
  effectiveTier: { id: "t-gold", name: "Gold", priority: 5 },
  accessStatus: "ACTIVE",
  accessExpiresAt: "2026-06-01T00:00:00.000Z",
  accessPermanent: false,
}

describe("ConversationListItem", () => {
  it("shows member identity, preview, tier and unread count", () => {
    render(
      <ConversationListItem
        summary={summary}
        selected={false}
        onSelect={() => undefined}
      />,
    )

    expect(screen.getByText("Membro Teste")).toBeInTheDocument()
    expect(screen.getByText("membro@test.com")).toBeInTheDocument()
    expect(screen.getByText("Olá artista!")).toBeInTheDocument()
    expect(screen.getByText("Gold")).toBeInTheDocument()
    expect(screen.getByText("Ativo")).toBeInTheDocument()
    expect(screen.getByLabelText("2 mensagens não lidas")).toBeInTheDocument()
  })

  it("exposes an accessible name and selection state", () => {
    const onSelect = vi.fn()
    render(
      <ConversationListItem
        summary={summary}
        selected
        onSelect={onSelect}
      />,
    )

    const button = screen.getByRole("button", { name: "Conversa com Membro Teste" })
    expect(button).toHaveAttribute("aria-current", "true")
  })

  it("marks the conversation as selected on click", async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()

    render(
      <ConversationListItem
        summary={summary}
        selected={false}
        onSelect={onSelect}
      />,
    )

    await user.click(screen.getByRole("button", { name: "Conversa com Membro Teste" }))

    expect(onSelect).toHaveBeenCalledTimes(1)
  })
})
