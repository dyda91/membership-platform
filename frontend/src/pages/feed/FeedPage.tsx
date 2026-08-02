import { useCallback, useEffect, useState } from "react"

import { fetchFeed } from "../../services/feed"
import type { FeedArtist, FeedPost } from "../../services/feed"
import FeedList from "../../components/feed/FeedList"
import ArtistHeader from "../../components/artist/ArtistHeader"
import NoArtistConfiguredState from "../../components/artist/NoArtistConfiguredState"
import PageContainer from "../../components/ui/PageContainer"
import PageHeader from "../../components/ui/PageHeader"
import Button from "../../components/ui/Button"
import Skeleton from "../../components/ui/Skeleton"
import ErrorState from "../../components/ui/ErrorState"

const PAGE_SIZE = 10

export default function FeedPage() {
  const [posts, setPosts] = useState<FeedPost[]>([])
  const [artist, setArtist] = useState<FeedArtist | null>(null)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadFirst = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const data = await fetchFeed(1, PAGE_SIZE)
      setPosts(data.items)
      setArtist(data.artist)
      setTotal(data.total)
      setPage(1)
    } catch {
      setError("Não foi possível carregar o feed.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadFirst()
  }, [loadFirst])

  const hasMore = posts.length < total

  async function loadMore() {
    if (loadingMore) {
      return
    }

    setLoadingMore(true)
    setError(null)

    try {
      const data = await fetchFeed(page + 1, PAGE_SIZE)
      setPosts((current) => [...current, ...data.items])
      setArtist(data.artist)
      setPage(data.page)
      setTotal(data.total)
    } catch {
      setError("Não foi possível carregar mais posts.")
    } finally {
      setLoadingMore(false)
    }
  }

  if (loading) {
    return (
      <PageContainer width="narrow">
        <div className="space-y-4">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </PageContainer>
    )
  }

  return (
    <PageContainer width="narrow">
      {artist?.configured ? (
        <ArtistHeader artist={artist} />
      ) : (
        <NoArtistConfiguredState />
      )}

      <PageHeader
        title="Feed"
        description="Veja os conteúdos publicados pela artista."
        level="h2"
      />

      {error && (
        <div className="mb-4">
          <ErrorState
            title={error}
            onRetry={posts.length === 0 ? () => void loadFirst() : () => void loadMore()}
            retryLabel="Tentar novamente"
          />
        </div>
      )}

      <FeedList posts={posts} contactActions={artist?.contactActions ?? []} />

      {hasMore && (
        <div className="mt-6 text-center">
          <Button
            variant="outline"
            onClick={() => void loadMore()}
            loading={loadingMore}
          >
            {loadingMore ? "Carregando..." : "Carregar mais"}
          </Button>
        </div>
      )}
    </PageContainer>
  )
}
