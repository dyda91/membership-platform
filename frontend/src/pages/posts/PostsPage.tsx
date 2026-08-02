import { useCallback, useEffect, useState } from "react"
import { Link } from "react-router-dom"

import {
  archivePost,
  deletePost,
  fetchPosts,
  publishPost,
} from "../../services/posts"
import type { Post } from "../../services/posts"
import PostCard from "../../components/posts/PostCard"
import PageContainer from "../../components/ui/PageContainer"
import PageHeader from "../../components/ui/PageHeader"
import { buttonClasses } from "../../components/ui/button-styles"
import EmptyState from "../../components/ui/EmptyState"
import Alert from "../../components/ui/Alert"
import ConfirmDialog from "../../components/ui/ConfirmDialog"

export default function PostsPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<Post | null>(null)
  const [deletingBusy, setDeletingBusy] = useState(false)

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

  function replacePost(updated: Post) {
    setPosts((current) =>
      current.map((post) => (post.id === updated.id ? updated : post)),
    )
  }

  async function handlePublish(post: Post) {
    try {
      const updated = await publishPost(post.id)
      replacePost(updated)
    } catch {
      setError("Não foi possível publicar o post.")
    }
  }

  async function handleArchive(post: Post) {
    try {
      const updated = await archivePost(post.id)
      replacePost(updated)
    } catch {
      setError("Não foi possível arquivar o post.")
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
        <p className="text-sm text-foreground-muted">Carregando posts...</p>
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

      {posts.length === 0 ? (
        <EmptyState
          title="Nenhum post encontrado"
          description="Crie o primeiro conteúdo usando o botão acima."
        />
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onEdit={(item) => {
                window.location.href = `/posts/${item.id}/edit`
              }}
              onDelete={setDeleting}
              onPublish={(item) => void handlePublish(item)}
              onArchive={(item) => void handleArchive(item)}
            />
          ))}
        </div>
      )}

      <ConfirmDialog
        open={deleting !== null}
        title="Excluir post"
        description={
          deleting ? (
            <>
              Tem certeza que deseja excluir o post{" "}
              <span className="font-medium text-foreground">
                {deleting.title}
              </span>
              ? Esta ação não pode ser desfeita.
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
