import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import PostHeader from "./PostHeader"

describe("PostHeader", () => {
  it("shows the author name when present", () => {
    render(
      <PostHeader
        author={{ id: "a1", name: "Nome da artista" }}
        createdAt="2026-01-01T00:00:00.000Z"
      />,
    )

    expect(screen.getByText("Nome da artista")).toBeInTheDocument()
  })

  it("falls back to the artist public name when the author has no name", () => {
    render(
      <PostHeader
        author={{ id: "a1", name: null }}
        artistName="teste"
        createdAt="2026-01-01T00:00:00.000Z"
      />,
    )

    expect(screen.getByText("teste")).toBeInTheDocument()
    expect(screen.queryByText("Artista")).not.toBeInTheDocument()
  })

  it("falls back to a generic label when neither name exists", () => {
    render(
      <PostHeader
        author={{ id: "a1", name: null }}
        artistName={null}
        createdAt="2026-01-01T00:00:00.000Z"
      />,
    )

    expect(screen.getByText("Artista")).toBeInTheDocument()
  })
})
