import { useEffect, useState } from "react"
import type { FormEvent } from "react"

import { useAuth } from "../../contexts/AuthContext"
import { fetchOwnProfile, updateOwnProfile } from "../../services/profile"
import { fetchArtistProfile, updateArtistProfile } from "../../services/artist"

interface ArtistProfileForm {
  name: string
  description: string
  bio: string
  avatarUrl: string
  bannerUrl: string
}

export default function ProfilePage() {
  const { canManageContent } = useAuth()
  const [name, setName] = useState("")
  const [artistForm, setArtistForm] = useState<ArtistProfileForm>({
    name: "",
    description: "",
    bio: "",
    avatarUrl: "",
    bannerUrl: "",
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  const isArtist = canManageContent

  useEffect(() => {
    async function load() {
      try {
        if (isArtist) {
          const profile = await fetchArtistProfile()
          setArtistForm({
            name: profile.name,
            description: profile.description,
            bio: profile.bio ?? "",
            avatarUrl: profile.avatarUrl ?? "",
            bannerUrl: profile.bannerUrl ?? "",
          })
        } else {
          const user = await fetchOwnProfile()
          setName(user.name ?? "")
        }
      } catch {
        setError("Não foi possível carregar o perfil.")
      } finally {
        setLoading(false)
      }
    }

    void load()
  }, [isArtist])

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setSaving(true)
    setError(null)
    setSaved(false)

    try {
      if (isArtist) {
        await updateArtistProfile({
          name: artistForm.name,
          description: artistForm.description,
          bio: artistForm.bio,
          avatarUrl: artistForm.avatarUrl || null,
          bannerUrl: artistForm.bannerUrl || null,
        })
      } else {
        await updateOwnProfile({ name })
      }

      setSaved(true)
    } catch {
      setError("Não foi possível salvar o perfil.")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <p className="text-gray-600">Carregando perfil...</p>
  }

  return (
    <div>
      <h2 className="text-3xl font-bold text-black">Meu perfil</h2>

      <p className="mt-2 text-gray-600">
        Edite as informações básicas do seu perfil.
      </p>

      {error && (
        <p className="mt-4 rounded bg-red-100 p-3 text-red-700">{error}</p>
      )}

      {saved && (
        <p className="mt-4 rounded bg-green-100 p-3 text-green-700">
          Perfil atualizado com sucesso.
        </p>
      )}

      <form
        onSubmit={handleSubmit}
        className="mt-6 space-y-4 rounded-lg border border-gray-200 bg-white p-6 shadow"
      >
        {isArtist ? (
          <>
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700"
              >
                Nome
              </label>
              <input
                id="name"
                type="text"
                value={artistForm.name}
                onChange={(event) =>
                  setArtistForm((current) => ({
                    ...current,
                    name: event.target.value,
                  }))
                }
                className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700"
              >
                Descrição
              </label>
              <input
                id="description"
                type="text"
                value={artistForm.description}
                onChange={(event) =>
                  setArtistForm((current) => ({
                    ...current,
                    description: event.target.value,
                  }))
                }
                className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label
                htmlFor="bio"
                className="block text-sm font-medium text-gray-700"
              >
                Bio
              </label>
              <textarea
                id="bio"
                value={artistForm.bio}
                onChange={(event) =>
                  setArtistForm((current) => ({
                    ...current,
                    bio: event.target.value,
                  }))
                }
                rows={4}
                className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="avatarUrl"
                  className="block text-sm font-medium text-gray-700"
                >
                  URL do avatar
                </label>
                <input
                  id="avatarUrl"
                  type="url"
                  value={artistForm.avatarUrl}
                  onChange={(event) =>
                    setArtistForm((current) => ({
                      ...current,
                      avatarUrl: event.target.value,
                    }))
                  }
                  className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label
                  htmlFor="bannerUrl"
                  className="block text-sm font-medium text-gray-700"
                >
                  URL do banner
                </label>
                <input
                  id="bannerUrl"
                  type="url"
                  value={artistForm.bannerUrl}
                  onChange={(event) =>
                    setArtistForm((current) => ({
                      ...current,
                      bannerUrl: event.target.value,
                    }))
                  }
                  className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>
          </>
        ) : (
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700"
            >
              Nome
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
            />
          </div>
        )}

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={saving}
            className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? "Salvando..." : "Salvar perfil"}
          </button>
        </div>
      </form>
    </div>
  )
}
