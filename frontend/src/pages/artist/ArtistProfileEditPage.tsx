import { useEffect, useState } from "react"
import type { FormEvent } from "react"
import { useNavigate } from "react-router-dom"

import {
  fetchManageArtistProfile,
  updateArtistProfile,
  uploadArtistAvatar,
  uploadArtistBanner,
} from "../../services/artist-profile"
import type { ManageArtistProfile } from "../../services/artist-profile"
import ArtistAvatar from "../../components/artist/ArtistAvatar"
import ArtistBanner from "../../components/artist/ArtistBanner"

export default function ArtistProfileEditPage() {
  const navigate = useNavigate()

  const [profile, setProfile] = useState<ManageArtistProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState<"avatar" | "banner" | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    fetchManageArtistProfile()
      .then(setProfile)
      .catch(() => setError("Não foi possível carregar o perfil da artista."))
      .finally(() => setLoading(false))
  }, [])

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setSaving(true)
    setError(null)
    setSaved(false)

    if (!profile) {
      setSaving(false)

      return
    }

    try {
      const updated = await updateArtistProfile({
        name: profile.name ?? undefined,
        bio: profile.bio ?? undefined,
        presentationText: profile.presentationText ?? undefined,
        contactButtonText: profile.contactButtonText ?? undefined,
        whatsappValue: profile.whatsappValue,
        whatsappEnabled: profile.whatsappEnabled,
        discordUrl: profile.discordUrl,
        discordEnabled: profile.discordEnabled,
      })
      setProfile(updated)
      setSaved(true)
    } catch {
      setError("Não foi possível salvar o perfil.")
    } finally {
      setSaving(false)
    }
  }

  function update(field: keyof ManageArtistProfile, value: unknown) {
    setProfile((current) => (current ? { ...current, [field]: value } : current))
  }

  async function handleAvatarUpload(file: File | undefined) {
    if (!file) {
      return
    }

    setUploading("avatar")
    setError(null)

    try {
      const updated = await uploadArtistAvatar(file)
      setProfile(updated)
    } catch {
      setError("Não foi possível enviar o avatar.")
    } finally {
      setUploading(null)
    }
  }

  async function handleBannerUpload(file: File | undefined) {
    if (!file) {
      return
    }

    setUploading("banner")
    setError(null)

    try {
      const updated = await uploadArtistBanner(file)
      setProfile(updated)
    } catch {
      setError("Não foi possível enviar o banner.")
    } finally {
      setUploading(null)
    }
  }

  if (loading) {
    return <p className="text-gray-600">Carregando perfil...</p>
  }

  if (!profile) {
    return (
      <div>
        <p className="rounded bg-red-100 p-3 text-red-700">{error}</p>
        <button
          type="button"
          onClick={() => navigate("/")}
          className="mt-4 rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Voltar ao Feed
        </button>
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-3xl font-bold text-black">
        Página da artista
      </h2>

      <p className="mt-2 text-gray-600">
        Edite as informações públicas exibidas no Feed.
      </p>

      {error && (
        <p className="mt-4 rounded bg-red-100 p-3 text-red-700">{error}</p>
      )}

      {saved && (
        <p className="mt-4 rounded bg-green-100 p-3 text-green-700">
          Perfil atualizado com sucesso.
        </p>
      )}

      <div className="mt-6 overflow-hidden rounded-lg border border-gray-200 bg-white shadow">
        <ArtistBanner url={profile.bannerUrl} />

        <div className="p-6">
          <div className="flex items-start gap-4">
            <ArtistAvatar url={profile.avatarUrl} name={profile.name} />
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
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
                value={profile.name ?? ""}
                onChange={(event) => update("name", event.target.value)}
                className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label
                htmlFor="bio"
                className="block text-sm font-medium text-gray-700"
              >
                Biografia
              </label>
              <textarea
                id="bio"
                value={profile.bio ?? ""}
                onChange={(event) => update("bio", event.target.value)}
                rows={3}
                className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label
                htmlFor="presentationText"
                className="block text-sm font-medium text-gray-700"
              >
                Apresentação
              </label>
              <textarea
                id="presentationText"
                value={profile.presentationText ?? ""}
                onChange={(event) =>
                  update("presentationText", event.target.value)
                }
                rows={4}
                className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="whatsappValue"
                  className="block text-sm font-medium text-gray-700"
                >
                  WhatsApp
                </label>
                <input
                  id="whatsappValue"
                  type="text"
                  placeholder="5511999998888"
                  value={profile.whatsappValue ?? ""}
                  onChange={(event) =>
                    update("whatsappValue", event.target.value)
                  }
                  className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
                />
                <label className="mt-2 flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={profile.whatsappEnabled}
                    onChange={(event) =>
                      update("whatsappEnabled", event.target.checked)
                    }
                  />
                  Habilitar WhatsApp
                </label>
              </div>

              <div>
                <label
                  htmlFor="discordUrl"
                  className="block text-sm font-medium text-gray-700"
                >
                  Discord
                </label>
                <input
                  id="discordUrl"
                  type="url"
                  placeholder="https://discord.gg/..."
                  value={profile.discordUrl ?? ""}
                  onChange={(event) => update("discordUrl", event.target.value)}
                  className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
                />
                <label className="mt-2 flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={profile.discordEnabled}
                    onChange={(event) =>
                      update("discordEnabled", event.target.checked)
                    }
                  />
                  Habilitar Discord
                </label>
              </div>
            </div>

            <div>
              <label
                htmlFor="contactButtonText"
                className="block text-sm font-medium text-gray-700"
              >
                Texto do botão de contato
              </label>
              <input
                id="contactButtonText"
                type="text"
                value={profile.contactButtonText ?? ""}
                onChange={(event) =>
                  update("contactButtonText", event.target.value)
                }
                className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div className="flex flex-wrap gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Avatar
                </label>
                <input
                  type="file"
                  accept="image/*"
                  disabled={uploading !== null}
                  onChange={(event) =>
                    void handleAvatarUpload(event.target.files?.[0])
                  }
                  className="mt-1 block w-full text-sm text-gray-500"
                />
                {uploading === "avatar" && (
                  <p className="mt-1 text-xs text-gray-500">Enviando...</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Banner
                </label>
                <input
                  type="file"
                  accept="image/*"
                  disabled={uploading !== null}
                  onChange={(event) =>
                    void handleBannerUpload(event.target.files?.[0])
                  }
                  className="mt-1 block w-full text-sm text-gray-500"
                />
                {uploading === "banner" && (
                  <p className="mt-1 text-xs text-gray-500">Enviando...</p>
                )}
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

              <button
                type="button"
                onClick={() => navigate("/")}
                className="rounded bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300"
              >
                Ver Feed
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
