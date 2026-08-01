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

export default function PostsPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<Post | null>(null)

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

    try {
      await deletePost(deleting.id)
      setPosts((current) => current.filter((post) => post.id !== deleting.id))
      setDeleting(null)
    } catch {
      setError("Não foi possível excluir o post.")
    }
  }

  if (loading) {
    return <p className="text-gray-600">Carregando posts...</p>
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-black">Posts</h2>

        <Link
          to="/posts/new"
          className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Novo post
        </Link>
      </div>

      <p className="mt-2 text-gray-600">
        Gerencie os conteúdos da plataforma.
      </p>

      {error && (
        <p className="mt-4 rounded bg-red-100 p-3 text-red-700">{error}</p>
      )}

      <div className="mt-6 space-y-4">
        {posts.length === 0 ? (
          <p className="text-gray-600">Nenhum post encontrado.</p>
        ) : (
          posts.map((post) => (
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
          ))
        )}
      </div>

      {deleting && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow">
            <h3 className="text-lg font-semibold text-gray-900">
              Excluir post
            </h3>

            <p className="mt-2 text-sm text-gray-600">
              Tem certeza que deseja excluir o post{" "}
              <span className="font-medium text-gray-900">
                {deleting.title}
              </span>
              ?
            </p>

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleting(null)}
                className="rounded bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => void handleDelete()}
                className="rounded bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
