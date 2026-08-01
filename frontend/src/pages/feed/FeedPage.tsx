import { useCallback, useEffect, useState } from "react"

import { fetchFeed } from "../../services/feed"
import type { FeedArtist, FeedPost } from "../../services/feed"
import FeedList from "../../components/feed/FeedList"
import ArtistHeader from "../../components/artist/ArtistHeader"
import NoArtistConfiguredState from "../../components/artist/NoArtistConfiguredState"

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
    return <p className="text-gray-600">Carregando feed...</p>
  }

  return (
    <div className="mx-auto max-w-2xl">
      {artist?.configured ? (
        <ArtistHeader artist={artist} />
      ) : (
        <NoArtistConfiguredState />
      )}

      <h2 className="mt-6 text-3xl font-bold text-black">Feed</h2>

      <p className="mt-2 text-gray-600">
        Veja os conteúdos publicados pela artista.
      </p>

      {error && (
        <p className="mt-4 rounded bg-red-100 p-3 text-red-700">{error}</p>
      )}

      <div className="mt-6">
        <FeedList posts={posts} contactActions={artist?.contactActions ?? []} />
      </div>

      {hasMore && (
        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => void loadMore()}
            disabled={loadingMore}
            className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {loadingMore ? "Carregando..." : "Carregar mais"}
          </button>
        </div>
      )}
    </div>
  )
}
