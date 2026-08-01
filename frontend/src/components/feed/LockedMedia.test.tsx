import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import LockedMedia from "./LockedMedia"

describe("LockedMedia", () => {
  it("shows the tier requirement", () => {
    render(<LockedMedia tierName="Gold" />)

    expect(screen.getByText("Conteúdo exclusivo")).toBeInTheDocument()
    expect(screen.getByText(/Disponível para o tier Gold/)).toBeInTheDocument()
  })

  it("renders contact actions when provided", () => {
    render(
      <LockedMedia
        tierName="Gold"
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
    render(<LockedMedia tierName="Gold" contactActions={[]} />)

    expect(
      screen.getByText(/Entre em contato para solicitar acesso/),
    ).toBeInTheDocument()
  })

  it("never renders a payment or plan-management screen", () => {
    render(<LockedMedia tierName="Gold" />)

    expect(screen.queryByText(/pagamento/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/meu plano/i)).not.toBeInTheDocument()
  })
})
