import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import PageContainer from "./PageContainer"
import PageHeader from "./PageHeader"
import PageSection from "./PageSection"

describe("PageContainer", () => {
  it("uses the narrow width for public content", () => {
    const { container } = render(
      <PageContainer width="narrow">conteúdo</PageContainer>,
    )

    expect(container.firstChild).toHaveClass("max-w-2xl")
  })

  it("uses the standard width by default", () => {
    const { container } = render(<PageContainer>conteúdo</PageContainer>)

    expect(container.firstChild).toHaveClass("max-w-4xl")
  })

  it("uses the wide width for administration", () => {
    const { container } = render(
      <PageContainer width="wide">conteúdo</PageContainer>,
    )

    expect(container.firstChild).toHaveClass("max-w-7xl")
  })

  it("adds responsive horizontal padding", () => {
    const { container } = render(<PageContainer>conteúdo</PageContainer>)

    expect(container.firstChild).toHaveClass("px-4", "sm:px-6")
  })
})

describe("PageHeader", () => {
  it("renders a heading and description", () => {
    render(<PageHeader title="Posts" description="Gerencie conteúdos." />)

    expect(screen.getByRole("heading", { level: 1, name: "Posts" })).toBeInTheDocument()
    expect(screen.getByText("Gerencie conteúdos.")).toBeInTheDocument()
  })

  it("renders actions consistently", () => {
    render(
      <PageHeader
        title="Posts"
        actions={<button type="button">Novo post</button>}
      />,
    )

    expect(screen.getByRole("button", { name: "Novo post" })).toBeInTheDocument()
  })
})

describe("PageSection", () => {
  it("renders a section heading", () => {
    render(<PageSection title="Artista ativa">conteúdo</PageSection>)

    expect(screen.getByRole("heading", { level: 2, name: "Artista ativa" })).toBeInTheDocument()
  })
})
