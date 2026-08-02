import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"

import PostForm from "../../components/posts/PostForm"
import { fetchPost } from "../../services/posts"
import type { Post } from "../../services/posts"
import PageContainer from "../../components/ui/PageContainer"
import PageHeader from "../../components/ui/PageHeader"
import Card from "../../components/ui/Card"
import ErrorState from "../../components/ui/ErrorState"
import Skeleton from "../../components/ui/Skeleton"

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
    return (
      <PageContainer width="standard">
        <Skeleton className="h-10 w-1/3" />
        <Skeleton className="mt-4 h-96 w-full" />
      </PageContainer>
    )
  }

  if (error) {
    return (
      <PageContainer width="standard">
        <ErrorState
          title={error}
          onRetry={() => navigate("/posts")}
          retryLabel="Voltar para posts"
        />
      </PageContainer>
    )
  }

  return (
    <PageContainer width="standard">
      <PageHeader
        title="Editar post"
        description="Atualize o conteúdo do post."
      />

      <Card className="p-6">
        <PostForm
          post={post}
          onSaved={() => navigate("/posts")}
          onCancel={() => navigate("/posts")}
        />
      </Card>
    </PageContainer>
  )
}
