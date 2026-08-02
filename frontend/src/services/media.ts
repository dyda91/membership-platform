import api from "./api"

export type MediaType = "IMAGE" | "VIDEO"

export interface Media {
  id: string
  postId: string | null
  position: number
  storageKey: string
  filename: string
  originalName: string
  mimeType: string
  size: number
  type: MediaType
  width: number | null
  height: number | null
  duration: number | null
  url: string
  createdAt: string
}

export async function uploadMedia(file: File, postId?: string) {
  const formData = new FormData()
  formData.append("file", file)

  if (postId) {
    formData.append("postId", postId)
  }

  const response = await api.post<Media>("/media/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  })

  return response.data
}

export async function fetchMedia(postId?: string) {
  const response = await api.get<Media[]>("/media", {
    params: postId ? { postId } : undefined,
  })

  return response.data
}

export async function fetchMediaItem(id: string) {
  const response = await api.get<Media>(`/media/${id}`)

  return response.data
}

export async function associateMedia(postId: string, mediaId: string) {
  const response = await api.post<Media>(`/media/${mediaId}/associate`, {
    postId,
  })

  return response.data
}

export async function deleteMedia(id: string) {
  const response = await api.delete<Media>(`/media/${id}`)

  return response.data
}

export async function reorderMedia(postId: string, mediaIds: string[]) {
  const response = await api.patch<Media[]>(`/media/reorder`, {
    postId,
    mediaIds,
  })

  return response.data
}
