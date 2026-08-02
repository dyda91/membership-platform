import Card from "../ui/Card"

export default function NoArtistConfiguredState() {
  return (
    <Card className="p-6">
      <h2 className="text-xl font-bold text-foreground">
        Perfil em configuração
      </h2>

      <p className="mt-2 text-sm text-foreground-muted">
        A página pública da artista ainda está sendo configurada.
      </p>
    </Card>
  )
}
