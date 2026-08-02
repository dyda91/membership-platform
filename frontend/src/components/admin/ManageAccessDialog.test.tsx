import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"
import ManageAccessDialog from "./ManageAccessDialog"
import type { User } from "../../services/users"

vi.mock("../../services/tier-access", () => ({
  fetchTierAccess: vi.fn(),
  fetchTierAccessHistory: vi.fn(),
  grantTierAccess: vi.fn(),
  renewTierAccess: vi.fn(),
  revokeTierAccess: vi.fn(),
}))

vi.mock("../../services/users", () => ({
  fetchUser: vi.fn(),
}))

import {
  fetchTierAccess,
  fetchTierAccessHistory,
  grantTierAccess,
  renewTierAccess,
  revokeTierAccess,
} from "../../services/tier-access"
import { fetchUser } from "../../services/users"

const tiers = [
  { id: "t-free", name: "Free", description: "Gratuito", priority: 0, createdAt: "", updatedAt: "" },
  { id: "t-silver", name: "Silver", description: "Prata", priority: 2, createdAt: "", updatedAt: "" },
  { id: "t-gold", name: "Gold", description: "Ouro", priority: 5, createdAt: "", updatedAt: "" },
]

const subscriber: User = {
  id: "u1",
  email: "sub@test.com",
  name: "Subscriber",
  status: "ACTIVE",
  roles: ["SUBSCRIBER"],
  tierId: null,
  tier: null,
  tierAccess: { status: "NONE", tier: null, startsAt: null, expiresAt: null, permanent: false, expiringSoon: false },
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
}

function setup(overrides: Partial<Parameters<typeof ManageAccessDialog>[0]> = {}) {
  const onUpdated = vi.fn()
  const onClose = vi.fn()

  render(
    <ManageAccessDialog
      user={subscriber}
      tiers={tiers}
      isSuperAdmin={false}
      onClose={onClose}
      onUpdated={onUpdated}
      {...overrides}
    />,
  )

  return { onUpdated, onClose }
}

