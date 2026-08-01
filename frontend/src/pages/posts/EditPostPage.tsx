import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"

import PostForm from "../../components/posts/PostForm"
import { fetchPost } from "../../services/posts"
import type { Post } from "../../services/posts"

export default function EditPostPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [post, setPost] = useState<Post | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) {
      return
    }

    fetchPost(id)
      .then(setPost)
      .catch(() => setError("Não foi possível carregar o post."))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return <p className="text-gray-600">Carregando post...</p>
  }

  if (error) {
    return (
      <div>
        <p className="rounded bg-red-100 p-3 text-red-700">{error}</p>
        <button
          type="button"
          onClick={() => navigate("/posts")}
          className="mt-4 rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Voltar para posts
        </button>
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-3xl font-bold text-black">Editar post</h2>

      <p className="mt-2 text-gray-600">
        Atualize o conteúdo do post.
      </p>

      <div className="mt-6 rounded-lg border border-gray-200 bg-white p-6 shadow">
        <PostForm
          post={post}
          onSaved={() => navigate("/posts")}
          onCancel={() => navigate("/posts")}
        />
      </div>
    </div>
  )
}
