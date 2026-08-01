import api from "./api"
import type { Tier } from "./tiers"
import type { Media } from "./media"

export type PostStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED"

export interface PostAuthor {
  id: string
  email: string
  name: string | null
}

export interface Post {
  id: string
  title: string | null
  content: string
  status: PostStatus
  authorId: string
  tierId: string | null
  tier: Tier | null
  media: Media[]
  author: PostAuthor
  createdAt: string
  updatedAt: string
}

export interface CreatePostData {
  title?: string
  content: string
  status?: PostStatus
  tierId?: string
}

export interface UpdatePostData {
  title?: string | null
  content?: string
  status?: PostStatus
  tierId?: string | null
}

export async function fetchPosts() {
  const response = await api.get<Post[]>("/posts")

  return response.data
}

export async function fetchPost(id: string) {
  const response = await api.get<Post>(`/posts/${id}`)

  return response.data
}

export async function createPost(data: CreatePostData) {
  const response = await api.post<Post>("/posts", data)

  return response.data
}

export async function updatePost(id: string, data: UpdatePostData) {
  const response = await api.patch<Post>(`/posts/${id}`, data)

  return response.data
}

export async function deletePost(id: string) {
  const response = await api.delete<Post>(`/posts/${id}`)

  return response.data
}

export async function publishPost(id: string) {
  const response = await api.post<Post>(`/posts/${id}/publish`)

  return response.data
}

export async function archivePost(id: string) {
  const response = await api.post<Post>(`/posts/${id}/archive`)

  return response.data
}
