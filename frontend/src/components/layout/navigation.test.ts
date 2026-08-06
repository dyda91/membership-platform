import { describe, expect, it } from "vitest"
import type { SessionUser } from "../../services/auth"
import {
  getNavigationForUser,
  groupNavigation,
  isPathActive,
  mobilePrimaryNavigation,
} from "./navigation"

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

const labels = (items: ReturnType<typeof getNavigationForUser>) =>
  items.map((item) => item.label)

describe("getNavigationForUser", () => {
  it("gives a visitor only the public feed", () => {
    const items = getNavigationForUser(null)
    expect(labels(items)).toEqual(["Feed"])
  })

  it("gives a subscriber feed, messages, profile and security without admin links", () => {
    const items = getNavigationForUser(makeUser(["SUBSCRIBER"]))
    expect(labels(items)).toEqual([
      "Feed",
      "Mensagens",
      "Perfil",
      "Segurança",
    ])
  })

  it("gives an artist the admin pages, artist page, profile and messages", () => {
    const items = getNavigationForUser(makeUser(["ARTIST"]))
    expect(labels(items)).toEqual([
      "Feed",
      "Mensagens",
      "Dashboard",
      "Posts",
      "Usuários",
      "Tiers",
      "Página da artista",
      "Perfil",
      "Segurança",
    ])
  })

  it("gives a super administrator the artist configuration link", () => {
    const items = getNavigationForUser(makeUser(["SUPER_ADMIN"]))
    expect(labels(items)).toContain("Configurar artista")
    expect(labels(items)).toContain("Página da artista")
    expect(labels(items)).toContain("Perfil")
  })

  it("marks messages with the unread badge flag", () => {
    const items = getNavigationForUser(makeUser(["SUBSCRIBER"]))
    const messages = items.find((item) => item.id === "messages")
    expect(messages?.badge).toBe(true)
  })
})

describe("groupNavigation", () => {
  it("groups subscriber items into primary and account groups only", () => {
    const groups = groupNavigation(getNavigationForUser(makeUser(["SUBSCRIBER"])))
    expect(groups.map((group) => group.id)).toEqual(["primary", "account"])
  })

  it("adds management and artist groups for an artist", () => {
    const groups = groupNavigation(getNavigationForUser(makeUser(["ARTIST"])))
    expect(groups.map((group) => group.id)).toEqual([
      "primary",
      "management",
      "artist",
      "account",
    ])
  })
})

describe("mobilePrimaryNavigation", () => {
  it("shows feed, messages and profile as subscriber primary destinations", () => {
    const items = mobilePrimaryNavigation(makeUser(["SUBSCRIBER"]))
    expect(labels(items)).toEqual(["Feed", "Mensagens", "Perfil"])
  })

  it("shows feed, messages and dashboard for an artist, without profile", () => {
    const items = mobilePrimaryNavigation(makeUser(["ARTIST"]))
    expect(labels(items)).toEqual(["Feed", "Mensagens", "Dashboard"])
  })

  it("shows feed, messages and dashboard for a super administrator", () => {
    const items = mobilePrimaryNavigation(makeUser(["SUPER_ADMIN"]))
    expect(labels(items)).toEqual(["Feed", "Mensagens", "Dashboard"])
  })
})

describe("isPathActive", () => {
  it("matches the base path exactly", () => {
    expect(isPathActive("/posts", "/posts")).toBe(true)
  })

  it("activates a parent for nested routes without end", () => {
    expect(isPathActive("/posts/new", "/posts")).toBe(true)
    expect(isPathActive("/posts/abc/edit", "/posts")).toBe(true)
  })

  it("does not match an unrelated prefix", () => {
    expect(isPathActive("/profile", "/posts")).toBe(false)
  })

  it("requires an exact match when end is set", () => {
    expect(isPathActive("/profile", "/profile", true)).toBe(true)
    expect(isPathActive("/profile/security", "/profile", true)).toBe(false)
  })

  it("keeps exact routes for a root path", () => {
    expect(isPathActive("/", "/", true)).toBe(true)
    expect(isPathActive("/messages", "/", true)).toBe(false)
  })
})
