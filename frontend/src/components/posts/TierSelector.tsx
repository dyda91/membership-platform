import { useEffect, useState } from "react"
import { fetchTiers } from "../../services/tiers"
import type { Tier } from "../../services/tiers"
import Field from "../ui/Field"
import Select from "../ui/Select"

interface TierSelectorProps {
  value: string | null
  onChange: (tierId: string | null) => void
}

export default function TierSelector({ value, onChange }: TierSelectorProps) {
  const [tiers, setTiers] = useState<Tier[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchTiers()
      .then(setTiers)
      .catch(() => setError("Não foi possível carregar os tiers."))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return <p className="text-sm text-foreground-muted">Carregando tiers...</p>
  }

  if (error) {
    return <p className="text-sm text-danger-foreground">{error}</p>
  }

  return (
    <Field id="tier" label="Tier de acesso">
      <Select
        id="tier"
        value={value ?? ""}
        onChange={(event) => onChange(event.target.value || null)}
      >
        <option value="">Público (sem restrição)</option>
        {tiers.map((tier) => (
          <option key={tier.id} value={tier.id}>
            {tier.name} (prioridade {tier.priority})
          </option>
        ))}
      </Select>
    </Field>
  )
}
