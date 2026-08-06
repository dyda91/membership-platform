import { describe, expect, it } from "vitest"
import type { SessionUser } from "../../services/auth"
import { getAccountContext } from "./accountContext"

const baseUser: SessionUser = {
  id: "u1",
  email: "user@test.com",
  name: null,
  status: "ACTIVE",
  roles: ["SUBSCRIBER"],
  tier: null,
  tierId: null,
  tierPriority: null,
  isSuperAdmin: false,
  isArtist: false,
  isSubscriber: true,
}

describe("getAccountContext", () => {
  it("shows a valid tier with a validity date", () => {
    const context = getAccountContext({
      ...baseUser,
      tier: { id: "g", name: "Gold", priority: 2 },
      tierAccessStatus: "ACTIVE",
      tierExpiresAt: "2026-09-15T00:00:00.000Z",
    })

    expect(context.title).toBe("Gold")
    expect(context.subtitle).toMatch(/Válido até/)
  })

  it("shows permanent access", () => {
    const context = getAccountContext({
      ...baseUser,
      tier: { id: "s", name: "Silver", priority: 1 },
      tierAccessStatus: "PERMANENT",
      tierPermanent: true,
    })

    expect(context.title).toBe("Silver")
    expect(context.subtitle).toBe("Acesso permanente")
  })

  it("shows an expired tier as free access without presenting the tier as active", () => {
    const context = getAccountContext({
      ...baseUser,
      tier: { id: "g", name: "Gold", priority: 2 },
      tierAccessStatus: "EXPIRED",
    })

    expect(context.title).toBe("Gratuito")
    expect(context.subtitle).toMatch(/Gold expirado/)
  })

  it("shows free access without a tier", () => {
    const context = getAccountContext(baseUser)

    expect(context.title).toBe("Gratuito")
    expect(context.subtitle).toBe("Acesso gratuito")
  })

  it("emphasizes the artist role instead of a tier", () => {
    const context = getAccountContext({
      ...baseUser,
      roles: ["ARTIST"],
      isArtist: true,
      isSubscriber: false,
    })

    expect(context.title).toBe("Artista")
    expect(context.subtitle).toBe("Gerenciamento da plataforma")
  })

  it("emphasizes the super admin role", () => {
    const context = getAccountContext({
      ...baseUser,
      roles: ["SUPER_ADMIN"],
      isSuperAdmin: true,
      isSubscriber: false,
    })

    expect(context.title).toBe("Super Admin")
    expect(context.subtitle).toBe("Administração do sistema")
  })
})
