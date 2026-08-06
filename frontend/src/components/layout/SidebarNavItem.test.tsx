import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { MemoryRouter } from "react-router-dom"
import SidebarNavItem from "./SidebarNavItem"
import { IconHome } from "../ui/Icons"

function setup(props: Partial<Parameters<typeof SidebarNavItem>[0]> = {}) {
  return render(
    <MemoryRouter initialEntries={["/posts/new"]}>
      <ul>
        <SidebarNavItem
          label="Posts"
          to="/posts"
          icon={<IconHome />}
          {...props}
        />
      </ul>
    </MemoryRouter>,
  )
}

describe("SidebarNavItem", () => {
  it("renders the label with a link", () => {
    setup()

    expect(screen.getByRole("link", { name: "Posts" })).toBeInTheDocument()
  })

  it("marks a nested route as the current page", () => {
    setup()

    expect(screen.getByRole("link", { name: "Posts" })).toHaveAttribute(
      "aria-current",
      "page",
    )
  })

  it("adds an accessible name and tooltip when collapsed", () => {
    setup({ collapsed: true })

    const link = screen.getByRole("link", { name: "Posts" })
    expect(link).toHaveAttribute("title", "Posts")
    expect(link).toHaveAttribute("aria-label", "Posts")
  })

  it("does not add aria-current for an unrelated route", () => {
    setup({ to: "/messages", label: "Messages" })

    expect(screen.getByRole("link", { name: "Messages" })).not.toHaveAttribute(
      "aria-current",
    )
  })

  it("shows an unread badge count", () => {
    setup({ badgeCount: 7 })

    expect(screen.getByText("7")).toBeInTheDocument()
    expect(screen.getByLabelText("7 mensagens não lidas")).toBeInTheDocument()
  })
})
