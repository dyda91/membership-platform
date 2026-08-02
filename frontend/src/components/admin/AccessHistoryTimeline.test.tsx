import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import AccessHistoryTimeline from "./AccessHistoryTimeline"
import type { TierAccessHistoryEvent } from "../../services/tier-access"

const event = (overrides: Partial<TierAccessHistoryEvent> = {}): TierAccessHistoryEvent => ({
  id: "e1",
  assignmentId: "a1",
  userId: "u1",
  action: "RENEWED",
  previousTierId: "t-silver",
  newTierId: "t-silver",
  previousStartsAt: "2026-01-01T00:00:00.000Z",
  newStartsAt: "2026-01-01T00:00:00.000Z",
  previousExpiresAt: "2026-02-01T00:00:00.000Z",
  newExpiresAt: "2026-03-01T00:00:00.000Z",
  actorId: "a1",
  internalNote: "Pagamento confirmado",
  createdAt: "2026-01-02T00:00:00.000Z",
  previousTier: { id: "t-silver", name: "Silver" },
  newTier: { id: "t-silver", name: "Silver" },
  actor: { id: "a1", email: "artist@test.com", name: "Artista" },
  ...overrides,
})

describe("AccessHistoryTimeline", () => {
  it("translates actions into readable labels", () => {
    render(<AccessHistoryTimeline events={[event()]} loading={false} />)

    expect(screen.getByText("Renovação")).toBeInTheDocument()
    expect(screen.getByText(/Por artist@test.com/)).toBeInTheDocument()
    expect(screen.getByText(/Nota: Pagamento confirmado/)).toBeInTheDocument()
  })

  it("shows a controlled empty state", () => {
    render(<AccessHistoryTimeline events={[]} loading={false} />)

    expect(screen.getByText("Nenhum evento registrado")).toBeInTheDocument()
  })

  it("shows a loading state", () => {
    const { container } = render(<AccessHistoryTimeline events={null} loading />)

    expect(container.querySelector(".animate-pulse")).toBeInTheDocument()
  })

  it("shows an error with retry", () => {
    render(
      <AccessHistoryTimeline
        events={null}
        loading={false}
        error="Falha ao carregar."
        onRetry={() => undefined}
      />,
    )

    expect(screen.getByText("Falha ao carregar.")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Tentar novamente" })).toBeInTheDocument()
  })
})
