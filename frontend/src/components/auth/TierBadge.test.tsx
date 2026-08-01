import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import TierBadge from "./TierBadge"

describe("TierBadge", () => {
  it("renders the tier name when a tier is assigned", () => {
    render(<TierBadge tier={{ id: "t1", name: "Gold", priority: 3 }} />)

    expect(screen.getByText("Gold")).toBeInTheDocument()
  })

  it("renders a free label when no tier is assigned", () => {
    render(<TierBadge tier={null} />)

    expect(screen.getByText("Gratuito")).toBeInTheDocument()
  })
})
