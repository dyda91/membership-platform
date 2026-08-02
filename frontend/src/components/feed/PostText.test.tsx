import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"
import PostText from "./PostText"

describe("PostText", () => {
  it("renders short text fully without a toggle", () => {
    render(<PostText content="Um texto curto." />)

    expect(screen.getByText("Um texto curto.")).toBeInTheDocument()
    expect(screen.queryByText("Mostrar mais")).not.toBeInTheDocument()
  })

  it("renders nothing for empty content", () => {
    const { container } = render(<PostText content="" />)

    expect(container).toBeEmptyDOMElement()
  })

  it("collapses long text and expands on demand", async () => {
    const user = userEvent.setup()
    const long = "a".repeat(500)

    render(<PostText content={long} />)

    expect(screen.queryByText(long)).not.toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Mostrar mais" })).toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: "Mostrar mais" }))

    expect(screen.getByRole("button", { name: "Mostrar menos" })).toBeInTheDocument()
    expect(screen.getByText(long)).toBeInTheDocument()
  })

  it("preserves line breaks with pre-wrap behavior", () => {
    const { container } = render(<PostText content={"linha 1\nlinha 2"} />)

    expect(container.querySelector("p")).toHaveClass("whitespace-pre-wrap")
  })
})
