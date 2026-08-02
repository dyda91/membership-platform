import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"
import type { ReactNode } from "react"
import DashboardPage from "./DashboardPage"

vi.mock("../services/dashboard", () => ({
  fetchDashboardSummary: vi.fn(),
}))

vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-router-dom")>()
  return {
    ...actual,
    Link: ({ to, children }: { to: string; children: ReactNode }) => (
      <a href={to}>{children}</a>
    ),
  }
})

import { fetchDashboardSummary } from "../services/dashboard"

const summary = {
  visibleUsers: 5,
  publishedPosts: 3,
  draftPosts: 2,
  archivedPosts: 1,
  tiers: 4,
  activeAccess: 2,
  expiringSoonAccess: 1,
  expiredAccess: 1,
  permanentAccess: 1,
  scheduledAccess: 1,
  revokedAccess: 1,
}

describe("DashboardPage", () => {
  beforeEach(() => {
    vi.mocked(fetchDashboardSummary).mockReset()
  })

  it("renders operational summaries and shortcuts", async () => {
    vi.mocked(fetchDashboardSummary).mockResolvedValue(summary as never)

    render(<DashboardPage />)

    expect(await screen.findByText("5")).toBeInTheDocument()
    expect(screen.getByText("Membros visíveis")).toBeInTheDocument()
    expect(screen.getByText("Posts publicados")).toBeInTheDocument()
    expect(screen.getByText("Criar Post")).toBeInTheDocument()
    expect(screen.getByText("Gerenciar Membros")).toBeInTheDocument()
    expect(screen.getByText("Gerenciar Tiers")).toBeInTheDocument()
    expect(screen.getByText("Editar Perfil Público")).toBeInTheDocument()
  })

  it("shows a controlled error with retry", async () => {
    vi.mocked(fetchDashboardSummary)
      .mockRejectedValueOnce(new Error("network"))
      .mockResolvedValueOnce(summary as never)

    const user = userEvent.setup()
    render(<DashboardPage />)

    expect(
      await screen.findByText("Não foi possível carregar o resumo do painel."),
    ).toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: "Tentar novamente" }))

    expect(await screen.findByText("5")).toBeInTheDocument()
  })

  it("keeps shortcuts usable while the summary loads", () => {
    vi.mocked(fetchDashboardSummary).mockReturnValue(new Promise(() => undefined))

    render(<DashboardPage />)

    expect(screen.getByText("Criar Post")).toBeInTheDocument()
    expect(screen.getByText("Gerenciar Membros")).toBeInTheDocument()
  })
})
