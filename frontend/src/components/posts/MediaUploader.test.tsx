import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"
import MediaUploader from "./MediaUploader"
import type { Media } from "../../services/media"

vi.mock("../../services/media", () => ({
  uploadMedia: vi.fn(),
  deleteMedia: vi.fn(),
  reorderMedia: vi.fn(),
}))

import { deleteMedia, reorderMedia, uploadMedia } from "../../services/media"

const imageFile = new File(["data"], "foto.png", { type: "image/png" })

const makeMedia = (id: string, overrides: Partial<Media> = {}): Media => ({
  id,
  postId: "p1",
  position: 0,
  storageKey: id,
  filename: id,
  originalName: `${id}.png`,
  mimeType: "image/png",
  size: 10,
  type: "IMAGE",
  width: 100,
  height: 100,
  duration: null,
  url: `https://cdn/${id}.png`,
  createdAt: "2026-01-01T00:00:00.000Z",
  ...overrides,
})

function fileInput(container: HTMLElement) {
  return container.querySelector('input[type="file"]') as HTMLInputElement
}

describe("MediaUploader", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("shows a processing state and commits the result", async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()

    let resolveUpload: (value: Media) => void = () => undefined
    vi.mocked(uploadMedia).mockReturnValue(
      new Promise<Media>((resolve) => {
        resolveUpload = resolve
      }) as never,
    )

    const { container } = render(
      <MediaUploader postId="p1" media={[]} onChange={onChange} />,
    )

    await user.upload(fileInput(container), imageFile)

    expect(screen.getByText("Enviando")).toBeInTheDocument()

    resolveUpload(makeMedia("m1"))

    await waitFor(() => {
      expect(onChange).toHaveBeenCalledWith([makeMedia("m1")])
    })
  })

  it("shows a per-item failure and retries", async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    vi.mocked(uploadMedia)
      .mockRejectedValueOnce(new Error("network"))
      .mockResolvedValueOnce(makeMedia("m1") as never)

    const { container } = render(
      <MediaUploader postId="p1" media={[]} onChange={onChange} />,
    )

    await user.upload(fileInput(container), imageFile)

    expect(await screen.findByText("Não foi possível enviar.")).toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: "Tentar novamente" }))

    await waitFor(() => {
      expect(onChange).toHaveBeenCalledWith([makeMedia("m1")])
    })
  })

  it("marks the first item as primary and removes media", async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    vi.mocked(deleteMedia).mockResolvedValue({} as never)
    const media = [makeMedia("m1"), makeMedia("m2", { position: 1 })]

    render(<MediaUploader postId="p1" media={media} onChange={onChange} />)

    expect(screen.getByText("Principal")).toBeInTheDocument()

    await user.click(screen.getAllByRole("button", { name: "Remover" })[0])

    expect(deleteMedia).toHaveBeenCalledWith("m1")
    await waitFor(() => {
      expect(onChange).toHaveBeenCalledWith([makeMedia("m2", { position: 1 })])
    })
  })

  it("persists a reorder when all media are associated", async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    const media = [makeMedia("m1"), makeMedia("m2", { position: 1 })]
    vi.mocked(reorderMedia).mockResolvedValue([
      makeMedia("m2", { position: 0 }),
      makeMedia("m1", { position: 1 }),
    ] as never)

    render(<MediaUploader postId="p1" media={media} onChange={onChange} />)

    await user.click(screen.getAllByRole("button", { name: "Mover para baixo" })[0])

    expect(reorderMedia).toHaveBeenCalledWith("p1", ["m2", "m1"])
    await waitFor(() => {
      expect(onChange).toHaveBeenCalled()
    })
  })
})
