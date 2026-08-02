import { useNavigate } from "react-router-dom"

import PostForm from "../../components/posts/PostForm"
import type { Post } from "../../services/posts"
import PageContainer from "../../components/ui/PageContainer"
import PageHeader from "../../components/ui/PageHeader"
import Card from "../../components/ui/Card"

export default function NewPostPage() {
  const navigate = useNavigate()

  function handleSaved(post: Post) {
    navigate(`/posts/${post.id}/edit`)
  }

  return (
    <PageContainer width="standard">
      <PageHeader
        title="Novo post"
        description="Crie um novo conteúdo para a plataforma."
      />

      <Card className="p-6">
        <PostForm onSaved={handleSaved} onCancel={() => navigate("/posts")} />
      </Card>
    </PageContainer>
  )
}
