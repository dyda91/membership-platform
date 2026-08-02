import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import Badge from "./Badge"
import { RoleBadge, AccountStatusBadge, AccessStatusBadge } from "./status-badges"

describe("Badge", () => {
  it("renders children with a variant", () => {
    render(<Badge variant="success">Ativo</Badge>)

    const badge = screen.getByText("Ativo")
    expect(badge).toHaveClass("bg-success-muted")
  })

  it("never relies on color alone because text is rendered", () => {
    render(<Badge variant="danger">Expirado</Badge>)

    expect(screen.getByText("Expirado")).toBeInTheDocument()
  })
})

describe("Status badges", () => {
  it("renders role labels with text", () => {
    render(<RoleBadge role="ARTIST" />)
    expect(screen.getByText("Artista")).toBeInTheDocument()
  })

  it("renders account status labels with text", () => {
    render(<AccountStatusBadge status="ACTIVE" />)
    expect(screen.getByText("Ativo")).toBeInTheDocument()
  })

  it("renders access status labels with text", () => {
    render(<AccessStatusBadge status="PERMANENT" />)
    expect(screen.getByText("Permanente")).toBeInTheDocument()
  })
})
