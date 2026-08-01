import { useEffect, useState } from "react"
import type { FormEvent } from "react"

import { createPost, updatePost } from "../../services/posts"
import type { Post, CreatePostData, UpdatePostData } from "../../services/posts"
import { associateMedia, fetchMedia } from "../../services/media"
import type { Media } from "../../services/media"
import TierSelector from "./TierSelector"
import MediaUploader from "./MediaUploader"

interface PostFormProps {
  post?: Post | null
  onSaved: (post: Post) => void
  onCancel?: () => void
}

export default function PostForm({ post, onSaved, onCancel }: PostFormProps) {
  const [title, setTitle] = useState(post?.title ?? "")
  const [content, setContent] = useState(post?.content ?? "")
  const [tierId, setTierId] = useState<string | null>(post?.tierId ?? null)
  const [coverMediaId, setCoverMediaId] = useState<string | null>(
    post?.coverMedia?.id ?? null,
  )
  const [media, setMedia] = useState<Media[]>(post?.media ?? [])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (post) {
      void fetchMedia(post.id)
        .then(setMedia)
        .catch(() => undefined)
    }
  }, [post])

  async function saveAs(status: "DRAFT" | "PUBLISHED") {
    setSubmitting(true)
    setError(null)

    try {
      let saved: Post

      if (post) {
        const payload: UpdatePostData = {
          title,
          content,
          status,
          tierId: tierId ?? undefined,
          coverMediaId: coverMediaId ?? undefined,
        }
        saved = await updatePost(post.id, payload)
      } else {
        const payload: CreatePostData = {
          title,
          content,
          status,
          tierId: tierId ?? undefined,
          coverMediaId: coverMediaId ?? undefined,
        }
        saved = await createPost(payload)
      }

      const unassociated = media.filter((item) => item.postId === null)

      for (const item of unassociated) {
        await associateMedia(saved.id, item.id)
      }

      onSaved(saved)
    } catch {
      setError("Não foi possível salvar o post. Tente novamente.")
    } finally {
      setSubmitting(false)
    }
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    void saveAs("DRAFT")
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label
          htmlFor="title"
          className="block text-sm font-medium text-gray-700"
        >
          Título
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          required
          className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
        />
      </div>

      <div>
        <label
          htmlFor="content"
          className="block text-sm font-medium text-gray-700"
        >
          Conteúdo
        </label>
        <textarea
          id="content"
          value={content}
          onChange={(event) => setContent(event.target.value)}
          required
          rows={8}
          className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <TierSelector value={tierId} onChange={setTierId} />

        <div>
          <label
            htmlFor="cover"
            className="block text-sm font-medium text-gray-700"
          >
            Mídia de capa
          </label>
          <select
            id="cover"
            value={coverMediaId ?? ""}
            onChange={(event) => setCoverMediaId(event.target.value || null)}
            className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
          >
            <option value="">Nenhuma</option>
            {media
              .filter((item) => item.type === "IMAGE")
              .map((item) => (
                <option key={item.id} value={item.id}>
                  {item.originalName}
                </option>
              ))}
          </select>
        </div>
      </div>

      <MediaUploader
        postId={post?.id}
        media={media}
        onChange={setMedia}
      />

      {error && <p className="rounded bg-red-100 p-3 text-sm text-red-700">{error}</p>}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={submitting}
          className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {submitting ? "Salvando..." : "Salvar rascunho"}
        </button>

        <button
          type="button"
          disabled={submitting}
          onClick={() => void saveAs("PUBLISHED")}
          className="rounded bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
        >
          {submitting ? "Salvando..." : "Publicar"}
        </button>

        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300"
          >
            Cancelar
          </button>
        )}
      </div>
    </form>
  )
}
