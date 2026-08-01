import { render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import PostForm from "./PostForm"

vi.mock("../../services/posts", () => ({
  createPost: vi.fn().mockResolvedValue({ id: "p1" }),
  updatePost: vi.fn().mockResolvedValue({ id: "p1" }),
}))

vi.mock("../../services/media", () => ({
  fetchMedia: vi.fn().mockResolvedValue([]),
  associateMedia: vi.fn().mockResolvedValue({}),
}))

vi.mock("./TierSelector", () => ({
  default: () => <div data-testid="tier-selector" />,
}))

vi.mock("./MediaUploader", () => ({
  default: ({ media }: { media: unknown[] }) => (
    <div data-testid="media-uploader">{media.length} items</div>
  ),
}))

describe("PostForm", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("does not render a title input or cover selector", () => {
    render(<PostForm onSaved={() => undefined} />)

    expect(screen.queryByLabelText(/título/i)).not.toBeInTheDocument()
    expect(screen.queryByLabelText(/capa/i)).not.toBeInTheDocument()
    expect(screen.getByLabelText(/conteúdo/i)).toBeInTheDocument()
    expect(screen.getByTestId("tier-selector")).toBeInTheDocument()
    expect(screen.getByTestId("media-uploader")).toBeInTheDocument()
  })

  it("keeps the draft and publish controls", () => {
    render(<PostForm onSaved={() => undefined} />)

    expect(screen.getByText("Salvar rascunho")).toBeInTheDocument()
    expect(screen.getByText("Publicar")).toBeInTheDocument()
  })
})
