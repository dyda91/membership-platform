import { describe, expect, it } from "vitest"
import type { SessionUser } from "./auth"
import {
  canAccessDashboard,
  canManagePosts,
  canManageTiers,
  canManageUsers,
  hasRole,
  isSuperAdmin,
} from "./permissions"

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

describe("permissions", () => {
  it("denies dashboard access to subscribers", () => {
    expect(canAccessDashboard(makeUser(["SUBSCRIBER"]))).toBe(false)
  })

  it("grants dashboard access to artists", () => {
    expect(canAccessDashboard(makeUser(["ARTIST"]))).toBe(true)
    expect(canManagePosts(makeUser(["ARTIST"]))).toBe(true)
    expect(canManageUsers(makeUser(["ARTIST"]))).toBe(true)
    expect(canManageTiers(makeUser(["ARTIST"]))).toBe(true)
  })

  it("grants access to super admins", () => {
    expect(canAccessDashboard(makeUser(["SUPER_ADMIN"]))).toBe(true)
    expect(isSuperAdmin(makeUser(["SUPER_ADMIN"]))).toBe(true)
  })

  it("handles a null user safely", () => {
    expect(canAccessDashboard(null)).toBe(false)
    expect(hasRole(null, "ARTIST")).toBe(false)
  })
})
