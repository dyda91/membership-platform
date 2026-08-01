import { useEffect, useState } from "react"
import type { FormEvent } from "react"

import { fetchArtistProfile, updateArtistProfile } from "../../services/artist"
import type { UpdateArtistProfileData } from "../../services/artist"

interface ProfileFormState {
  name: string
  description: string
  bio: string
  avatarUrl: string
  bannerUrl: string
}

export default function ProfilePage() {
  const [form, setForm] = useState<ProfileFormState>({
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

  useEffect(() => {
    fetchArtistProfile()
      .then((profile) => {
        setForm({
          name: profile.name,
          description: profile.description,
          bio: profile.bio ?? "",
          avatarUrl: profile.avatarUrl ?? "",
          bannerUrl: profile.bannerUrl ?? "",
        })
      })
      .catch(() => setError("Não foi possível carregar o perfil."))
      .finally(() => setLoading(false))
  }, [])

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setSaving(true)
    setError(null)
    setSaved(false)

    try {
      const data: UpdateArtistProfileData = {
        name: form.name,
        description: form.description,
        bio: form.bio,
        avatarUrl: form.avatarUrl || null,
        bannerUrl: form.bannerUrl || null,
      }

      await updateArtistProfile(data)
      setSaved(true)
    } catch {
      setError("Não foi possível salvar o perfil.")
    } finally {
      setSaving(false)
    }
  }

  function update(field: keyof ProfileFormState, value: string) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  if (loading) {
    return <p className="text-gray-600">Carregando perfil...</p>
  }

  return (
    <div>
      <h2 className="text-3xl font-bold text-black">Perfil do artista</h2>

      <p className="mt-2 text-gray-600">
        Edite as informações públicas do seu perfil.
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
            value={form.name}
            onChange={(event) => update("name", event.target.value)}
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
            value={form.description}
            onChange={(event) => update("description", event.target.value)}
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
            value={form.bio}
            onChange={(event) => update("bio", event.target.value)}
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
              value={form.avatarUrl}
              onChange={(event) => update("avatarUrl", event.target.value)}
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
              value={form.bannerUrl}
              onChange={(event) => update("bannerUrl", event.target.value)}
              className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>

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
