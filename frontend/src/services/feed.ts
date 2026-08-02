import api from "./api"

export type FeedMediaType = "IMAGE" | "VIDEO"

export interface FeedMedia {
  id: string
  type: FeedMediaType
  mimeType: string
  size: number
  width: number | null
  height: number | null
  duration: number | null
  position: number
  locked: boolean
  url?: string
}

export interface FeedAuthor {
  id: string
  name: string | null
}

export interface FeedTier {
  id: string
  name: string
  priority: number
}

export interface FeedPost {
  id: string
  content: string
  createdAt: string
  updatedAt: string
  author: FeedAuthor
  requiredTier: FeedTier | null
  mediaAccess: boolean
  media: FeedMedia[]
}

export type FeedContactActionType = "WHATSAPP" | "DISCORD"

export interface FeedContactAction {
  type: FeedContactActionType
  label: string
  url: string
}

export interface FeedArtist {
  configured: boolean
  name: string | null
  bio: string | null
  presentationText: string | null
  avatarUrl: string | null
  bannerUrl: string | null
  contactActions: FeedContactAction[]
}

export interface FeedResponse {
  items: FeedPost[]
  page: number
  limit: number
  total: number
  artist: FeedArtist
}

/**
 * Stable fallback ratios used only when the backend does not provide
 * dimensions, so the layout can reserve space and avoid layout shift.
 */
export const IMAGE_FALLBACK_RATIO = 4 / 3
export const VIDEO_FALLBACK_RATIO = 16 / 9

export function aspectRatioOf(
  type: FeedMediaType,
  width: number | null,
  height: number | null,
): number {
  if (width && height && width > 0 && height > 0) {
    return width / height
  }

  return type === "VIDEO" ? VIDEO_FALLBACK_RATIO : IMAGE_FALLBACK_RATIO
}

/**
 * A media item is viewable only when it is authorized (not locked) and the
 * backend supplied a usable URL. Locked items must never carry a URL.
 */
export function mediaAuthorized(item: FeedMedia): boolean {
  return !item.locked && Boolean(item.url)
}

export async function fetchFeed(page = 1, limit = 20) {
  const response = await api.get<FeedResponse>("/feed", {
    params: { page, limit },
  })

  return response.data
}
