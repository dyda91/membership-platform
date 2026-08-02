import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import LockedMedia from "./LockedMedia"

const goldTier = { id: "t-gold", name: "Gold", priority: 5 }

describe("LockedMedia", () => {
  it("shows the required tier in text", () => {
    render(<LockedMedia requiredTier={goldTier} />)

    expect(screen.getByText("Conteúdo exclusivo")).toBeInTheDocument()
    expect(screen.getByText(/Disponível para o tier/)).toBeInTheDocument()
    expect(screen.getByText("Gold")).toBeInTheDocument()
  })

  it("renders contact actions when provided", () => {
    render(
      <LockedMedia
        requiredTier={goldTier}
        contactActions={[
          { type: "WHATSAPP", label: "Falar pelo WhatsApp", url: "https://wa.me/1" },
          { type: "DISCORD", label: "Discord", url: "https://discord.gg/1" },
        ]}
      />,
    )

    expect(screen.getByText("Falar pelo WhatsApp")).toBeInTheDocument()
    expect(screen.getByText("Discord")).toBeInTheDocument()
  })

  it("shows a controlled message when no contact channel is configured", () => {
    render(<LockedMedia requiredTier={goldTier} contactActions={[]} />)

    expect(
      screen.getByText(/Entre em contato para solicitar acesso/),
    ).toBeInTheDocument()
  })

  it("never renders a payment or plan-management screen", () => {
    render(<LockedMedia requiredTier={goldTier} />)

    expect(screen.queryByText(/pagamento/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/meu plano/i)).not.toBeInTheDocument()
  })

  it("never exposes a protected media URL in the DOM", () => {
    const { container } = render(
      <LockedMedia
        requiredTier={goldTier}
        contactActions={[{ type: "WHATSAPP", label: "WhatsApp", url: "https://wa.me/1" }]}
      />,
    )

    expect(container.innerHTML).not.toContain("presigned")
    expect(container.querySelector("img")).not.toBeInTheDocument()
    expect(container.querySelector("source")).not.toBeInTheDocument()
    expect(container.querySelector("video")).not.toBeInTheDocument()
  })
})
