import { useCallback, useEffect, useState } from "react"

import {
  fetchActiveArtist,
  fetchArtistCandidates,
  promoteArtist,
  replaceArtist,
} from "../../services/system-artist"
import type { User } from "../../services/users"

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
    return <p className="text-gray-600">Carregando...</p>
  }

  return (
    <div>
      <h2 className="text-3xl font-bold text-black">
        Configuração da artista
      </h2>

      <p className="mt-2 text-gray-600">
        Gerencie a única conta responsável pelo conteúdo da plataforma.
      </p>

      {error && (
        <p className="mt-4 rounded bg-red-100 p-3 text-red-700">{error}</p>
      )}

      <div className="mt-6 rounded-lg border border-gray-200 bg-white p-6 shadow">
        <h3 className="text-lg font-semibold text-gray-900">
          Artista ativa
        </h3>

        {activeArtist ? (
          <p className="mt-2 text-sm text-gray-700">
            {activeArtist.email}
          </p>
        ) : (
          <p className="mt-2 text-sm text-amber-700">
            Nenhuma artista configurada ainda.
          </p>
        )}
      </div>

      <div className="mt-6 rounded-lg border border-gray-200 bg-white p-6 shadow">
        <h3 className="text-lg font-semibold text-gray-900">
          Contas elegíveis
        </h3>

        {candidates.length === 0 ? (
          <p className="mt-2 text-sm text-gray-600">
            Nenhuma conta elegível disponível.
          </p>
        ) : (
          <ul className="mt-4 divide-y divide-gray-200">
            {candidates.map((user) => (
              <li
                key={user.id}
                className="flex items-center justify-between py-3"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {user.name || user.email}
                  </p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>

                <button
                  type="button"
                  disabled={busy}
                  onClick={() =>
                    activeArtist
                      ? setConfirming(user)
                      : void handlePromote(user)
                  }
                  className="rounded bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {activeArtist ? "Substituir" : "Promover"}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {confirming && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow">
            <h3 className="text-lg font-semibold text-gray-900">
              Substituir artista
            </h3>

            <p className="mt-2 text-sm text-gray-600">
              Tem certeza que deseja substituir a artista atual por{" "}
              <span className="font-medium text-gray-900">
                {confirming.email}
              </span>
              ? A página pública e os posts serão preservados.
            </p>

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirming(null)}
                disabled={busy}
                className="rounded bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => void handleReplace()}
                disabled={busy}
                className="rounded bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
              >
                {busy ? "Substituindo..." : "Confirmar substituição"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
