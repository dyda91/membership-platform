import { useCallback, useEffect, useMemo, useState } from "react"
import { Link, useNavigate } from "react-router-dom"

import {
  archivePost,
  deletePost,
  fetchPosts,
  publishPost,
} from "../../services/posts"
import type { Post, PostStatus } from "../../services/posts"
import PostAdminCard from "../../components/posts/PostAdminCard"
import PageContainer from "../../components/ui/PageContainer"
import PageHeader from "../../components/ui/PageHeader"
import Button from "../../components/ui/Button"
import { buttonClasses } from "../../components/ui/button-styles"
import EmptyState from "../../components/ui/EmptyState"
import Alert from "../../components/ui/Alert"
import Skeleton from "../../components/ui/Skeleton"
import ConfirmDialog from "../../components/ui/ConfirmDialog"

type StatusFilter = "ALL" | PostStatus

const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [
  { value: "ALL", label: "Todos" },
  { value: "DRAFT", label: "Rascunhos" },
  { value: "PUBLISHED", label: "Publicados" },
  { value: "ARCHIVED", label: "Arquivados" },
]

export default function PostsPage() {
  const navigate = useNavigate()

  const [posts, setPosts] = useState<Post[]>([])
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<Post | null>(null)
  const [deletingBusy, setDeletingBusy] = useState(false)
  const [mutationBusy, setMutationBusy] = useState(false)

  const loadPosts = useCallback(async () => {
    try {
      setError(null)
      const data = await fetchPosts()
      setPosts(data)
    } catch {
      setError("Não foi possível carregar os posts.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadPosts()
  }, [loadPosts])

  const visiblePosts = useMemo(
    () =>
      statusFilter === "ALL"
        ? posts
        : posts.filter((post) => post.status === statusFilter),
    [posts, statusFilter],
  )

  function replacePost(updated: Post) {
    setPosts((current) =>
      current.map((post) => (post.id === updated.id ? updated : post)),
    )
  }

  async function handlePublish(post: Post) {
    setMutationBusy(true)
    setError(null)

    try {
      const updated = await publishPost(post.id)
      replacePost(updated)
    } catch {
      setError("Não foi possível publicar o post.")
    } finally {
      setMutationBusy(false)
    }
  }

  async function handleArchive(post: Post) {
    setMutationBusy(true)
    setError(null)

    try {
      const updated = await archivePost(post.id)
      replacePost(updated)
    } catch {
      setError("Não foi possível arquivar o post.")
    } finally {
      setMutationBusy(false)
    }
  }

  async function handleDelete() {
    if (!deleting) {
      return
    }

    setDeletingBusy(true)
    setError(null)

    try {
      await deletePost(deleting.id)
      setPosts((current) => current.filter((post) => post.id !== deleting.id))
      setDeleting(null)
    } catch {
      setError("Não foi possível excluir o post.")
    } finally {
      setDeletingBusy(false)
    }
  }

  if (loading) {
    return (
      <PageContainer width="wide">
        <Skeleton className="h-10 w-1/3" />
        <div className="mt-6 space-y-4">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      </PageContainer>
    )
  }

  return (
    <PageContainer width="wide">
      <PageHeader
        title="Posts"
        description="Gerencie os conteúdos da plataforma."
        actions={
          <Link to="/posts/new" className={buttonClasses("primary", "md")}>
            Novo post
          </Link>
        }
      />

      {error && (
        <div className="mb-4">
          <Alert variant="error">{error}</Alert>
        </div>
      )}

      <div
        className="flex flex-wrap gap-2"
        role="group"
        aria-label="Filtrar por status"
      >
        {STATUS_FILTERS.map((filter) => (
          <Button
            key={filter.value}
            variant={statusFilter === filter.value ? "primary" : "outline"}
            size="sm"
            onClick={() => setStatusFilter(filter.value)}
            aria-pressed={statusFilter === filter.value}
          >
            {filter.label}
          </Button>
        ))}
      </div>

      <div className="mt-6">
        {visiblePosts.length === 0 ? (
          <EmptyState
            title="Nenhum post encontrado"
            description={
              statusFilter === "ALL"
                ? "Crie o primeiro conteúdo usando o botão acima."
                : "Nenhum post com este status."
            }
          />
        ) : (
          <div className="space-y-4">
            {visiblePosts.map((post) => (
              <PostAdminCard
                key={post.id}
                post={post}
                disabled={mutationBusy}
                onEdit={(item) => navigate(`/posts/${item.id}/edit`)}
                onPublish={(item) => void handlePublish(item)}
                onArchive={(item) => void handleArchive(item)}
                onDelete={setDeleting}
                onOpenFeed={() => navigate("/")}
              />
            ))}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={deleting !== null}
        title="Excluir post"
        description={
          deleting ? (
            <>
              Tem certeza que deseja excluir este post? Esta ação não pode ser
              desfeita.
            </>
          ) : undefined
        }
        confirmLabel="Excluir"
        variant="danger"
        busy={deletingBusy}
        onConfirm={() => void handleDelete()}
        onCancel={() => setDeleting(null)}
      />
    </PageContainer>
  )
}
