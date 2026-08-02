import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"
import FeedPage from "./FeedPage"

vi.mock("../../services/feed", () => ({
  fetchFeed: vi.fn(),
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
})
