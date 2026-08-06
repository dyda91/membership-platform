import { describe, expect, it } from "vitest"
import { getRightPanelForRoute } from "./getRightPanelForRoute"
import AccountSidePanel from "./AccountSidePanel"
import DashboardSidePanel from "./DashboardSidePanel"
import PostsSidePanel from "./PostsSidePanel"
import TiersSidePanel from "./TiersSidePanel"
import UsersSidePanel from "./UsersSidePanel"

describe("getRightPanelForRoute", () => {
  it("maps /posts and nested posts routes to the posts panel", () => {
    expect(getRightPanelForRoute("/posts")).toMatchObject({ type: PostsSidePanel })
    expect(getRightPanelForRoute("/posts/new")).toMatchObject({
      type: PostsSidePanel,
    })
    expect(getRightPanelForRoute("/posts/abc/edit")).toMatchObject({
      type: PostsSidePanel,
    })
  })

  it("maps users, tiers and dashboard routes to their panels", () => {
    expect(getRightPanelForRoute("/users")).toMatchObject({ type: UsersSidePanel })
    expect(getRightPanelForRoute("/tiers")).toMatchObject({ type: TiersSidePanel })
    expect(getRightPanelForRoute("/dashboard")).toMatchObject({
      type: DashboardSidePanel,
    })
  })

  it("maps profile and security to the account panel", () => {
    expect(getRightPanelForRoute("/profile")).toMatchObject({
      type: AccountSidePanel,
    })
    expect(getRightPanelForRoute("/profile/security")).toMatchObject({
      type: AccountSidePanel,
    })
  })

  it("leaves routes without a static panel to the pages", () => {
    expect(getRightPanelForRoute("/")).toBeNull()
    expect(getRightPanelForRoute("/messages")).toBeNull()
    expect(getRightPanelForRoute("/artist-profile/edit")).toBeNull()
  })
})
