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
import PageContainer from "../../components/ui/PageContainer"
import PageHeader from "../../components/ui/PageHeader"
import Card from "../../components/ui/Card"
import Field from "../../components/ui/Field"
import Input from "../../components/ui/Input"
import Textarea from "../../components/ui/Textarea"
import Checkbox from "../../components/ui/Checkbox"
import Button from "../../components/ui/Button"
import Alert from "../../components/ui/Alert"
import ErrorState from "../../components/ui/ErrorState"
import Skeleton from "../../components/ui/Skeleton"

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
    return (
      <PageContainer width="standard">
        <Skeleton className="h-10 w-1/3" />
        <Skeleton className="mt-6 h-40 w-full" />
        <Skeleton className="mt-4 h-96 w-full" />
      </PageContainer>
    )
  }

  if (!profile) {
    return (
      <PageContainer width="standard">
        <ErrorState
          title={error ?? "Perfil não encontrado."}
          onRetry={() => navigate("/")}
          retryLabel="Voltar ao Feed"
        />
      </PageContainer>
    )
  }

  return (
    <PageContainer width="standard">
      <PageHeader
        title="Página da artista"
        description="Edite as informações públicas exibidas no Feed."
      />

      {error && (
        <div className="mb-4">
          <Alert variant="error">{error}</Alert>
        </div>
      )}

      {saved && (
        <div className="mb-4">
          <Alert variant="success">Perfil atualizado com sucesso.</Alert>
        </div>
      )}

      <Card className="overflow-hidden">
        <ArtistBanner url={profile.bannerUrl} />

        <div className="p-6">
          <div className="flex items-start gap-4">
            <ArtistAvatar url={profile.avatarUrl} name={profile.name} />
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            <Field id="name" label="Nome">
              <Input
                id="name"
                type="text"
                value={profile.name ?? ""}
                onChange={(event) => update("name", event.target.value)}
              />
            </Field>

            <Field id="bio" label="Biografia">
              <Textarea
                id="bio"
                value={profile.bio ?? ""}
                onChange={(event) => update("bio", event.target.value)}
                rows={3}
              />
            </Field>

            <Field id="presentationText" label="Apresentação">
              <Textarea
                id="presentationText"
                value={profile.presentationText ?? ""}
                onChange={(event) =>
                  update("presentationText", event.target.value)
                }
                rows={4}
              />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Field id="whatsappValue" label="WhatsApp">
                  <Input
                    id="whatsappValue"
                    type="text"
                    placeholder="5511999998888"
                    value={profile.whatsappValue ?? ""}
                    onChange={(event) =>
                      update("whatsappValue", event.target.value)
                    }
                  />
                </Field>
                <Checkbox
                  id="whatsappEnabled"
                  label="Habilitar WhatsApp"
                  checked={profile.whatsappEnabled}
                  onChange={(event) =>
                    update("whatsappEnabled", event.target.checked)
                  }
                />
              </div>

              <div className="space-y-2">
                <Field id="discordUrl" label="Discord">
                  <Input
                    id="discordUrl"
                    type="url"
                    placeholder="https://discord.gg/..."
                    value={profile.discordUrl ?? ""}
                    onChange={(event) => update("discordUrl", event.target.value)}
                  />
                </Field>
                <Checkbox
                  id="discordEnabled"
                  label="Habilitar Discord"
                  checked={profile.discordEnabled}
                  onChange={(event) =>
                    update("discordEnabled", event.target.checked)
                  }
                />
              </div>
            </div>

            <Field id="contactButtonText" label="Texto do botão de contato">
              <Input
                id="contactButtonText"
                type="text"
                value={profile.contactButtonText ?? ""}
                onChange={(event) =>
                  update("contactButtonText", event.target.value)
                }
              />
            </Field>

            <div className="flex flex-wrap gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground">
                  Avatar
                </label>
                <input
                  type="file"
                  accept="image/*"
                  disabled={uploading !== null}
                  onChange={(event) =>
                    void handleAvatarUpload(event.target.files?.[0])
                  }
                  className="mt-1 block w-full text-sm text-foreground-subtle file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-2 file:text-sm file:font-medium file:text-primary-foreground hover:file:bg-primary-hover"
                />
                {uploading === "avatar" && (
                  <p className="mt-1 text-xs text-foreground-muted">Enviando...</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground">
                  Banner
                </label>
                <input
                  type="file"
                  accept="image/*"
                  disabled={uploading !== null}
                  onChange={(event) =>
                    void handleBannerUpload(event.target.files?.[0])
                  }
                  className="mt-1 block w-full text-sm text-foreground-subtle file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-2 file:text-sm file:font-medium file:text-primary-foreground hover:file:bg-primary-hover"
                />
                {uploading === "banner" && (
                  <p className="mt-1 text-xs text-foreground-muted">Enviando...</p>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              <Button type="submit" loading={saving}>
                {saving ? "Salvando..." : "Salvar perfil"}
              </Button>

              <Button variant="outline" onClick={() => navigate("/")}>
                Ver Feed
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </PageContainer>
  )
}
