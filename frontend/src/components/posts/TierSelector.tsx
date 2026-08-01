import { useEffect, useState } from "react"
import { fetchTiers } from "../../services/tiers"
import type { Tier } from "../../services/tiers"

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
    return <p className="text-sm text-gray-600">Carregando tiers...</p>
  }

  if (error) {
    return <p className="text-sm text-red-700">{error}</p>
  }

  return (
    <div>
      <label
        htmlFor="tier"
        className="block text-sm font-medium text-gray-700"
      >
        Tier de acesso
      </label>

      <select
        id="tier"
        value={value ?? ""}
        onChange={(event) => onChange(event.target.value || null)}
        className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
      >
        <option value="">Público (sem restrição)</option>
        {tiers.map((tier) => (
          <option key={tier.id} value={tier.id}>
            {tier.name} (prioridade {tier.priority})
          </option>
        ))}
      </select>
    </div>
  )
}
