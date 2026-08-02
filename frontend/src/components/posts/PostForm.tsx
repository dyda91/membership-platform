import { useEffect, useState } from "react"
import type { FormEvent } from "react"

import { createPost, updatePost } from "../../services/posts"
import type { Post, CreatePostData, UpdatePostData } from "../../services/posts"
import { associateMedia, fetchMedia } from "../../services/media"
import type { Media } from "../../services/media"
import TierSelector from "./TierSelector"
import MediaUploader from "./MediaUploader"
import Field from "../ui/Field"
import Textarea from "../ui/Textarea"
import Button from "../ui/Button"
import Alert from "../ui/Alert"

interface PostFormProps {
  post?: Post | null
  onSaved: (post: Post) => void
  onCancel?: () => void
}

export default function PostForm({ post, onSaved, onCancel }: PostFormProps) {
  const [content, setContent] = useState(post?.content ?? "")
  const [tierId, setTierId] = useState<string | null>(post?.tierId ?? null)
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
          content,
          status,
          tierId: tierId ?? undefined,
        }
        saved = await updatePost(post.id, payload)
      } else {
        const payload: CreatePostData = {
          content,
          status,
          tierId: tierId ?? undefined,
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
      <Field id="content" label="Conteúdo">
        <Textarea
          id="content"
          value={content}
          onChange={(event) => setContent(event.target.value)}
          required
          rows={8}
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <TierSelector value={tierId} onChange={setTierId} />
      </div>

      <MediaUploader postId={post?.id} media={media} onChange={setMedia} />

      {error && <Alert variant="error">{error}</Alert>}

      <div className="flex flex-wrap gap-2">
        <Button type="submit" disabled={submitting} loading={submitting}>
          {submitting ? "Salvando..." : "Salvar rascunho"}
        </Button>

        <Button
          variant="secondary"
          disabled={submitting}
          loading={submitting}
          onClick={() => void saveAs("PUBLISHED")}
        >
          {submitting ? "Salvando..." : "Publicar"}
        </Button>

        {onCancel && (
          <Button variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
        )}
      </div>
    </form>
  )
}
