import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import UsersMobileCards from "./UsersMobileCards"
import type { User } from "../../services/users"

const user: User = {
  id: "u1",
  email: "sub@test.com",
  name: "Subscriber",
  status: "ACTIVE",
  roles: ["SUBSCRIBER"],
  tierId: "t-silver",
  tier: { id: "t-silver", name: "Silver", priority: 2 },
  tierAccess: {
    status: "ACTIVE",
    tier: { id: "t-silver", name: "Silver", priority: 2 },
    startsAt: "2026-01-01T00:00:00.000Z",
    expiresAt: "2026-09-01T00:00:00.000Z",
    permanent: false,
    expiringSoon: false,
  },
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
}

const expiredAccount = {
  ...user,
  id: "u2",
  email: "expired@test.com",
  status: "ACTIVE" as const,
  tierAccess: {
    status: "EXPIRED" as const,
    tier: { id: "t-silver", name: "Silver", priority: 2 },
    startsAt: "2026-01-01T00:00:00.000Z",
    expiresAt: "2026-02-01T00:00:00.000Z",
    permanent: false,
    expiringSoon: false,
  },
}

describe("UsersMobileCards", () => {
  it("keeps role, tier, account status and access status distinct", () => {
    render(<UsersMobileCards users={[user]} onManage={vi.fn()} />)

    expect(screen.getByText("Assinante")).toBeInTheDocument()
    expect(screen.getByText("Silver")).toBeInTheDocument()
    expect(screen.getAllByText("Ativo").length).toBeGreaterThan(0)
    expect(screen.getByText(/Válido até/)).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Gerenciar acesso" })).toBeInTheDocument()
  })

  it("represents an active account with expired access clearly", () => {
    render(<UsersMobileCards users={[expiredAccount]} onManage={vi.fn()} />)

    expect(screen.getByText("Expirado")).toBeInTheDocument()
    expect(screen.getAllByText("Ativo").length).toBeGreaterThan(0)
    expect(screen.getByText(/Válido até/)).toBeInTheDocument()
  })
})
