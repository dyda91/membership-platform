import { useEffect, useMemo, useState } from "react"
import type { FormEvent } from "react"

import { createPost, updatePost } from "../../services/posts"
import type { Post, CreatePostData, UpdatePostData } from "../../services/posts"
import { associateMedia, fetchMedia } from "../../services/media"
import type { Media } from "../../services/media"
import { fetchTiers } from "../../services/tiers"
import type { Tier } from "../../services/tiers"
import TierSelector from "./TierSelector"
import MediaUploader from "./MediaUploader"
import PostPreviewDialog from "./PostPreviewDialog"
import UnsavedChangesDialog from "./UnsavedChangesDialog"
import Field from "../ui/Field"
import Textarea from "../ui/Textarea"
import Button from "../ui/Button"
import Alert from "../ui/Alert"
import { useUnsavedChanges } from "../../hooks/useUnsavedChanges"

interface PostFormProps {
  post?: Post | null
  onSaved: (post: Post) => void
  onCancel?: () => void
}

export default function PostForm({ post, onSaved, onCancel }: PostFormProps) {
  const [content, setContent] = useState(post?.content ?? "")
  const [tierId, setTierId] = useState<string | null>(post?.tierId ?? null)
  const [media, setMedia] = useState<Media[]>(post?.media ?? [])
  const [tiers, setTiers] = useState<Tier[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [confirmDiscard, setConfirmDiscard] = useState(false)

  const [baseline, setBaseline] = useState(() => ({
    content: post?.content ?? "",
    tierId: post?.tierId ?? null,
    mediaIds: (post?.media ?? []).map((item) => item.id).join("|"),
  }))

  useEffect(() => {
    if (post) {
      void fetchMedia(post.id)
        .then(setMedia)
        .catch(() => undefined)
    }
  }, [post])

  useEffect(() => {
    fetchTiers()
      .then(setTiers)
      .catch(() => undefined)
  }, [])

  const dirty = useMemo(() => {
    const mediaIds = media.map((item) => item.id).join("|")

    return (
      content !== baseline.content ||
      tierId !== baseline.tierId ||
      mediaIds !== baseline.mediaIds
    )
  }, [content, tierId, media, baseline])

  useUnsavedChanges(dirty)

  const requiredTier = useMemo(
    () => tiers.find((tier) => tier.id === tierId) ?? null,
    [tiers, tierId],
  )

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

      setBaseline({
        content,
        tierId,
        mediaIds: media.map((item) => item.id).join("|"),
      })
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

  function handleCancel() {
    if (dirty) {
      setConfirmDiscard(true)

      return
    }

    onCancel?.()
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-8">
        <section aria-labelledby="post-text-heading">
          <h2 id="post-text-heading" className="text-base font-semibold text-foreground">
            Texto
          </h2>
          <div className="mt-3">
            <Field id="content" label="Conteúdo">
              <Textarea
                id="content"
                value={content}
                onChange={(event) => setContent(event.target.value)}
                required
                rows={8}
              />
            </Field>
          </div>
        </section>

        <section aria-labelledby="post-media-heading">
          <h2 id="post-media-heading" className="text-base font-semibold text-foreground">
            Mídia
          </h2>
          <div className="mt-3">
            <MediaUploader postId={post?.id} media={media} onChange={setMedia} />
          </div>
        </section>

        <section aria-labelledby="post-access-heading">
          <h2 id="post-access-heading" className="text-base font-semibold text-foreground">
            Acesso
          </h2>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            <TierSelector value={tierId} onChange={setTierId} />
          </div>
          {requiredTier && (
            <p className="mt-2 text-sm text-foreground-muted">
              O conteúdo será restrito ao tier {requiredTier.name} e tiers de
              prioridade igual ou superior.
            </p>
          )}
        </section>

        {error && <Alert variant="error">{error}</Alert>}

        <section aria-label="Ações de publicação" className="flex flex-wrap gap-2 border-t border-border pt-5">
          <Button type="submit" disabled={submitting} loading={submitting}>
            {submitting ? "Salvando..." : "Salvar rascunho"}
          </Button>

          <Button
            variant="secondary"
            disabled={submitting}
            onClick={() => void saveAs("PUBLISHED")}
          >
            {submitting ? "Salvando..." : "Publicar"}
          </Button>

          <Button
            variant="outline"
            disabled={submitting}
            onClick={() => setPreviewOpen(true)}
          >
            Prévia
          </Button>

          {onCancel && (
            <Button variant="ghost" onClick={handleCancel}>
              Cancelar
            </Button>
          )}
        </section>
      </form>

      <PostPreviewDialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        content={content}
        media={media}
        requiredTier={requiredTier}
      />

      <UnsavedChangesDialog
        open={confirmDiscard}
        onDiscard={() => {
          setConfirmDiscard(false)
          onCancel?.()
        }}
        onKeepEditing={() => setConfirmDiscard(false)}
      />
    </>
  )
}
