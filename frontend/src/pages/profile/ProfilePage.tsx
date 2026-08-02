import { useEffect, useState } from "react"
import type { FormEvent } from "react"
import { Link } from "react-router-dom"

import { useAuth } from "../../contexts/AuthContext"
import { fetchOwnProfile, updateOwnProfile } from "../../services/profile"
import { fetchArtistProfile, updateArtistProfile } from "../../services/artist"
import PageContainer from "../../components/ui/PageContainer"
import PageHeader from "../../components/ui/PageHeader"
import Card from "../../components/ui/Card"
import Field from "../../components/ui/Field"
import Input from "../../components/ui/Input"
import Textarea from "../../components/ui/Textarea"
import Button from "../../components/ui/Button"
import Alert from "../../components/ui/Alert"
import Skeleton from "../../components/ui/Skeleton"
import TierBadge from "../../components/auth/TierBadge"
import { buttonClasses } from "../../components/ui/button-styles"

interface ArtistProfileForm {
  name: string
  description: string
  bio: string
  avatarUrl: string
  bannerUrl: string
}

export default function ProfilePage() {
  const { canManageContent, user } = useAuth()
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
          const profile = await fetchOwnProfile()
          setName(profile.name ?? "")
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
    return (
      <PageContainer width="standard">
        <Skeleton className="h-10 w-1/3" />
        <Skeleton className="mt-6 h-72 w-full" />
      </PageContainer>
    )
  }

  return (
    <PageContainer width="standard">
      <PageHeader title="Meu perfil" description="Edite as informações básicas do seu perfil." />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <TierBadge
          tier={user?.tier ?? null}
          accessStatus={user?.tierAccessStatus}
          expiresAt={user?.tierExpiresAt}
          permanent={user?.tierPermanent}
        />
        <Link to="/profile/security" className={buttonClasses("ghost", "sm")}>
          Segurança da conta
        </Link>
      </div>

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

      <Card>
        <form onSubmit={handleSubmit} className="space-y-5 p-6">
          {isArtist ? (
            <>
              <Field id="name" label="Nome">
                <Input
                  id="name"
                  type="text"
                  value={artistForm.name}
                  onChange={(event) =>
                    setArtistForm((current) => ({
                      ...current,
                      name: event.target.value,
                    }))
                  }
                />
              </Field>

              <Field id="description" label="Descrição">
                <Input
                  id="description"
                  type="text"
                  value={artistForm.description}
                  onChange={(event) =>
                    setArtistForm((current) => ({
                      ...current,
                      description: event.target.value,
                    }))
                  }
                />
              </Field>

              <Field id="bio" label="Bio">
                <Textarea
                  id="bio"
                  value={artistForm.bio}
                  onChange={(event) =>
                    setArtistForm((current) => ({
                      ...current,
                      bio: event.target.value,
                    }))
                  }
                  rows={4}
                />
              </Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field id="avatarUrl" label="URL do avatar">
                  <Input
                    id="avatarUrl"
                    type="url"
                    value={artistForm.avatarUrl}
                    onChange={(event) =>
                      setArtistForm((current) => ({
                        ...current,
                        avatarUrl: event.target.value,
                      }))
                    }
                  />
                </Field>

                <Field id="bannerUrl" label="URL do banner">
                  <Input
                    id="bannerUrl"
                    type="url"
                    value={artistForm.bannerUrl}
                    onChange={(event) =>
                      setArtistForm((current) => ({
                        ...current,
                        bannerUrl: event.target.value,
                      }))
                    }
                  />
                </Field>
              </div>
            </>
          ) : (
            <Field id="name" label="Nome">
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
            </Field>
          )}

          <div className="flex gap-2">
            <Button type="submit" loading={saving}>
              {saving ? "Salvando..." : "Salvar perfil"}
            </Button>
          </div>
        </form>
      </Card>
    </PageContainer>
  )
}
