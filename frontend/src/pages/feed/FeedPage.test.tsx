import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"
import FeedPage from "./FeedPage"

vi.mock("../../services/feed", () => ({
  fetchFeed: vi.fn(),
}))

vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-router-dom")>()
  return {
    ...actual,
    Link: ({ to, children }: { to: string; children: React.ReactNode }) => (
      <a href={to}>{children}</a>
    ),
  }
})

vi.mock("../../contexts/AuthContext", () => ({
  useAuth: () => ({ canManageContent: false }),
}))

import { fetchFeed } from "../../services/feed"

const feedData = {
  items: [
    {
      id: "p1",
      content: "Conteúdo do post",
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
      author: { id: "a1", name: "Artista" },
      requiredTier: null,
      mediaAccess: true,
      media: [],
    },
  ],
  page: 1,
  limit: 10,
  total: 1,
  artist: {
    configured: true,
    name: "Test Artist",
    bio: null,
    presentationText: null,
    avatarUrl: null,
    bannerUrl: null,
    contactActions: [],
  },
}

describe("FeedPage", () => {
  beforeEach(() => {
    vi.mocked(fetchFeed).mockReset()
  })

  it("renders the artist header and the feed list", async () => {
    vi.mocked(fetchFeed).mockResolvedValue(feedData as never)

    render(<FeedPage />)

    expect(await screen.findByText("Test Artist")).toBeInTheDocument()
    expect(screen.getByText("Feed")).toBeInTheDocument()
    expect(screen.getByText("Conteúdo do post")).toBeInTheDocument()
  })

  it("shows a controlled error state with retry", async () => {
    vi.mocked(fetchFeed)
      .mockRejectedValueOnce(new Error("network"))
      .mockResolvedValueOnce(feedData as never)

    const user = userEvent.setup()
    render(<FeedPage />)

    expect(
      await screen.findByText("Não foi possível carregar o feed."),
    ).toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: "Tentar novamente" }))

    expect(await screen.findByText("Test Artist")).toBeInTheDocument()
  })

  it("shows an empty state when no posts exist", async () => {
    vi.mocked(fetchFeed).mockResolvedValue({
      ...feedData,
      items: [],
      total: 0,
    } as never)

    render(<FeedPage />)

    expect(
      await screen.findByText("Nenhum post publicado ainda"),
    ).toBeInTheDocument()
  })

  it("appends more posts without clearing or duplicating existing ones", async () => {
    const first = [
      { id: "p1", content: "Primeiro", createdAt: "2026-01-02T00:00:00.000Z", updatedAt: "2026-01-02T00:00:00.000Z", author: { id: "a1", name: "Artista" }, requiredTier: null, mediaAccess: true, media: [] },
      { id: "p2", content: "Segundo", createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-01-01T00:00:00.000Z", author: { id: "a1", name: "Artista" }, requiredTier: null, mediaAccess: true, media: [] },
    ]
    const second = [{ id: "p3", content: "Terceiro", createdAt: "2025-12-31T00:00:00.000Z", updatedAt: "2025-12-31T00:00:00.000Z", author: { id: "a1", name: "Artista" }, requiredTier: null, mediaAccess: true, media: [] }]

    vi.mocked(fetchFeed)
      .mockResolvedValueOnce({ ...feedData, items: first, page: 1, limit: 10, total: 3 } as never)
      .mockResolvedValueOnce({ ...feedData, items: second, page: 2, limit: 10, total: 3 } as never)

    const user = userEvent.setup()
    render(<FeedPage />)

    await screen.findByText("Primeiro")
    expect(screen.queryByText("Terceiro")).not.toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: "Carregar mais" }))

    expect(await screen.findByText("Terceiro")).toBeInTheDocument()
    expect(screen.getByText("Primeiro")).toBeInTheDocument()
    expect(screen.getByText("Segundo")).toBeInTheDocument()
    expect(fetchFeed).toHaveBeenLastCalledWith(2, 10)
  })

  it("shows a load-more error while keeping existing posts and allows retry", async () => {
    vi.mocked(fetchFeed)
      .mockResolvedValueOnce({ ...feedData, items: [{ id: "p1", content: "Primeiro", createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-01-01T00:00:00.000Z", author: { id: "a1", name: "Artista" }, requiredTier: null, mediaAccess: true, media: [] }], page: 1, limit: 10, total: 2 } as never)
      .mockRejectedValueOnce(new Error("network"))
      .mockResolvedValueOnce({ ...feedData, items: [{ id: "p2", content: "Segundo", createdAt: "2025-12-31T00:00:00.000Z", updatedAt: "2025-12-31T00:00:00.000Z", author: { id: "a1", name: "Artista" }, requiredTier: null, mediaAccess: true, media: [] }], page: 2, limit: 10, total: 2 } as never)

    const user = userEvent.setup()
    render(<FeedPage />)

    await screen.findByText("Primeiro")

    await user.click(screen.getByRole("button", { name: "Carregar mais" }))

    expect(await screen.findByText("Não foi possível carregar mais posts.")).toBeInTheDocument()
    expect(screen.getByText("Primeiro")).toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: "Tentar novamente" }))

    expect(await screen.findByText("Segundo")).toBeInTheDocument()
  })

  it("shows the end-of-Feed state when all posts are loaded", async () => {
    vi.mocked(fetchFeed).mockResolvedValue({
      ...feedData,
      items: [{ id: "p1", content: "Único", createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-01-01T00:00:00.000Z", author: { id: "a1", name: "Artista" }, requiredTier: null, mediaAccess: true, media: [] }],
      page: 1,
      limit: 10,
      total: 1,
    } as never)

    render(<FeedPage />)

    expect(await screen.findByText("Você chegou ao fim do Feed.")).toBeInTheDocument()
    expect(screen.queryByRole("button", { name: "Carregar mais" })).not.toBeInTheDocument()
  })
})
