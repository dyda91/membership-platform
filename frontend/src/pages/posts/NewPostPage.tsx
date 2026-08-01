import { useNavigate } from "react-router-dom"

import PostForm from "../../components/posts/PostForm"
import type { Post } from "../../services/posts"

export default function NewPostPage() {
  const navigate = useNavigate()

  function handleSaved(post: Post) {
    navigate(`/posts/${post.id}/edit`)
  }

  return (
    <div>
      <h2 className="text-3xl font-bold text-black">Novo post</h2>

      <p className="mt-2 text-gray-600">
        Crie um novo conteúdo para a plataforma.
      </p>

      <div className="mt-6 rounded-lg border border-gray-200 bg-white p-6 shadow">
        <PostForm onSaved={handleSaved} onCancel={() => navigate("/posts")} />
      </div>
    </div>
  )
}
