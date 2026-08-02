import { useCallback, useEffect, useState } from "react"

import {
  fetchActiveArtist,
  fetchArtistCandidates,
  promoteArtist,
  replaceArtist,
} from "../../services/system-artist"
import type { User } from "../../services/users"
import PageContainer from "../../components/ui/PageContainer"
import PageHeader from "../../components/ui/PageHeader"
import Card from "../../components/ui/Card"
import Button from "../../components/ui/Button"
import Alert from "../../components/ui/Alert"
import EmptyState from "../../components/ui/EmptyState"
import ConfirmDialog from "../../components/ui/ConfirmDialog"
import Skeleton from "../../components/ui/Skeleton"

export default function ArtistAssignmentPage() {
  const [activeArtist, setActiveArtist] = useState<User | null>(null)
  const [candidates, setCandidates] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [confirming, setConfirming] = useState<User | null>(null)
  const [busy, setBusy] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const [artist, list] = await Promise.all([
        fetchActiveArtist(),
        fetchArtistCandidates(),
      ])
      setActiveArtist(artist)
      setCandidates(list)
    } catch {
      setError("Não foi possível carregar a configuração da artista.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  async function handlePromote(user: User) {
    setBusy(true)
    setError(null)

    try {
      const artist = await promoteArtist(user.id)
      setActiveArtist(artist)
      setCandidates((current) => current.filter((u) => u.id !== user.id))
    } catch {
      setError(
        "Não foi possível promover. Verifique se já existe uma artista ativa.",
      )
    } finally {
      setBusy(false)
    }
  }

  async function handleReplace() {
    if (!confirming) {
      return
    }

    setBusy(true)
    setError(null)

    try {
      const artist = await replaceArtist(confirming.id)
      setActiveArtist(artist)
      setCandidates((current) => current.filter((u) => u.id !== confirming.id))
      setConfirming(null)
    } catch {
      setError("Não foi possível substituir a artista.")
    } finally {
      setBusy(false)
    }
  }

  if (loading) {
    return (
      <PageContainer width="standard">
        <Skeleton className="h-10 w-1/3" />
        <Skeleton className="mt-6 h-40 w-full" />
        <Skeleton className="mt-4 h-64 w-full" />
      </PageContainer>
    )
  }

  return (
    <PageContainer width="standard">
      <PageHeader
        title="Configuração da artista"
        description="Gerencie a única conta responsável pelo conteúdo da plataforma."
      />

      {error && (
        <div className="mb-4">
          <Alert variant="error">{error}</Alert>
        </div>
      )}

      <Card className="p-6">
        <h2 className="text-lg font-semibold text-foreground">Artista ativa</h2>

        {activeArtist ? (
          <p className="mt-2 text-sm text-foreground-muted">
            {activeArtist.email}
          </p>
        ) : (
          <p className="mt-2 text-sm text-warning-foreground">
            Nenhuma artista configurada ainda.
          </p>
        )}
      </Card>

      <Card className="mt-6 p-6">
        <h2 className="text-lg font-semibold text-foreground">
          Contas elegíveis
        </h2>

        {candidates.length === 0 ? (
          <EmptyState
            className="mt-4 border-0"
            title="Nenhuma conta elegível"
            description="Nenhuma conta elegível disponível."
          />
        ) : (
          <ul className="mt-4 divide-y divide-border">
            {candidates.map((user) => (
              <li
                key={user.id}
                className="flex items-center justify-between gap-4 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">
                    {user.name || user.email}
                  </p>
                  <p className="truncate text-xs text-foreground-muted">
                    {user.email}
                  </p>
                </div>

                <Button
                  variant={activeArtist ? "secondary" : "primary"}
                  size="sm"
                  disabled={busy}
                  onClick={() =>
                    activeArtist
                      ? setConfirming(user)
                      : void handlePromote(user)
                  }
                >
                  {activeArtist ? "Substituir" : "Promover"}
                </Button>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <ConfirmDialog
        open={confirming !== null}
        title="Substituir artista"
        description={
          confirming ? (
            <>
              Tem certeza que deseja substituir a artista atual por{" "}
              <span className="font-medium text-foreground">
                {confirming.email}
              </span>
              ? A página pública e os posts serão preservados.
            </>
          ) : undefined
        }
        confirmLabel={busy ? "Substituindo..." : "Confirmar substituição"}
        variant="danger"
        busy={busy}
        onConfirm={() => void handleReplace()}
        onCancel={() => setConfirming(null)}
      />
    </PageContainer>
  )
}
