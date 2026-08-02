import { useCallback, useEffect, useState } from "react"

import { fetchFeed } from "../../services/feed"
import type { FeedArtist, FeedPost } from "../../services/feed"
import FeedList from "../../components/feed/FeedList"
import PublicArtistProfile from "../../components/artist/PublicArtistProfile"
import NoArtistConfiguredState from "../../components/artist/NoArtistConfiguredState"
import PageContainer from "../../components/ui/PageContainer"
import Button from "../../components/ui/Button"
import Skeleton from "../../components/ui/Skeleton"
import ErrorState from "../../components/ui/ErrorState"
import Alert from "../../components/ui/Alert"

const PAGE_SIZE = 10

export default function FeedPage() {
  const [posts, setPosts] = useState<FeedPost[]>([])
  const [artist, setArtist] = useState<FeedArtist | null>(null)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [initialLoading, setInitialLoading] = useState(true)
  const [initialError, setInitialError] = useState<string | null>(null)
  const [loadingMore, setLoadingMore] = useState(false)
  const [loadMoreError, setLoadMoreError] = useState<string | null>(null)

  const loadFirst = useCallback(async () => {
    setInitialLoading(true)
    setInitialError(null)
    setLoadMoreError(null)

    try {
      const data = await fetchFeed(1, PAGE_SIZE)
      setPosts(data.items)
      setArtist(data.artist)
      setTotal(data.total)
      setPage(1)
    } catch {
      setInitialError("Não foi possível carregar o feed.")
    } finally {
      setInitialLoading(false)
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
    setLoadMoreError(null)

    try {
      const data = await fetchFeed(page + 1, PAGE_SIZE)
      setPosts((current) => {
        const known = new Set(current.map((post) => post.id))

        return [...current, ...data.items.filter((post) => !known.has(post.id))]
      })
      setArtist(data.artist)
      setPage(data.page)
      setTotal(data.total)
    } catch {
      setLoadMoreError("Não foi possível carregar mais posts.")
    } finally {
      setLoadingMore(false)
    }
  }

  if (initialLoading) {
    return (
      <PageContainer width="narrow">
        <div className="space-y-4">
          <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-card">
            <Skeleton className="aspect-[3/1] w-full rounded-none sm:aspect-[4/1]" />
            <div className="px-4 pb-5 pt-12 sm:px-6">
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="mt-2 h-4 w-2/3" />
            </div>
          </div>
          {Array.from({ length: 2 }).map((_, index) => (
            <div
              key={index}
              className="overflow-hidden rounded-xl border border-border bg-surface shadow-card"
            >
              <div className="px-4 py-4 sm:px-6">
                <Skeleton className="h-5 w-1/3" />
                <Skeleton className="mt-3 h-4 w-full" />
                <Skeleton className="mt-2 h-4 w-4/5" />
              </div>
              <Skeleton className="aspect-[4/3] w-full rounded-none" />
            </div>
          ))}
        </div>
      </PageContainer>
    )
  }

  return (
    <PageContainer width="narrow">
      {artist?.configured ? (
        <PublicArtistProfile artist={artist} />
      ) : (
        <NoArtistConfiguredState />
      )}

      <h2 className="mt-6 text-lg font-semibold text-foreground">Feed</h2>

      {initialError && (
        <div className="mt-4">
          <ErrorState
            title={initialError}
            onRetry={() => void loadFirst()}
            retryLabel="Tentar novamente"
          />
        </div>
      )}

      {!initialError && (
        <div className="mt-4">
          <FeedList
            posts={posts}
            contactActions={artist?.contactActions ?? []}
          />
        </div>
      )}

      {loadMoreError && (
        <div className="mt-4">
          <Alert
            variant="error"
            action={
              <Button
                variant="outline"
                size="sm"
                onClick={() => void loadMore()}
              >
                Tentar novamente
              </Button>
            }
          >
            {loadMoreError}
          </Alert>
        </div>
      )}

      {hasMore && !initialError && (
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

      {!hasMore && posts.length > 0 && !initialError && (
        <p className="mt-8 text-center text-sm text-foreground-muted">
          Você chegou ao fim do Feed.
        </p>
      )}
    </PageContainer>
  )
}
