import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import PostAdminCard from "./PostAdminCard"
import type { Post } from "../../services/posts"

const makePost = (overrides: Partial<Post> = {}): Post => ({
  id: "p1",
  title: null,
  content: "Conteúdo do post",
  status: "DRAFT",
  authorId: "a1",
  tierId: null,
  tier: null,
  media: [],
  author: { id: "a1", email: "artist@test.com", name: "Artista" },
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
  ...overrides,
})

function setup(post: Post) {
  const onEdit = vi.fn()
  const onPublish = vi.fn()
  const onArchive = vi.fn()
  const onDelete = vi.fn()

  render(
    <PostAdminCard
      post={post}
      onEdit={onEdit}
      onPublish={onPublish}
      onArchive={onArchive}
      onDelete={onDelete}
    />,
  )

  return { onEdit, onPublish, onArchive, onDelete }
}

describe("PostAdminCard", () => {
  it("shows a draft post with publish and archive actions", () => {
    setup(makePost({ status: "DRAFT" }))

    expect(screen.getByText("Rascunho")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Publicar" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Arquivar" })).toBeInTheDocument()
  })

  it("shows a published post without publish action", () => {
    setup(makePost({ status: "PUBLISHED" }))

    expect(screen.getByText("Publicado")).toBeInTheDocument()
    expect(screen.queryByRole("button", { name: "Publicar" })).not.toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Arquivar" })).toBeInTheDocument()
  })

  it("shows an archived post with a restore action", () => {
    setup(makePost({ status: "ARCHIVED" }))

    expect(screen.getByText("Arquivado")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Restaurar" })).toBeInTheDocument()
    expect(screen.queryByRole("button", { name: "Arquivar" })).not.toBeInTheDocument()
  })

  it("shows the required tier as a badge", () => {
    setup(
      makePost({
        status: "PUBLISHED",
        tier: { id: "t-gold", name: "Gold", description: "", priority: 5, createdAt: "", updatedAt: "" },
      }),
    )

    expect(screen.getByText("Tier: Gold")).toBeInTheDocument()
  })
})
