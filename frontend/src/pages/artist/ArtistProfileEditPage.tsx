import { useEffect, useMemo, useState } from "react"
import type { FormEvent } from "react"
import { useNavigate } from "react-router-dom"

import {
  fetchManageArtistProfile,
  updateArtistProfile,
  uploadArtistAvatar,
  uploadArtistBanner,
} from "../../services/artist-profile"
import type { ManageArtistProfile } from "../../services/artist-profile"
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
import Dialog from "../../components/ui/Dialog"
import PublicArtistProfile from "../../components/artist/PublicArtistProfile"
import UnsavedChangesDialog from "../../components/posts/UnsavedChangesDialog"
import { useUnsavedChanges } from "../../hooks/useUnsavedChanges"
import type { FeedArtist } from "../../services/feed"

interface ProfileForm {
  name: string
  bio: string
  presentationText: string
  contactButtonText: string
  whatsappValue: string
  whatsappEnabled: boolean
  discordUrl: string
  discordEnabled: boolean
}

export default function ArtistProfileEditPage() {
  const navigate = useNavigate()

  const [profile, setProfile] = useState<ManageArtistProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState<"avatar" | "banner" | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [confirmDiscard, setConfirmDiscard] = useState(false)

  useEffect(() => {
    fetchManageArtistProfile()
      .then(setProfile)
      .catch(() => setError("Não foi possível carregar o perfil da artista."))
      .finally(() => setLoading(false))
  }, [])

  const editableFields = useMemo(() => {
    if (!profile) {
      return null
    }

    return {
      name: profile.name ?? "",
      bio: profile.bio ?? "",
      presentationText: profile.presentationText ?? "",
      contactButtonText: profile.contactButtonText ?? "",
      whatsappValue: profile.whatsappValue ?? "",
      whatsappEnabled: profile.whatsappEnabled,
      discordUrl: profile.discordUrl ?? "",
      discordEnabled: profile.discordEnabled,
    } satisfies ProfileForm
  }, [profile])

  const [form, setForm] = useState<ProfileForm | null>(null)

  useEffect(() => {
    if (editableFields && !form) {
      setForm(editableFields)
    }
  }, [editableFields, form])

  const dirty = useMemo(() => {
    if (!profile || !form) {
      return false
    }

    return (
      form.name !== (profile.name ?? "") ||
      form.bio !== (profile.bio ?? "") ||
      form.presentationText !== (profile.presentationText ?? "") ||
      form.contactButtonText !== (profile.contactButtonText ?? "") ||
      form.whatsappValue !== (profile.whatsappValue ?? "") ||
      form.whatsappEnabled !== profile.whatsappEnabled ||
      form.discordUrl !== (profile.discordUrl ?? "") ||
      form.discordEnabled !== profile.discordEnabled
    )
  }, [profile, form])

  useUnsavedChanges(dirty)

  function update<K extends keyof ProfileForm>(field: K, value: ProfileForm[K]) {
    setForm((current) => (current ? { ...current, [field]: value } : current))
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setSaving(true)
    setError(null)
    setSaved(false)

    if (!profile || !form) {
      setSaving(false)

      return
    }

    try {
      const updated = await updateArtistProfile({
        name: form.name || undefined,
        bio: form.bio || undefined,
        presentationText: form.presentationText || undefined,
        contactButtonText: form.contactButtonText || undefined,
        whatsappValue: form.whatsappValue || null,
        whatsappEnabled: form.whatsappEnabled,
        discordUrl: form.discordUrl || null,
        discordEnabled: form.discordEnabled,
      })
      setProfile(updated)
      setForm({
        name: updated.name ?? "",
        bio: updated.bio ?? "",
        presentationText: updated.presentationText ?? "",
        contactButtonText: updated.contactButtonText ?? "",
        whatsappValue: updated.whatsappValue ?? "",
        whatsappEnabled: updated.whatsappEnabled,
        discordUrl: updated.discordUrl ?? "",
        discordEnabled: updated.discordEnabled,
      })
      setSaved(true)
    } catch {
      setError("Não foi possível salvar o perfil.")
    } finally {
      setSaving(false)
    }
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

  function handleLeave() {
    if (dirty) {
      setConfirmDiscard(true)

      return
    }

    navigate("/")
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

  if (!profile || !form) {
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

  const previewArtist: FeedArtist = {
    configured: true,
    name: profile.name,
    bio: profile.bio,
    presentationText: profile.presentationText,
    avatarUrl: profile.avatarUrl,
    bannerUrl: profile.bannerUrl,
    contactActions: profile.contactActions,
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

      <form onSubmit={handleSubmit} className="space-y-6">
        <section aria-labelledby="identity-section">
          <Card className="p-6">
            <h2 id="identity-section" className="text-base font-semibold text-foreground">
              Identidade pública
            </h2>
            <div className="mt-4 space-y-4">
              <Field id="name" label="Nome">
                <Input
                  id="name"
                  type="text"
                  value={form.name}
                  onChange={(event) => update("name", event.target.value)}
                />
              </Field>
            </div>
          </Card>
        </section>

        <section aria-labelledby="media-section">
          <Card className="p-6">
            <h2 id="media-section" className="text-base font-semibold text-foreground">
              Avatar e banner
            </h2>

            <div className="mt-4 overflow-hidden rounded-lg border border-border">
              {profile.bannerUrl ? (
                <img
                  src={profile.bannerUrl}
                  alt="Banner atual"
                  className="h-32 w-full object-cover"
                />
              ) : (
                <div className="h-32 w-full bg-surface-muted" />
              )}
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-foreground">
                  Avatar
                </label>
                {profile.avatarUrl && (
                  <img
                    src={profile.avatarUrl}
                    alt="Avatar atual"
                    className="mt-2 h-24 w-24 rounded-full object-cover"
                  />
                )}
                <input
                  type="file"
                  accept="image/*"
                  disabled={uploading !== null}
                  onChange={(event) =>
                    void handleAvatarUpload(event.target.files?.[0])
                  }
                  className="mt-2 block w-full text-sm text-foreground-subtle file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-2 file:text-sm file:font-medium file:text-primary-foreground hover:file:bg-primary-hover"
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
                  className="mt-2 block w-full text-sm text-foreground-subtle file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-2 file:text-sm file:font-medium file:text-primary-foreground hover:file:bg-primary-hover"
                />
                {uploading === "banner" && (
                  <p className="mt-1 text-xs text-foreground-muted">Enviando...</p>
                )}
              </div>
            </div>
          </Card>
        </section>

        <section aria-labelledby="bio-section">
          <Card className="p-6">
            <h2 id="bio-section" className="text-base font-semibold text-foreground">
              Biografia e apresentação
            </h2>
            <div className="mt-4 space-y-4">
              <Field id="bio" label="Biografia">
                <Textarea
                  id="bio"
                  value={form.bio}
                  onChange={(event) => update("bio", event.target.value)}
                  rows={3}
                />
              </Field>

              <Field id="presentationText" label="Apresentação">
                <Textarea
                  id="presentationText"
                  value={form.presentationText}
                  onChange={(event) =>
                    update("presentationText", event.target.value)
                  }
                  rows={4}
                />
              </Field>
            </div>
          </Card>
        </section>

        <section aria-labelledby="contacts-section">
          <Card className="p-6">
            <h2 id="contacts-section" className="text-base font-semibold text-foreground">
              Contatos
            </h2>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Field
                  id="whatsappValue"
                  label="WhatsApp"
                  help="Somente dígitos, com DDI. Ex.: 5511999998888."
                >
                  <Input
                    id="whatsappValue"
                    type="text"
                    placeholder="5511999998888"
                    value={form.whatsappValue}
                    onChange={(event) =>
                      update("whatsappValue", event.target.value)
                    }
                  />
                </Field>
                <Checkbox
                  id="whatsappEnabled"
                  label="Habilitar WhatsApp"
                  checked={form.whatsappEnabled}
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
                    value={form.discordUrl}
                    onChange={(event) => update("discordUrl", event.target.value)}
                  />
                </Field>
                <Checkbox
                  id="discordEnabled"
                  label="Habilitar Discord"
                  checked={form.discordEnabled}
                  onChange={(event) =>
                    update("discordEnabled", event.target.checked)
                  }
                />
              </div>
            </div>

            <div className="mt-4">
              <Field id="contactButtonText" label="Texto do botão de contato">
                <Input
                  id="contactButtonText"
                  type="text"
                  value={form.contactButtonText}
                  onChange={(event) =>
                    update("contactButtonText", event.target.value)
                  }
                />
              </Field>
            </div>
          </Card>
        </section>

        <div className="flex flex-wrap gap-2 border-t border-border pt-5">
          <Button type="submit" loading={saving}>
            {saving ? "Salvando..." : "Salvar perfil"}
          </Button>

          <Button variant="outline" onClick={() => setPreviewOpen(true)}>
            Prévia
          </Button>

          <Button variant="ghost" onClick={handleLeave}>
            Ver Feed
          </Button>
        </div>
      </form>

      <Dialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        title="Prévia do perfil"
        description="Como o perfil público aparecerá."
        size="lg"
      >
        <PublicArtistProfile artist={previewArtist} />
      </Dialog>

      <UnsavedChangesDialog
        open={confirmDiscard}
        onDiscard={() => {
          setConfirmDiscard(false)
          navigate("/")
        }}
        onKeepEditing={() => setConfirmDiscard(false)}
      />
    </PageContainer>
  )
}
