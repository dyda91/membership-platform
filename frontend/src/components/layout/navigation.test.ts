import { describe, expect, it } from "vitest"
import type { SessionUser } from "../../services/auth"
import { primaryNavigation } from "./navigation"

const makeUser = (roles: SessionUser["roles"]): SessionUser => ({
  id: "u1",
  email: "user@test.com",
  name: null,
  status: "ACTIVE",
  roles,
  tier: null,
  tierId: null,
  tierPriority: null,
  isSuperAdmin: roles.includes("SUPER_ADMIN"),
  isArtist: roles.includes("ARTIST"),
  isSubscriber: roles.includes("SUBSCRIBER"),
})

const labels = (items: ReturnType<typeof primaryNavigation>) =>
  items.map((item) => item.label)

describe("primaryNavigation", () => {
  it("gives a visitor only the public feed", () => {
    const items = primaryNavigation(null)
    expect(labels(items)).toEqual(["Feed"])
  })

  it("gives a subscriber the feed, profile and messages without admin links", () => {
    const items = primaryNavigation(makeUser(["SUBSCRIBER"]))
    expect(labels(items)).toEqual(["Feed", "Perfil", "Mensagens"])
  })

  it("gives an artist the feed, admin pages, profile and messages", () => {
    const items = primaryNavigation(makeUser(["ARTIST"]))
    expect(labels(items)).toEqual([
      "Feed",
      "Dashboard",
      "Posts",
      "Usuários",
      "Tiers",
      "Página da artista",
      "Perfil",
      "Mensagens",
    ])
  })

  it("gives a super administrator the artist configuration link", () => {
    const items = primaryNavigation(makeUser(["SUPER_ADMIN"]))
    expect(labels(items)).toContain("Configurar artista")
    expect(labels(items)).toContain("Perfil")
  })
})