describe("ManageAccessDialog", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("separates identity, account, role and access sections", () => {
    setup()

    expect(screen.getByText("Identidade")).toBeInTheDocument()
    expect(screen.getByText("Conta")).toBeInTheDocument()
    expect(screen.getByText("Role")).toBeInTheDocument()
    expect(screen.getByText("Acesso")).toBeInTheDocument()
  })

  it("shows a result summary when a tier is selected", async () => {
    const user = userEvent.setup()
    setup()

    await user.selectOptions(screen.getByTestId("tier-select"), "t-gold")

    expect(screen.getByText("Resultado esperado")).toBeInTheDocument()
    expect(screen.getByText("Gold")).toBeInTheDocument()
  })

  it("validates invalid dates next to the controls", async () => {
    const user = userEvent.setup()
    setup()

    await user.selectOptions(screen.getByTestId("tier-select"), "t-silver")
    await user.clear(screen.getByLabelText("Início"))
    await user.click(screen.getByRole("button", { name: "Conceder / salvar" }))

    expect(screen.getByText("Informe a data de início.")).toBeInTheDocument()
    expect(grantTierAccess).not.toHaveBeenCalled()
  })

  it("grants access and refreshes the user state", async () => {
    vi.mocked(grantTierAccess).mockResolvedValue({ assignment: {}, event: {} } as never)
    vi.mocked(fetchTierAccess).mockResolvedValue({
      status: "ACTIVE",
      tier: { id: "t-silver", name: "Silver", priority: 2 },
      startsAt: "2026-01-01T00:00:00.000Z",
      expiresAt: "2026-02-01T00:00:00.000Z",
      permanent: false,
      expiringSoon: false,
    } as never)
    vi.mocked(fetchUser).mockResolvedValue({
      ...subscriber,
      tierId: "t-silver",
      tier: { id: "t-silver", name: "Silver", priority: 2 },
    } as never)

    const user = userEvent.setup()
    const { onUpdated } = setup()

    await user.selectOptions(screen.getByTestId("tier-select"), "t-silver")
    await user.click(screen.getByLabelText("Acesso permanente"))
    await user.click(screen.getByRole("button", { name: "Conceder / salvar" }))

    expect(grantTierAccess).toHaveBeenCalled()
    expect(onUpdated).toHaveBeenCalled()
    expect(await screen.findByText("Acesso concedido com sucesso.")).toBeInTheDocument()
  })

  it("renews access with a duration shortcut", async () => {
    vi.mocked(renewTierAccess).mockResolvedValue({ assignment: {}, event: {} } as never)
    vi.mocked(fetchTierAccess).mockResolvedValue({
      status: "ACTIVE",
      tier: { id: "t-silver", name: "Silver", priority: 2 },
      startsAt: "2026-01-01T00:00:00.000Z",
      expiresAt: "2026-02-01T00:00:00.000Z",
      permanent: false,
      expiringSoon: false,
    } as never)

    setup({
      user: {
        ...subscriber,
        tierId: "t-silver",
        tier: { id: "t-silver", name: "Silver", priority: 2 },
        tierAccess: {
          status: "ACTIVE",
          tier: { id: "t-silver", name: "Silver", priority: 2 },
          startsAt: "2026-01-01T00:00:00.000Z",
          expiresAt: "2026-02-01T00:00:00.000Z",
          permanent: false,
          expiringSoon: false,
        },
      },
    })

    const user = userEvent.setup()
    await user.click(screen.getByRole("button", { name: "Renovar" }))
    await user.click(screen.getByRole("button", { name: "+30 dias" }))
    await user.click(screen.getByRole("button", { name: "Confirmar renovação" }))

    expect(renewTierAccess).toHaveBeenCalled()
  })

  it("requires confirmation before revocation", async () => {
    vi.mocked(fetchTierAccess).mockResolvedValue({
      status: "ACTIVE",
      tier: { id: "t-gold", name: "Gold", priority: 5 },
      startsAt: "2026-01-01T00:00:00.000Z",
      expiresAt: "2026-02-01T00:00:00.000Z",
      permanent: false,
      expiringSoon: false,
    } as never)

    setup({
      user: {
        ...subscriber,
        tierId: "t-gold",
        tier: { id: "t-gold", name: "Gold", priority: 5 },
        tierAccess: {
          status: "ACTIVE",
          tier: { id: "t-gold", name: "Gold", priority: 5 },
          startsAt: "2026-01-01T00:00:00.000Z",
          expiresAt: "2026-02-01T00:00:00.000Z",
          permanent: false,
          expiringSoon: false,
        },
      },
    })

    const user = userEvent.setup()
    await user.click(screen.getByRole("button", { name: "Revogar" }))

    const dialog = screen.getByRole("dialog", { name: "Revogar acesso" })
    expect(dialog).toBeInTheDocument()
    expect(revokeTierAccess).not.toHaveBeenCalled()

    await user.click(screen.getByRole("button", { name: "Cancelar" }))

    expect(revokeTierAccess).not.toHaveBeenCalled()
  })

  it("loads and renders access history", async () => {
    vi.mocked(fetchTierAccessHistory).mockResolvedValue([
      {
        id: "e1",
        assignmentId: "a1",
        userId: "u1",
        action: "GRANTED",
        previousTierId: null,
        newTierId: "t-gold",
        previousStartsAt: null,
        newStartsAt: "2026-01-01T00:00:00.000Z",
        previousExpiresAt: null,
        newExpiresAt: "2026-02-01T00:00:00.000Z",
        actorId: null,
        internalNote: null,
        createdAt: "2026-01-01T00:00:00.000Z",
        previousTier: null,
        newTier: { id: "t-gold", name: "Gold" },
        actor: null,
      },
    ] as never)

    const user = userEvent.setup()
    setup()

    await user.click(screen.getByRole("button", { name: "Ver histórico" }))

    expect(await screen.findByText("Acesso concedido")).toBeInTheDocument()
  })
})
